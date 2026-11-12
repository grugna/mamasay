import { defineConfig } from 'astro/config';

// GitHub Pages project site: https://grugna.github.io/mamasay/
// When you add a custom domain (e.g. mamasays.com), set SITE_URL to it and BASE_PATH to "/"
// (as repository variables in GitHub, or edit the defaults below).
export default defineConfig({
  site: process.env.SITE_URL || 'https://grugna.github.io',
  base: process.env.BASE_PATH || '/mamasay',
  trailingSlash: 'ignore',
});
