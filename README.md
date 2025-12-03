# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
------

# Publicar `BASE_PATH` por variable de entorno

## La idea:

- svelte.config.js ya no decide el base por NODE_ENV,
- sino por una env variable BASE_PATH.
- Para IIS: BASE_PATH=/gtt/mfg/changeovers
- Para Docker: BASE_PATH='' (o /).


### 1. Cambia `svelte.config.js`

```js
import adapter from '@sveltejs/adapter-static';

const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false
    }),
    paths: {
      base
    }
  }
};

export default config;
```

### 2. Build para IIS (fuera de Docker)

Cuando vayas a generar el build para publicar en IIS:

```shell
# PowerShell
$env:BASE_PATH = "/gtt/mfg/changeovers"   # o "/ModelChangeoverWebClient", lo que uses
npm run build
```

Luego copias build/ al share, como ya lo hacías.

### 3. Dockerfile usando BASE_PATH propio

En el Dockerfile, antes del npm run build, mete esto:
```Dockerfile
# =========================
# Stage 1: Build SvelteKit
# =========================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY .npmrc .npmrc

RUN npm install

COPY . .

# <<< AQUI: base configurable para el contenedor
ARG BASE_PATH=""
ENV BASE_PATH=${BASE_PATH}

RUN npm run build
```

Y el resto igual:

```Dockerfile
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/build/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Ahora, al construir la imagen:

    docker build -t modelchangeover-webclient --build-arg BASE_PATH="" .
    docker run --rm -p 8080:80 modelchangeover-webclient


En Docker, `BASE_PATH=""` → los assets se sirven desde `/.`

En IIS, tú haces otro build con `BASE_PATH="/gtt/mfg/changeovers"` y sigues como antes.

### En resumen:

El error que ves en los logs es solo un mismatch de `paths.base` vs ruta real en Docker.

O cambias el `base` a `''` para ese build, o lo vuelves configurable con `BASE_PATH` y le das un valor distinto para IIS y para Docker.