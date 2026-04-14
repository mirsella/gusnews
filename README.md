# gusnews

Nuxt frontend for browsing and filtering news collected by [`news-scraper`](https://github.com/mirsella/news-scraper).

The app is client-side only and connects to SurrealDB endpoints configured in `nuxt.config.ts`.

## How It Works

On startup, the client races several configured SurrealDB endpoints and connects to the fastest reachable one. From there, it loads recent news, applies optional feed filters, and subscribes to live updates so the table can change without a full refresh.

Most of the browsing experience lives in the table UI: filtering, pagination, hidden columns, rating/date thresholds, and per-user preferences persisted in local storage.

## Run

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Notes

- This app is mainly useful when a compatible SurrealDB backend is available.
- It is intentionally `ssr: false`.
- The frontend is designed to pair with `news-scraper`, not replace it.
