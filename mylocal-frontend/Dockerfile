# Base image for building
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Base image for serving
FROM nginx:alpine

# Copy built assets to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Add a default configuration to support React/Vite client-side routing

RUN echo 'server {' > /etc/nginx/conf.d/default.conf \
    && echo '    listen 80;' >> /etc/nginx/conf.d/default.conf \
    && echo '    resolver 127.0.0.11 valid=30s;' >> /etc/nginx/conf.d/default.conf \
    && echo '    location /api/users {' >> /etc/nginx/conf.d/default.conf \
    && echo '        proxy_pass http://user-service:80/api/users;' >> /etc/nginx/conf.d/default.conf \
    && echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '    location /api/photos {' >> /etc/nginx/conf.d/default.conf \
    && echo '        proxy_pass http://media-service:80/api/photos;' >> /etc/nginx/conf.d/default.conf \
    && echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '    location /api/favorites {' >> /etc/nginx/conf.d/default.conf \
    && echo '        proxy_pass http://content-service:80/api/favorites;' >> /etc/nginx/conf.d/default.conf \
    && echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '    location /api/ {' >> /etc/nginx/conf.d/default.conf \
    && echo '        proxy_pass http://content-service:80/api/;' >> /etc/nginx/conf.d/default.conf \
    && echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '    location / {' >> /etc/nginx/conf.d/default.conf \
    && echo '        root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf \
    && echo '        index index.html index.htm;' >> /etc/nginx/conf.d/default.conf \
    && echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
