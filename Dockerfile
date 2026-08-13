# Etapa 1: Compilación (Build)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
# angular.json ya trae defaultConfiguration: production
RUN npm run build

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copiamos los archivos compilados de la Etapa 1 a la carpeta pública de Nginx
COPY --from=build /app/dist/dashboard-biometrico/browser /usr/share/nginx/html
# Reemplaza el sitio por defecto: agrega el fallback de SPA y el proxy inverso hacia el backend
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Exponemos el puerto 80 del contenedor
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]