get news where tags, url, title, caption, content match search terms for lme

https://surrealdb.com/blog/create-a-search-engine-with-surrealdb-full-text-search
https://docs.surrealdb.com/docs/surrealql/statements/define/analyzer/#tokenizers

```
DEFINE ANALYZER news_analyzer TOKENIZERS blank,class,camel,punct FILTERS ascii,lowercase

DEFINE INDEX news_title ON news FIELDS title SEARCH ANALYZER news_analyzer BM25(1.2,0.75);
DEFINE INDEX news_content ON news FIELDS text_body SEARCH ANALYZER news_analyzer BM25(1.2,0.75);
DEFINE INDEX news_tags ON news FIELDS tags SEARCH ANALYZER news_analyzer BM25(1.2,0.75);

SELECT id, title,
search::score(0) * 3 + search::score(1) * 2 + search::score(2) AS score
FROM news
WHERE title @0@ 'voyage' OR tags @1@ 'voyage' OR text_body @2@ 'voyage'
ORDER BY score DESC
LIMIT 10;
```
