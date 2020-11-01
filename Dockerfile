FROM node:12-alpine AS builder
WORKDIR /usr/app

COPY ./package.json ./yarn.lock ./
RUN apk add --no-cache make gcc g++ python
RUN yarn install --frozen-lockfile --ignore-optional

COPY . .
RUN yarn run test && yarn run build

FROM node:12-alpine
ENV NODE_ENV=production

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY ./package.json ./yarn.lock ./
RUN apk add --no-cache tini && \
  apk add --no-cache --virtual build-deps make gcc g++ python && \
  yarn install --frozen-lockfile --production && \
  apk del build-deps && \
  yarn cache clean

COPY --from=builder --chown=node:node /usr/app/build ./build
USER node

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "."]
