import type { DateTime, RecordId, LiveMessage } from "surrealdb";

export type News = {
  id: string;
  title: string;
  caption: string;
  date: Date;
  link: string;
  provider: string;
  note: string;
  rating?: number;
  rating_travel?: number;
  tags?: string[];
  html_body?: string;
  text_body?: string;
  used: boolean;
};

export type NewsRecord = Omit<News, "id" | "date"> & { id: RecordId; date: DateTime };

export function toNews(record: NewsRecord): News {
  return { ...record, id: record.id.toString(), date: record.date.toDate(),
    rating: record.rating ?? -1, rating_travel: record.rating_travel ?? -1 };
}
export function updateFeed(articles: News[], event: LiveMessage<NewsRecord>, region: string, now = Date.now()) {
  if (event.action === "KILLED") return;
  const index = articles.findIndex((n) => n.id === event.recordId.toString());
  if (event.action === "DELETE" || event.value.date.toDate().getTime() < now - 7 * 86400000 ||
      (region && !event.value.tags?.includes(region))) {
    if (index !== -1) articles.splice(index, 1);
    return;
  }
  const article = toNews(event.value);
  if (index === -1) articles.unshift(article);
  else articles[index] = article;
}
