<script setup lang="ts">
const { $db, $dbhelper } = useNuxtApp();
import { toNews, updateFeed, type News, type NewsRecord } from "~/utils/news";
import { Table } from "surrealdb";
const route = useRoute();
const news = useState<News[]>("news", () => []);

const region: string = route.params.feed as string;

const queryStatus = ref("waiting for the connection to the db...");
let queryLoading = ref(true);
watch(
  () => $dbhelper.authenticated.value && $dbhelper.activated.value,
  async (ready, _, onCleanup) => {
    if (!ready) return;
    const controller = new AbortController();
    onCleanup(() => controller.abort());
    queryStatus.value = "loading news...";
    queryLoading.value = true;
    await $db.ready;
    try {
      const t1 = performance.now();
      let result;
      if (region) {
        result = await $db.query<[NewsRecord[]]>(
          "select * omit text_body, html_body from news where date >= time::now() - 1w AND $region INSIDE tags order by date desc",
          { region },
        );
      } else {
        result = await $db.query<[NewsRecord[]]>(
          "select * omit text_body, html_body from news where date >= time::now() - 1w order by date desc",
        );
      }
      if (controller.signal.aborted) return;
      news.value = result[0].map(toNews);
      const t2 = performance.now();
      const totaltime = (t2 - t1).toFixed(0);
      queryStatus.value = `loaded ${news.value.length} news in ${totaltime}ms.`;
      queryLoading.value = false;
      const live = await $db.withSignal(controller.signal).live<NewsRecord>(new Table("news"));
      live.subscribe((event) => updateFeed(news.value, event, region));
    } catch (e: any) {
      if (controller.signal.aborted) return;
      useToast().add({
        title: "Error querying news",
        description: e.toString(),
        color: "red",
        timeout: 0,
      });
    }
  },
  { immediate: true },
);

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
