// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
  ssr: false,

  app: {
    baseURL: process.env.BASE_URL || "/",
    head: {
      titleTemplate: "%s gusnews",
    },
  },

  runtimeConfig: {
    public: {
      surrealdb_urls: [
        "https://db.lemediapositif.com",
        "http://vps.mirsella.mooo.com:3000",
      ],
    },
  },

  ui: {
    icons: ["carbon", "heroicons"],
  },

  compatibilityDate: "2024-08-20",
});