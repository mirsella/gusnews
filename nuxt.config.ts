// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
  app: {
    baseURL: process.env.BASE_URL || "/",
    head: {
      titleTemplate: "LME %s",
    },
  },
  runtimeConfig: {
    public: {
      surrealdb_urls: [
        "https://db.lemediapositif.com",
        "http://intra.lemediapositif.com",
        "http://vps.mirsella.mooo.com:3000",
        "http://lmp.mirsella.mooo.com:8000",
      ],
    },
  },
  ui: {
    icons: ["carbon", "heroicons"],
  },
});
