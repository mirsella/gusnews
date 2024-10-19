<script setup lang="ts">
const { $db, $dbhelper } = useNuxtApp();
import type { News } from "~/utils/news";
const route = useRoute();
const news = useState<News[]>("news", () => []);

const region: string = route.params.feed as string;

const queryStatus = ref("waiting for the connection to the db...");
let queryLoading = ref(true);
onMounted(async () => {
  while (!$dbhelper.authenticated.value || !$dbhelper.activated.value) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  (async () => {
    queryStatus.value = "loading news...";
    queryLoading.value = true;
    await $db.ready;
    try {
      const t1 = performance.now();
      let result;
      if (region) {
        result = await $db.query<[News[]]>(
          "select * omit text_body, html_body from news where date >= time::now() - 1w AND $region INSIDE tags order by date desc",
          { region },
        );
      } else {
        result = await $db.query<[News[]]>(
          "select * omit text_body, html_body from news where date >= time::now() - 1w order by date desc",
        );
      }
      if (!result[0].length) throw new Error("no news found");
      result[0].forEach((n) => {
        if (n.rating === undefined) n.rating = -1;
        if (n.rating_travel === undefined) n.rating_travel = -1;
      });
      news.value = result[0] ?? [];
      const t2 = performance.now();
      const totaltime = (t2 - t1).toFixed(0);
      queryStatus.value = `loaded ${news.value.length} news in ${totaltime}ms.`;
      queryLoading.value = false;
    } catch (e: any) {
      if (import.meta.server) return;
      useToast().add({
        title: "Error querying news",
        description: e.toString(),
        color: "red",
        timeout: 0,
      });
    }
  })();

  try {
    await $db.wait();
    const liveQueryUuid = await $db?.live("news", ({ action, result }) => {
      if (!result) return;
      let new_news = result as News;
      if (new_news.rating === undefined) new_news.rating = -1;
      if (new_news.rating_travel === undefined) new_news.rating_travel = -1;
      if (!new_news.tags?.includes(region)) return;
      switch (action) {
        case "CREATE":
          news.value.unshift(new_news);
          break;
        case "UPDATE":
          const index = news.value.findIndex((n) => n.id === new_news.id);
          if (index !== -1) news.value[index] = result as News;
          break;
        case "DELETE":
          const index2 = news.value.findIndex((n) => n.id === new_news.id);
          if (index2 !== -1) news.value.splice(index2, 1);
          break;
      }
    });
    onUnmounted(async () => {
      await $db?.kill(liveQueryUuid);
    });
  } catch (e: any) {
    useToast().add({
      title: "Error starting live query",
      description: e.toString(),
      color: "red",
      timeout: 0,
    });
  }
});

const isOpen = computed<boolean>({
  get: () => route?.query.id !== undefined && route?.query.id !== "",
  set: (value: boolean) => {
    if (!value) navigateTo({ query: {} });
  },
});
const n = computed(() => {
  if (route.query.id) return news.value.find((n) => n.id === route.query.id);
});
</script>

<template>
  <div>
    <UModal
      v-model="isOpen"
      :transition="false"
      :ui="{ width: 'md:max-w-[80%]' }"
    >
      <NewsCard v-if="n?.id" :news="n" />
      <NotFound v-else class="m-4" />
    </UModal>
    <h1 class="text-lg font-bold w-full text-center">
      <UButton :label="queryStatus" loading v-if="queryLoading" class="mb-2" />
      <span v-else> {{ queryStatus }} </span>
    </h1>
    <NewsTable :loading="queryLoading" class="mx-4" />
  </div>
</template>
