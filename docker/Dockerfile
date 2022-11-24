FROM nginx:1.15.8-alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY dist /app

COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]