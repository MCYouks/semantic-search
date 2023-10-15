// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["nuxt-lodash", "@nuxtjs/tailwindcss", "@vueuse/nuxt"],

  runtimeConfig: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
  },

  lodash: {
    prefix: "_",
    upperAfterPrefix: false,
  },

  components: [
    {
      path: "~/components/ui",
      extensions: [".vue"],
      prefix: "Ui",
    },
  ],
});
