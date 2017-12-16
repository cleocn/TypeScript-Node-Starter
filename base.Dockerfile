From node:8

LABEL "com.ideavip.vendor"="IdeaVip Incorporated"
LABEL version="1.0"
LABEL description=" by ljx "

RUN npm install cnpm -g --registry=https://registry.npm.taobao.org

RUN mkdir -p /app
WORKDIR /app

ADD . /app
RUN cnpm install
RUN cnpm run build

ONBUILD WORKDIR /app
ONBUILD RUN rm -rf /app/src
ONBUILD ADD . /app
# ONBUILD RUN cnpm install
ONBUILD RUN cnpm run build


# volume
# VOLUME ["/app/dist"]

EXPOSE  3000

# CMD ["npm", "run", "pm2"]
CMD ["node", "./dist/server.js"]
