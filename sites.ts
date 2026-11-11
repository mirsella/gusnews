// Build targets. Pick one with SITE=<name> at build time (default: gusnews).
export const sites = {
  gusnews: { title: "Gusnews", color: "green", defaultRating: "rating", logo: false },
  lmenews: { title: "Le Média Expérience", color: "blue", defaultRating: "rating_travel", logo: true },
} as const;

export type SiteName = keyof typeof sites;

export function siteName(value: string | undefined): SiteName {
  const name = value || "gusnews";
  if (!(name in sites)) throw new Error(`Unknown SITE "${name}". Expected one of: ${Object.keys(sites).join(", ")}`);
  return name as SiteName;
}
