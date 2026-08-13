# Etapa 1: Compilación (Build)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copiamos los archivos compilados de la Etapa 1 a la carpeta pública de Nginx
COPY --from=build /app/dist/dashboard-biometrico/browser /usr/share/nginx/html
# Exponemos el puerto 80 del contenedor
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]