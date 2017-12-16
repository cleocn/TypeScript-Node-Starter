

#https://cloud.tencent.com/community/article/287910

#创建镜像 
docker build --tag="cleocn/xiaoniao:0.1" .

 docker build -t cleocn/xiaoniao-base -f ./base.Dockerfile  . --no-cache
 docker build -t cleocn/xiaoniao-api:4 . --no-cache

#运行容器 
docker run -p 3000:3000 -v ./config:/usr/src/node-tsapp/config --name xiaoniao cleocn/xiaoniao:0.1


docker run -p 3000:3000 -v /data/logs:/data/logs  --link mongo:mongo --name xiaoniao node-ts/xiaoniao:0.1

