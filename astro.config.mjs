import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// Two build modes from one codebase:
//
// 1. Public site (default) -> static files for GitHub Pages: https://grugna.github.io/mamasay/
//    `npm run build`
//
// 2. Editor build (TINA_EDITOR=true) -> server-rendered on Cloudflare Pages, with the TinaCMS
//    admin at /admin and click-to-edit visual editing. Never shown to visitors.
//    `npm run build:editor`
//
// For a custom domain on the public site, set SITE_URL (e.g. https://mamasays.com) and BASE_PATH=/
const editor = process.env.TINA_EDITOR === 'true';

const config = {
  site: process.env.SITE_URL || 'https://grugna.github.io',
  base: editor ? '/' : process.env.BASE_PATH || '/mamasay',
  trailingSlash: 'ignore',
  vite: {
    define: { __TINA_EDITOR__: JSON.stringify(editor) },
    resolve: {
      alias: {
        '@tina-client': fileURLToPath(
          new URL(editor ? './tina/__generated__/client.ts' : './src/lib/tina-stub.ts', import.meta.url),
        ),
      },
    },
  },
};

if (editor) {
  const [{ default: cloudflare }, { default: tina }] = await Promise.all([
    import('@astrojs/cloudflare'),
    import('@tinacms/astro/integration'),
  ]);
  config.output = 'server';
  config.adapter = cloudflare();
  config.integrations = [tina()];
}

export default defineConfig(config);
