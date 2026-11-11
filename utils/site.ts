import { sites, type SiteName } from "~/sites";

// The build sets appConfig.site from SITE; anything else is a broken build.
export function useSite() {
  const name = useAppConfig().site;
  if (typeof name !== "string" || !(name in sites)) throw new Error(`Invalid appConfig.site: ${String(name)}`);
  return { name: name as SiteName, ...sites[name as SiteName] };
}
