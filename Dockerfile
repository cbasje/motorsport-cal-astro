FROM node:18

RUN     mkdir /app
WORKDIR /app

ADD     astro.config.mjs svelte.config.js postcss.config.cjs tsconfig.json package.json yarn.lock /app/
ADD     lib /app/lib
ADD     prisma /app/prisma
ADD     public /app/public
ADD     src /app/src

ARG     DATABASE_PW
ENV     DATABASE_URL "postgres://postgres:${DATABASE_PW}@motorsport-cal-db.flycast:5432?sslmode=disable"

RUN     yarn install --frozen-lockfile
RUN     yarn build
RUN     yarn migrate:deploy
RUN     yarn postinstall

CMD     yarn start
