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
        "http://127.0.0.1:8000",
        "https://db.lemediapositif.com",
        "https://moth-rare-precisely.ngrok-free.app",
      ],
    },
  },
  ui: {
    icons: ["carbon", "heroicons"],
  },
});
