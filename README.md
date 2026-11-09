# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
## Production analytics

Runtime settings: `NUXT_PUBLIC_POSTHOG_KEY` (public `phc_` project token), `NUXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`, and `NUXT_PUBLIC_POSTHOG_ENVIRONMENT=production`. Missing keys disable telemetry with a warning. Never put a personal PostHog API key in public configuration.

The client records anonymous pageviews, article link clicks, database/authentication state, and sanitized errors. Query strings, credentials, text autocapture, and session replay are excluded. Server request counts are separate from browser visits. Visit with `?telemetry_test=1` for validation; the traffic dashboard excludes these events. Browser blockers can prevent telemetry.

Count daily distinct browser IDs on `authenticated_visit` for logged-in activity. It fires after validated authentication, including restored JWTs, route changes, and visible focus/input on a new Paris calendar day. Idle tabs do not generate visits by timer. This counts active browsers, not distinct accounts. Browser logs override the SDK's full URL, and campaign/search parameters are excluded from events and person properties.

Run the focused telemetry tests with `bun test tests/telemetry.test.ts`.

[Production dashboard](https://eu.posthog.com/project/342382/dashboard/1099393). Build with `docker build --build-arg BASE_URL=/lmenews -f dockerfile .`; the runtime uses Node 22 and the existing Nuxt 3 dependencies.
