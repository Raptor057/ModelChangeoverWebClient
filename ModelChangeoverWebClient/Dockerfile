# how build whith base path configurable
# docker build -t model-change-over-web-client:latest --build-arg BASE_PATH="" .

# =========================
# Stage 1: Build SvelteKit
# =========================
FROM node:20-alpine AS build

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo lo necesario para instalar deps
COPY package*.json ./
COPY .npmrc .npmrc

# Instalar dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# <<< AQUI: base configurable para el contenedor
ARG BASE_PATH=""
ENV BASE_PATH=${BASE_PATH}

# Build de producción (usa adapter-static y genera /build)
RUN npm run build

# =========================
# Stage 2: Servir con nginx
# =========================
FROM nginx:1.27-alpine AS runtime

# Limpiamos contenido default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiamos el build estático al directorio público de nginx
COPY --from=build /app/build/ /usr/share/nginx/html/

# Exponemos el puerto HTTP
EXPOSE 80

# Arrancamos nginx en foreground
CMD ["nginx", "-g", "daemon off;"]
