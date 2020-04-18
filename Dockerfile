FROM node:12.16.1-alpine3.11

WORKDIR /pyramidal_app_platform

COPY package.json yarn.lock ./
RUN yarn install
RUN yarn check

COPY . ./
RUN yarn build

CMD sh ./docker-entrypoint.sh ./
