FROM node:18

RUN     mkdir /app
WORKDIR /app

ADD     astro.config.mjs package.json yarn.lock /app/
ADD     lib /app/lib
ADD     prisma /app/prisma
ADD     public /app/public
ADD     src /app/src

ARG     DATABASE_URL
ENV     DATABASE_URL "postgres://motorsport_cal_v2:${DATABASE_URL}@motorsport-cal-v2-db.flycast:5432/motorsport_cal_v2?sslmode=disable"

RUN     yarn install --frozen-lockfile
RUN     yarn build
RUN     yarn migrate:deploy

CMD     HOST=0.0.0.0 PORT=8080 yarn start
