// Google Analytics 4 (consent-gated) and Customer.io (sign-ups).
//
// Keys live in src/content/site.json -> "tracking". Placeholder values (containing XXXX)
// switch the integration off, so the site works before real IDs are added.
const body = document.body;
const GA_ID = body.dataset.gaId || '';
const CIO_KEY = body.dataset.cioKey || '';
const CIO_REGION = (body.dataset.cioRegion || 'us').toLowerCase();

const isReal = (v: string) => !!v && !/X{4,}/i.test(v);
export const gaConfigured = isReal(GA_ID);
export const cioConfigured = isReal(CIO_KEY);

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: string]: unknown;
  }
}

let gaLoaded = false;

export function loadAnalytics() {
  if (gaLoaded || !gaConfigured) return;
  gaLoaded = true;
  window[`ga-disable-${GA_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // gtag.js requires the real `arguments` object, not an array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

export function stopAnalytics() {
  if (!gaConfigured) return;
  window[`ga-disable-${GA_ID}`] = true;
  gaLoaded = false;
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (gaLoaded && window.gtag) window.gtag('event', name, params);
}

// Customer.io Data Pipelines HTTP API, called with the *public* (pk_) write key.
// Sending an email the visitor typed into a form is a user-initiated action, so it does not
// wait for cookie consent. No Customer.io cookies or scripts are loaded.
const CIO_HOST = CIO_REGION === 'eu' ? 'https://cdp-eu.customer.io' : 'https://cdp.customer.io';

// Same wire format as Customer.io's own browser SDK: POST /v1/b, Content-Type text/plain (a CORS "simple
// request", so no preflight, which this API does not answer), write key inside the body.
async function cioBatch(events: Record<string, unknown>[]) {
  const res = await fetch(`${CIO_HOST}/v1/b`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    keepalive: true,
    body: JSON.stringify({ batch: events.map((e) => ({ ...e, writeKey: CIO_KEY })), writeKey: CIO_KEY }),
  });
  if (!res.ok) throw new Error(`Customer.io failed: ${res.status}`);
}

export async function registerSignup(email: string, firstName: string, source: string) {
  if (!cioConfigured) {
    if (import.meta.env.DEV) {
      console.info('[dev] Customer.io not configured; pretending sign-up worked', { email, firstName, source });
      return;
    }
    throw new Error('Customer.io is not configured');
  }
  const traits: Record<string, unknown> = { email, signup_source: 'landing_page', signup_form: source };
  if (firstName) traits.first_name = firstName;
  await cioBatch([
    { type: 'identify', userId: email, traits },
    { type: 'track', userId: email, event: 'waitlist_signup', properties: { form: source, page: location.pathname } },
  ]);
}
