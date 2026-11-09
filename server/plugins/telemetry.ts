import { PostHog } from "posthog-node";

export default defineNitroPlugin((nitro) => {
  const config = useRuntimeConfig().public;
  if (!config.posthogKey) { console.warn("PostHog server telemetry disabled: missing project key"); return; }
  const service = "lmenews-server";
  const host = String(config.posthogHost).replace(/\/$/, "");
  const key = String(config.posthogKey);
  if (!key.startsWith("phc_") || !host.startsWith("https://")) throw new Error("PostHog requires HTTPS and a public project token");
  const properties = { service, environment: config.posthogEnvironment, $process_person_profile: false };
  const client = new PostHog(key, { host, flushAt: 20, flushInterval: 10000, enableExceptionAutocapture: false });
  const capture = (event: string, extra = {}) => client.capture({ distinctId: `service:${service}`, event,
    properties: { ...extra, ...properties } });
  const pending = new Set<Promise<void>>();
  const log = (body: string, level = "INFO", attributes: Record<string, string> = {}) => {
    if (pending.size >= 100) { console.warn("PostHog log queue full: dropping log"); return; }
    const delivery = (async () => { try {
      const response = await fetch(`${host}/i/v1/logs`, { method: "POST", signal: AbortSignal.timeout(5000),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ resourceLogs: [{ resource: { attributes: [
          { key: "service.name", value: { stringValue: service } },
          { key: "deployment.environment", value: { stringValue: String(config.posthogEnvironment) } },
        ] }, scopeLogs: [{ scope: { name: service }, logRecords: [{ timeUnixNano: `${Date.now()}000000`,
          severityText: level, severityNumber: level === "ERROR" ? 17 : 9, body: { stringValue: body },
          attributes: Object.entries(attributes).map(([key, value]) => ({ key, value: { stringValue: value } })),
        }] }] }] }) });
      if (!response.ok) console.warn(`PostHog log delivery failed: HTTP ${response.status}`);
    } catch { console.warn("PostHog log delivery failed (network/timeout)"); } })();
    pending.add(delivery);
    void delivery.finally(() => pending.delete(delivery));
  };
  capture("service_started");
  void log("Service started");
  const heartbeat = setInterval(() => capture("service_heartbeat"), 300000);
  heartbeat.unref();
  nitro.hooks.hook("request", (event) => { event.context.telemetryStarted = performance.now(); });
  nitro.hooks.hook("afterResponse", (event) => {
    const path = event.path.split("?")[0];
    if (/curl|wget|health/i.test(event.node.req.headers["user-agent"] || "") || path.includes("/_nuxt/") || /\.[a-z0-9]+$/i.test(path)) return;
    const properties = { path, method: event.method, status: event.node.res.statusCode,
      duration_ms: Math.round(performance.now() - event.context.telemetryStarted) };
    capture("website_http_request", properties);
    void log("HTTP request", "INFO", Object.fromEntries(Object.entries(properties).map(([k, v]) => [k, String(v)])));
  });
  nitro.hooks.hook("error", (error) => {
    client.captureException(new Error("Unhandled server error"), `service:${service}`, properties);
    void log("Unhandled server error", "ERROR", { error_type: error.name });
  });
  nitro.hooks.hook("close", async () => {
    clearInterval(heartbeat);
    capture("service_stopped");
    await Promise.allSettled([...pending]);
    await client.shutdown();
  });
});
