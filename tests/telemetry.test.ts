import { strict as assert } from "node:assert";
import { test } from "node:test";
import { cleanTelemetry } from "../utils/telemetry";
import posthog from "posthog-js";

test("removes credentials, campaigns and URL query/fragment data recursively", () => {
  assert.deepEqual(cleanTelemetry({
    url: "https://example.org/news?private=QUERY_SENTINEL#FRAGMENT_SENTINEL",
    nested: { email: "private@example.org", password: "PASSWORD_SENTINEL", authenticated: true },
    utm_source: "CAMPAIGN_SENTINEL", $initial_utm_campaign: "CAMPAIGN_SENTINEL",
    gclid: "CLICK_SENTINEL", $initial_fbclid: "CLICK_SENTINEL", ph_keyword: "SEARCH_SENTINEL",
    $search: "SEARCH_SENTINEL", $initial_hash: "FRAGMENT_SENTINEL",
    token: "phc_secret", messages: ["private@example.org phx_secret"],
  }), { url: "https://example.org/news", nested: { authenticated: true }, messages: ["[redacted] [redacted]"] });
});

test("preserves ingestion token, sanitizes browser logs, and tracks only authenticated activity", async () => {
  const globals = globalThis as any;
  const captures: { event: string; properties: any }[] = [];
  const watchers = new Map<any, (value: boolean) => void>();
  const hooks: Record<string, () => void> = {};
  let sdkConfig: any;
  let navigate: any;
  const authenticated = { value: false };
  const connected = { value: true };
  globals.location = new URL("https://example.org/news?private=QUERY_SENTINEL#FRAGMENT_SENTINEL");
  globals.window = new EventTarget();
  globals.document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  globals.defineNuxtPlugin = (plugin: any) => plugin;
  globals.useRuntimeConfig = () => ({ public: {
    posthogKey: "phc_test", posthogHost: "https://eu.i.posthog.com", posthogEnvironment: "test",
  } });
  globals.useRouter = () => ({ afterEach: (callback: any) => { navigate = callback; } });
  globals.watch = (ref: any, callback: any, options: any) => {
    watchers.set(ref, callback);
    if (options?.immediate) callback(ref.value);
  };
  posthog.init = ((_key: string, config: any) => { sdkConfig = config; return posthog; }) as any;
  posthog.register = () => {};
  posthog.capture = ((event: string, properties: any) => { captures.push({ event, properties }); }) as any;
  Object.defineProperty(posthog, "logger", { configurable: true, value: { info() {} } });
  const plugin = (await import("../plugins/00.posthog.client")).default;
  (plugin as any)({ $dbhelper: { connected, authenticated }, hook: (name: string, callback: any) => { hooks[name] = callback; } });
  hooks["app:mounted"]();
  const visits = () => captures.filter(({ event }) => event === "authenticated_visit").length;
  assert.equal(visits(), 0);
  watchers.get(authenticated)!(true);
  assert.equal(visits(), 1);
  navigate({ path: "/next" }, { path: "/news" });
  assert.equal(visits(), 2);
  globals.document.dispatchEvent(new Event("pointerdown"));
  assert.equal(visits(), 2);
  const realDate = Date.prototype.toLocaleDateString;
  try {
    Date.prototype.toLocaleDateString = () => "next-calendar-day";
    globals.document.visibilityState = "hidden";
    globals.window.dispatchEvent(new Event("focus"));
    assert.equal(visits(), 2);
    globals.document.visibilityState = "visible";
    globals.document.dispatchEvent(new Event("pointerdown"));
    assert.equal(visits(), 3);
    globals.document.dispatchEvent(new Event("keydown"));
    assert.equal(visits(), 3);
  } finally { Date.prototype.toLocaleDateString = realDate; }
  watchers.get(authenticated)!(false);
  navigate({ path: "/login" }, { path: "/next" });
  assert.equal(visits(), 3);
  assert.equal(captures.filter(({ event }) => event === "$pageview").at(-1)?.properties.authenticated, false);

  const event = sdkConfig.before_send({ properties: { token: "phc_test", url: globals.location.href, utm_source: "CAMPAIGN_SENTINEL" } });
  assert.equal(event.properties.token, "phc_test");
  assert.equal(event.properties.url, "https://example.org/news");
  assert.equal(event.properties.utm_source, undefined);
  const log = sdkConfig.logs.beforeSend({ body: "Connection changed", attributes: { "url.full": globals.location.href } });
  assert.equal(log.attributes["url.full"], "https://example.org/news");
  assert.ok(!JSON.stringify(log).includes("SENTINEL"));
});
