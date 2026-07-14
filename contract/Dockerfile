# syntax=docker/dockerfile:1
FROM nginx:1.27-alpine
COPY . /usr/share/nginx/html
# reaproveita o mecanismo de templating embutido na imagem oficial do nginx
# (roda envsubst em *.template antes do nginx subir, sem entrypoint próprio)
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/usr/share/nginx/html
ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html
ENV CONTRACT_API_URL=http://localhost:5000
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
