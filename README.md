# mamasays landing page

Static landing page (Astro) hosted on GitHub Pages at https://mamasaystoday.com (custom domain; see
[Domain setup](#domain-setup-godaddy--github-pages)).

## Editing content (no code)

Use the TinaCMS visual editor (after the one-time setup below is done):

1. Open the editor: `https://<your-cloudflare-pages-address>/admin` and sign in with Tina.
2. The live page appears next to the editing form. **Click any text or photo on the page** and its field opens in the form.
3. Change it and press **Save**. The change is committed to GitHub and the public site republishes in about a minute.

Text formatting inside paragraphs: `**bold**`, `*italic*`, `__big accent__`, `[link text](mailto:you@example.com)`.
To replace a photo, upload a new one in the image field and keep the description (alt text) accurate.
Not everything on the page is clickable (e.g. colors, settings, tracking); those are in the form on the left.
Everything lives in `src/content/site.json`, so it can also be edited directly on GitHub.

Bigger **design changes** (layout, new sections) are done in a Claude artifact and handed to a developer; see
[Design changes from Claude artifacts](#design-changes-from-claude-artifacts).

## How the two deployments fit together

```
                         ┌──────────────────────────────┐
 Editor (Tina admin) ───►│ Cloudflare Pages  (editor)   │  server-rendered build, visual editing
                         └──────────────┬───────────────┘
                                        │ Save = commit to GitHub (via Tina Cloud)
                                        ▼
                               GitHub repo (main)
                                        │ push triggers
                                        ▼
                         ┌──────────────────────────────┐
 Visitors ──────────────►│ GitHub Pages  (public site)  │  plain static files, no CMS code
                         └──────────────────────────────┘
```

- **Why two?** Tina's visual editing for Astro needs a small server route that GitHub Pages cannot run. Cloudflare Pages
  runs it for editors only; visitors never touch it, so Cloudflare's free limits are irrelevant to site traffic.
- Same code, two build modes (`astro.config.mjs`): `npm run build` (public, static) and `npm run build:editor`
  (`TINA_EDITOR=true`, server-rendered, includes the Tina admin). The public HTML contains no Tina code.

## One-time setup for the editor (TinaCMS + Cloudflare)

1. **Tina Cloud project:** sign up at https://app.tina.io, create a project, connect the `grugna/mamasay` repo
   (branch `main`). Copy the **Client ID** and a **Read-only token**. Under *Configuration > Site URLs* add the
   Cloudflare address from step 2. (Free plan: 2 users.)
2. **Cloudflare Pages:** at https://dash.cloudflare.com > *Workers & Pages* > *Create* > *Pages* > connect the GitHub repo.
   - Build command: `npm run build:editor`
   - Build output directory: `dist`
   - Environment variables: `TINA_CLIENT_ID`, `TINA_TOKEN` (from step 1), `NODE_VERSION` = `22`
   - `wrangler.toml` already enables the `nodejs_compat` flag Tina needs.
3. Open `https://<project>.pages.dev/admin`, sign in, and edit.

For local work: copy `.env.example` to `.env`, then `npm run dev:editor` (admin at http://localhost:4321/admin/).
Without Tina Cloud credentials it runs in local mode and edits `site.json` on disk.

> Status: the editor build and local editing are tested. The Cloudflare deployment itself needs a first-run check once the
> Tina Cloud / Cloudflare accounts exist (worker runtime, Tina Cloud auth).

## Initial setup record (what was configured and where)

### Domain setup (GoDaddy + GitHub Pages)

Domain: `mamasaystoday.com` (registrar/DNS: GoDaddy). Email on the domain is Microsoft 365, so **never delete the MX/TXT records**.

1. **Repo variables** (GitHub > Settings > Secrets and variables > Actions > Variables):
   `SITE_URL=https://mamasaystoday.com`, `BASE_PATH=/`. With a custom domain the site is served from the root, so the base path must be `/`.
2. **GitHub Pages** (Settings > Pages): source = *GitHub Actions*, custom domain = `mamasaystoday.com`, then tick *Enforce HTTPS* once the certificate is issued.
3. **GoDaddy DNS** (My Products > domain > DNS):

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `grugna.github.io` |

   (GoDaddy's default "parked" A records must be removed. Current GitHub Pages IPs:
   https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)
4. DNS can take minutes to a few hours. Check with `dig +short mamasaystoday.com`.
5. Afterwards: update the GA4 data stream URL and (once the editor exists) add the domain to Tina Cloud's Site URLs.
   An editor subdomain such as `edit.mamasaystoday.com` can later be a CNAME to the Cloudflare Pages project.

### Customer.io (sign-ups)

- Source: **Data & Integrations > Integrations > JavaScript** source in the *Mamasays* workspace (US data center).
- The **public** write key (`pk_us_...`) is stored in `src/content/site.json` > `tracking.customerIoWritePublicKey`, region in `customerIoRegion`.
  Public keys are designed to be exposed in the page. Never commit an `sk_` key or a Track API key.
- The form posts one batch (identify + track) to `https://cdp.customer.io/v1/b` as `text/plain` with the key in the body, the same format as Customer.io's own SDK (the API doesn't answer CORS preflights, so JSON + an Authorization header fails in browsers; see `src/scripts/tracking.ts`); the official
  Customer.io snippet is intentionally not used (it would set cookies and need consent handling).
- The source's *Complete setup* button in Customer.io stays disabled until it has received data: submit a test sign-up (or send an identify call), then click *Test connection*.
- Build the welcome campaign on the `waitlist_signup` event. Delete test people (e.g. `claude-setup-test@example.com`) when done.

### Google Analytics 4

- Property/web data stream in https://analytics.google.com; the Measurement ID (`G-...`, public) is `tracking.ga4MeasurementId` in `site.json`.
- Verify in *Reports > Realtime* (accept the cookie banner first if testing from the EU/California). Mark `sign_up` as a key event under *Admin > Events*.
- Update the data stream URL to `https://mamasaystoday.com`.

## Design changes from Claude artifacts

Layout and design iterations happen in a Claude artifact, not in the CMS.

1. Export the finished artifact HTML into `design/` (e.g. `design/mockup-v2.html`) and commit it (or send it to a developer).
2. A developer, or Claude Code in this repo, diffs it against `design/mockup-hybrid.html` and ports the changes into
   `src/pages/index.astro`, keeping copy in `src/content/site.json`, then adds the matching field to `tina/config.ts`.
3. Text, photo and color tweaks should skip this and go through the Tina visual editor.

## Integrations (developer / one-time setup)

Set these in **Website content > Tracking & integrations** (or `src/content/site.json` > `tracking`):

| Field | What |
|---|---|
| `ga4MeasurementId` | GA4 Measurement ID, `G-XXXXXXXXXX` |
| `customerIoWritePublicKey` | Customer.io **public** write key (`pk_...`) from a JavaScript / Data Pipelines source |
| `customerIoRegion` | `us` or `eu`, matching your Customer.io data center |

While values contain `XXXX` the integrations are off (sign-up shows an error in production).

- **Sign-ups** call the Customer.io Data Pipelines API (`identify` + a `waitlist_signup` track event, user ID = email,
  trait `first_name` when given). Build your welcome campaign on the `waitlist_signup` event.
  No Customer.io cookies/scripts are loaded, so sign-up works whether or not analytics is accepted.
- **Google Analytics** loads immediately for visitors outside the EU/EEA/UK/Switzerland and California.
  For visitors inside those regions a cookie banner is shown, and GA only loads after they accept
  (Global Privacy Control is treated as a decline). The region comes from an IP lookup (`ipwho.is`);
  if it fails, the browser time zone is used. Lists of countries / US states are editable in `tracking`.
  A `sign_up` event is sent to GA on a successful sign-up (only when analytics is loaded).

## Tech stack

How a change travels: **editor saves in TinaCMS → commit to GitHub → GitHub Actions builds with Astro → GitHub Pages serves the static files.**

| Piece | What it does here | Where it's configured | Docs |
|---|---|---|---|
| **Astro** (v5) | Static site generator. Turns `src/pages/index.astro` + `src/content/site.json` into plain HTML/CSS/JS in `dist/`. No server, no database. | `astro.config.mjs` (`site` and `base` URLs); page template in `src/pages/index.astro` | https://docs.astro.build |
| **Node.js / npm** | Runs Astro locally and in CI. Node 22 (see `.nvmrc`; Tina's CLI requires 22+). | `package.json`, `package-lock.json` | https://nodejs.org |
| **TypeScript** | Client scripts in `src/scripts/` (type-checked and bundled by Astro, no extra config). | Astro defaults | https://docs.astro.build/en/guides/typescript/ |
| **`src/content/site.json`** | Single source of truth for all copy, image paths, palette colors, toggles and integration keys. The page reads it as `c`. | Edit directly, or via the TinaCMS editor | n/a |
| **TinaCMS** | Visual editor: shows the live page beside a form, click any element to edit it, saves as a Git commit via Tina Cloud (free plan: 2 users). Its schema (which fields exist) is `tina/config.ts`; `src/lib/content.ts` + `data-tina-field` attributes in `index.astro` make elements clickable. Only used in the editor build. | `tina/config.ts`; env `TINA_CLIENT_ID`, `TINA_TOKEN` | https://tina.io/docs and https://tina.io/docs/frameworks/astro |
| **Cloudflare Pages** | Hosts the *editor build* only (needs a server route for live preview). Free tier: 500 builds/month. | `wrangler.toml`; project settings in the Cloudflare dashboard | https://developers.cloudflare.com/pages |
| **React** | Dependency of TinaCMS's admin UI only; the website itself ships no React. | n/a | https://react.dev |
| **GitHub Pages** | Free static hosting at `mamasaystoday.com` (fallback `grugna.github.io/mamasay`). Source is set to "GitHub Actions". | Repo **Settings > Pages**; custom domain goes here too | https://docs.github.com/pages |
| **GitHub Actions** | On every push to `main`: `npm ci`, `npm run build`, publish `dist/`. | `.github/workflows/deploy.yml`; optional repo variables `SITE_URL`, `BASE_PATH` | https://docs.github.com/actions |
| **Customer.io** (Data Pipelines API) | Receives sign-ups from the form (`identify` + `waitlist_signup` event) via a public `pk_` key. | `tracking` block in `site.json`; code in `src/scripts/tracking.ts` | https://docs.customer.io/integrations/api/cdp/ |
| **Google Analytics 4** | Page and `sign_up` analytics, loaded via `gtag.js` (consent-gated in EU/UK/CH/California). | `tracking.ga4MeasurementId`; code in `src/scripts/tracking.ts` | https://support.google.com/analytics |
| **ipwho.is** | Free IP-to-country/region lookup used only to decide whether to show the cookie banner. | `src/scripts/consent.ts` | https://ipwho.is |

### Project layout

```
tina/config.ts             TinaCMS schema (what editors can change, in page order)
wrangler.toml              Cloudflare Pages settings for the editor deployment
.env.example               TINA_CLIENT_ID / TINA_TOKEN template
astro.config.mjs           Site URL + base path, and the public vs editor build modes
.github/workflows/         Build + deploy pipeline
design/mockup-hybrid.html  Original design export (reference only)
public/                    Served as-is: fonts/ (self-hosted), images/, favicon.svg
src/content/site.json      All editable content and settings
src/pages/index.astro      The page template (HTML + inline styles from the mockup)
src/styles/global.css      Global CSS, animations, cookie-banner styles
src/lib/content.ts         Loads site.json (public build) or reads via Tina (editor build)
src/lib/inline.ts          Converts **bold** / *italic* / links typed in the CMS to safe HTML
src/lib/pill-layout.json   Positions/timing of the floating "moments" in the blur section
src/scripts/               Browser code: motion.ts (scroll reveal, pause toggle), signup.ts (forms),
                           tracking.ts (GA4 + Customer.io), consent.ts (region check + banner)
```

### Common developer tasks

- **Add an editable field:** add it to `src/content/site.json`, render it in `src/pages/index.astro` (as `{c.section.field}`) with `data-tina-field={tf(c.section, 'field')}` on the element, and add it to `tina/config.ts` so it shows in the editor.
- **Change colors / animation speed:** `palette` and `settings.motion` in `site.json`.
- **Add an image:** put it in `public/images/` and reference it as `/images/name.jpg` (the page prepends the base path).
- **Change who sees the cookie banner:** `tracking.consentCountries` / `tracking.consentUsStates`.
- **Move to a custom domain:** set repo variables `SITE_URL` and `BASE_PATH=/`, then add the domain under Settings > Pages.
- **Swap the CMS:** it only edits `site.json`, so another Git-based CMS can replace Tina without touching the page design.

## Development

```bash
npm install
npm run dev            # public site, http://localhost:4321/mamasay/
npm run build          # public static build (what GitHub Pages serves)
npm run dev:editor     # editor + Tina admin, http://localhost:4321/admin/
npm run build:editor   # editor build for Cloudflare (needs TINA_CLIENT_ID / TINA_TOKEN)
```

Deploys automatically on every push to `main` (`.github/workflows/deploy.yml`).
For a custom domain, set repository variables `SITE_URL` (e.g. `https://mamasays.com`) and `BASE_PATH` (`/`).

`design/mockup-hybrid.html` is the original exported design mockup, kept for reference.
