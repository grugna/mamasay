# mamasays landing page

Static landing page (Astro) hosted on GitHub Pages: https://grugna.github.io/mamasay/

## Editing content (no code)

1. Go to https://app.pagescms.org and sign in with GitHub (you need write access to this repo).
2. Open the **mamasay** repo, then **Website content**.
3. Change text, photos or colors and press **Save**. The site republishes in about a minute.

Text formatting inside paragraphs: `**bold**`, `*italic*`, `__big accent__`, `[link text](mailto:you@example.com)`.
To replace a photo, upload a new one in the image field and keep the description (alt text) accurate.
Everything lives in `src/content/site.json`, so it can also be edited directly on GitHub.

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

## Development

```bash
npm install
npm run dev       # http://localhost:4321/mamasay/
npm run build
```

Deploys automatically on every push to `main` (`.github/workflows/deploy.yml`).
For a custom domain, set repository variables `SITE_URL` (e.g. `https://mamasays.com`) and `BASE_PATH` (`/`).

`design/mockup-hybrid.html` is the original exported design mockup, kept for reference.
