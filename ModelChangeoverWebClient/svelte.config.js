// export default config;
import adapter from '@sveltejs/adapter-static';

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
      // si en IIS lo vas a colgar en un virtual dir, ej. /GT_Trace/Changeover,
      // aquí pondrías base: '/GT_Trace/Changeover'
      //base: process.env.NODE_ENV === 'production' ? '/ModelChangeoverWebClient' : '' //IIS virtual dir example
      base: process.env.NODE_ENV === 'production' ? '/gtt/mfg/changeovers' : ''
    }
  }
};

export default config;
