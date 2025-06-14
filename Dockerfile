# Stage 1: Build
FROM node:18 AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

# Stage 2: Serve with nginx
FROM nginx:latest

COPY --from=builder /app/build /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
