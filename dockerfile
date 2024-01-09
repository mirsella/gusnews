FROM node:21.0-alpine3.17

ARG BASE_URL
ENV BASE_URL=$BASE_URL
WORKDIR /app

COPY . .

RUN apk add --no-cache curl
RUN npm i -g pnpm && pnpm i && pnpm build

CMD ["node", ".output/server/index.mjs"]

HEALTHCHECK --start-period=5s --timeout=3s --retries=3 CMD curl -v http://127.0.0.1:3000${BASE_URL} || exit 1

EXPOSE 3000
