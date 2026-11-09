const privateProperty = /password|authorization|cookie|token|email|^(?:\$initial_|initial_)?(?:utm_|\w*clid$|gbraid$|wbraid$|ph_keyword$)|^\$(?:initial_)?(?:search|hash)$/i;

export function cleanTelemetry(value: unknown): any {
  if (typeof value === "string") {
    return value.replace(/https?:\/\/[^\s"<>]+/g, (url) => {
      try { const parsed = new URL(url); return parsed.origin + parsed.pathname; }
      catch { return "[invalid URL]"; }
    }).replace(/\b(?:sk-|phc_|phx_)[\w-]+|eyJ[\w.-]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[redacted]");
  }
  if (Array.isArray(value)) return value.map(cleanTelemetry);
  if (value && typeof value === "object") return Object.fromEntries(
    Object.entries(value).filter(([key]) => !privateProperty.test(key)).map(([key, item]) => [key, cleanTelemetry(item)]),
  );
  return value;
}
