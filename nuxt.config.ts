// https://nuxt.com/docs/api/configuration/nuxt-config
import { siteName } from "./sites";

const site = siteName(process.env.SITE);
const baseURL = process.env.BASE_URL || "/";

export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
  ssr: false,

  app: {
    baseURL,
    head: {
      titleTemplate: `%s ${site}`,
      link: [{ rel: "icon", type: "image/ico", href: `${baseURL.replace(/\/$/, "")}/favicon.ico` }],
    },
  },

  // Each site has its own public dir (favicon).
  dir: { public: `public/${site}` },

  appConfig: { site },

  runtimeConfig: {
    public: {
      posthogKey: "",
      posthogHost: "https://eu.i.posthog.com",
      posthogEnvironment: "production",
      surrealdb_urls: [
        "https://db.lemediapositif.com",
        "http://db.lemediapositif.com",
        "http://vps.mirsella.mooo.com:8000",
        "http://intra.lemediapositif.com:8000",
      ],
    },
  },

  ui: {
    icons: ["carbon", "heroicons"],
  },

  compatibilityDate: "2024-08-20",
});
