<script setup lang="ts">
// Nuxt UI's default primary wins over nuxt.config appConfig, so set it here.
useAppConfig().ui.primary = useSite().color;
onMounted(async () => {
  const jwt = window?.localStorage.getItem("jwt");
  if (!jwt) navigateTo("/login");
});
</script>

<template>
  <Header />
  <NuxtPage />
  <UNotifications />
</template>
