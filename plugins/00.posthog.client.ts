import posthog from "posthog-js";
import type { Ref } from "vue";
import { cleanTelemetry as clean } from "../utils/telemetry";

export default defineNuxtPlugin((app) => {
  const config = useRuntimeConfig().public;
  if (!config.posthogKey) {
    console.warn("PostHog disabled: NUXT_PUBLIC_POSTHOG_KEY is not configured");
    return;
  }
  const currentUrl = () => location.origin + location.pathname;
  posthog.init(String(config.posthogKey), {
    api_host: String(config.posthogHost),
    ui_host: "https://eu.posthog.com",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    disable_session_recording: true,
    person_profiles: "identified_only",
    persistence: "localStorage",
    save_campaign_params: false,
    save_referrer: false,
    property_denylist: ["$search", "$initial_search", "$hash", "$initial_hash"],
    mask_all_text: true,
    mask_all_element_attributes: true,
    logs: { serviceName: "gusnews-web", environment: String(config.posthogEnvironment), captureConsoleLogs: false,
      beforeSend: (record) => ({ ...record, body: clean(record.body),
        attributes: { ...clean(record.attributes), "url.full": currentUrl() } }),
    },
    before_send: (event) => {
      if (event) {
        // This public project token is required by ingestion, unlike user/API credentials.
        const token = event.properties.token;
        event.properties = { ...clean(event.properties), token };
        if (event.$set) event.$set = clean(event.$set);
        if (event.$set_once) event.$set_once = clean(event.$set_once);
      }
      return event;
    },
  });
  posthog.register({ service: "gusnews-web", site: "gusnews", environment: config.posthogEnvironment,
    telemetry_test: new URLSearchParams(location.search).get("telemetry_test") === "1" });
  let authenticated = false;
  let lastVisitDate = "";
  const visitDate = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
  const visit = () => {
    if (!authenticated || document.visibilityState !== "visible") return;
    posthog.capture("authenticated_visit", { $current_url: currentUrl(), authenticated: true });
    lastVisitDate = visitDate();
  };
  const view = () => {
    posthog.capture("$pageview", { $current_url: currentUrl(), authenticated });
    visit();
  };
  app.hook("app:mounted", () => {
    const helper = app.$dbhelper as { connected: Ref<boolean>; authenticated: Ref<boolean> } | undefined;
    if (helper) {
      watch(helper.connected, (connected) => {
        posthog.capture("database_connection_changed", { connected });
        posthog.logger.info("Database connection changed", { connected });
      }, { immediate: true });
      watch(helper.authenticated, (value) => {
        authenticated = value;
        posthog.register({ authenticated });
        posthog.capture("authentication_changed", { authenticated });
        visit();
      }, { immediate: true });
    }
    view();
  });
  const active = () => { if (authenticated && visitDate() !== lastVisitDate) visit(); };
  window.addEventListener("focus", active);
  document.addEventListener("visibilitychange", active);
  document.addEventListener("pointerdown", active);
  document.addEventListener("keydown", active);
  useRouter().afterEach((to, from) => { if (to.path !== from.path) view(); });
  app.hook("vue:error", (error) => { posthog.captureException(new Error(clean(String(error)))); });
  app.hook("app:error", (error) => { posthog.captureException(new Error(clean(String(error)))); });
  document.addEventListener("click", (event) => {
    const link = (event.target as Element)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (link && /^https?:$/.test(link.protocol) && link.origin !== location.origin) {
      posthog.capture("article_link_clicked", { destination_host: link.hostname });
    }
  });
  return { provide: { posthog } };
});
