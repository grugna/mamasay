// Cookie banner shown ONLY to visitors in the EU/EEA/UK/Switzerland and California.
// Everyone else gets analytics straight away and never sees a banner.
import { loadAnalytics, stopAnalytics, gaConfigured } from './tracking';

const KEY = 'mamasays_consent';
const GEO_CACHE = 'mamasays_geo_regulated';
const body = document.body;

const parse = (v: string | undefined): string[] => {
  try { return JSON.parse(v || '[]'); } catch { return []; }
};
const countries = parse(body.dataset.consentCountries);
const states = parse(body.dataset.consentStates);

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

// Best effort fallback if the IP lookup fails: infer from the browser time zone.
function regulatedByTimeZone(): boolean {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  return tz.startsWith('Europe/') || tz === 'America/Los_Angeles' || tz === 'Atlantic/Reykjavik' || tz === 'Atlantic/Canary' || tz === 'Atlantic/Madeira' || tz === 'Atlantic/Azores';
}

async function needsConsent(): Promise<boolean> {
  try {
    const cached = sessionStorage.getItem(GEO_CACHE);
    if (cached !== null) return cached === '1';
  } catch { /* ignore */ }
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch('https://ipwho.is/?fields=success,country_code,region_code', { signal: ctrl.signal });
    window.clearTimeout(timer);
    const geo = await res.json();
    if (geo && geo.success) {
      const regulated = countries.includes(geo.country_code) || (geo.country_code === 'US' && states.includes(geo.region_code));
      try { sessionStorage.setItem(GEO_CACHE, regulated ? '1' : '0'); } catch { /* ignore */ }
      return regulated;
    }
  } catch { /* fall through to time zone */ }
  return regulatedByTimeZone();
}

export async function initConsent() {
  if (!gaConfigured) return; // nothing to consent to yet

  const banner = document.getElementById('consent-banner')!;
  const reopen = document.getElementById('consent-reopen')!;
  const stored = read(KEY);

  if (stored === 'granted') loadAnalytics();

  const regulated = await needsConsent();
  if (!regulated) { loadAnalytics(); return; }

  // Honor the Global Privacy Control signal as a decline (California requirement).
  if (!stored && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) {
    write(KEY, 'denied');
    return;
  }

  reopen.hidden = false;
  if (!stored) banner.hidden = false;

  const choose = (choice: 'granted' | 'denied') => {
    write(KEY, choice);
    banner.hidden = true;
    if (choice === 'granted') loadAnalytics(); else stopAnalytics();
  };
  banner.querySelectorAll<HTMLButtonElement>('button[data-choice]').forEach((btn) =>
    btn.addEventListener('click', () => choose(btn.dataset.choice as 'granted' | 'denied')),
  );
  reopen.addEventListener('click', () => { banner.hidden = false; banner.querySelector<HTMLButtonElement>('button')!.focus(); });
}
