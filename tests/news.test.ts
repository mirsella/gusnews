import { test } from "node:test";
import assert from "node:assert/strict";
import { DateTime, RecordId, Uuid, type LiveMessage } from "surrealdb";
import { toNews, updateFeed, type News, type NewsRecord } from "../utils/news";

const now = Date.now();
const record: NewsRecord = {
  id: new RecordId("news", "id:with:colons"), date: new DateTime(new Date(now)),
  title: "Test", caption: "", link: "https://example.com", provider: "test", note: "",
  used: false, tags: ["fr"],
};
const event = (action: "CREATE" | "UPDATE" | "DELETE", value = record) => ({
  queryId: Uuid.v4(), action, recordId: value.id, value,
}) as LiveMessage<NewsRecord>;

test("normalizes typed IDs, dates and missing ratings", () => {
  const article = toNews(record);
  assert.equal(article.id, record.id.toString());
  assert.equal(article.date.getTime(), now);
  assert.equal(article.rating, -1);
});

test("empty and unfiltered feeds receive creates without duplicates", () => {
  const articles: News[] = [];
  updateFeed(articles, event("CREATE"), "", now);
  updateFeed(articles, event("CREATE"), "", now);
  assert.equal(articles.length, 1);
});

test("historical updates cannot enter the one-week feed", () => {
  const articles: News[] = [];
  updateFeed(articles, event("UPDATE", { ...record, date: new DateTime(new Date(now - 61 * 86400000)) }), "fr", now);
  assert.equal(articles.length, 0);
});

test("updates leaving the region and deletes remove existing articles", () => {
  const articles = [toNews(record)];
  updateFeed(articles, event("UPDATE", { ...record, tags: ["de"] }), "fr", now);
  assert.equal(articles.length, 0);
  articles.push(toNews(record));
  updateFeed(articles, event("DELETE"), "fr", now);
  assert.equal(articles.length, 0);
});
