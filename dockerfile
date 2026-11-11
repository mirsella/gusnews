FROM node:22-alpine AS build
# Build target from sites.ts: gusnews or lmenews.
ARG SITE=gusnews
ARG BASE_URL=/$SITE
ENV SITE=$SITE BASE_URL=$BASE_URL
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM node:22-alpine
ARG SITE=gusnews
ARG BASE_URL=/$SITE
ENV NODE_ENV=production BASE_URL=$BASE_URL
WORKDIR /app
COPY --from=build /app/.output ./.output
CMD ["node", ".output/server/index.mjs"]
HEALTHCHECK --start-period=5s --timeout=3s --retries=3 CMD wget -q -O /dev/null "http://127.0.0.1:3000$BASE_URL" || exit 1
EXPOSE 3000
