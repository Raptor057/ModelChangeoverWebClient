//Cuando vayas a generar el build para publicar en IIS:
//# PowerShell
//$env:BASE_PATH = "/gtt/mfg/changeovers"   # o "/ModelChangeoverWebClient", lo que uses
//npm run build

// export default config;
import adapter from '@sveltejs/adapter-static';

const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // para que funcione como SPA
      precompress: false,
      strict: false
    }),
    paths: {
      
      // Estas 2 lineas son ejemplos de como configurar la base path para despliegues en IIS con virtual directories
      //base: process.env.NODE_ENV === 'production' ? '/ModelChangeoverWebClient' : '' //IIS virtual dir example
      //base: process.env.NODE_ENV === 'production' ? '/gtt/mfg/changeovers' : ''

      // Configuracion general usando variable de entorno
       base
    }
  }
};

export default config;
