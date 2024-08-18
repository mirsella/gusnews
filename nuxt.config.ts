// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
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
        "https://moth-rare-precisely.ngrok-free.app",
        "http://vps.mirsella.mooo.com:3000",
      ],
    },
  },
  ui: {
    icons: ["carbon", "heroicons"],
  },
});
