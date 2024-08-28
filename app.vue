<script setup lang="ts">
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
