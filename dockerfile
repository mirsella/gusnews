FROM node:22-alpine AS build
ARG BASE_URL=/lmenews
ENV BASE_URL=$BASE_URL
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/.output ./.output
CMD ["node", ".output/server/index.mjs"]
HEALTHCHECK --start-period=5s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:3000/lmenews || exit 1
EXPOSE 3000
