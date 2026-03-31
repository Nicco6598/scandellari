export const COOKIE_CONSENT_KEY = 'cookiesAccepted';
export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed';

export type CookieConsent = 'true' | 'minimal';

export const readCookieConsent = (): CookieConsent | null => {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === 'true' || value === 'minimal' ? value : null;
};

export const hasAnalyticsConsent = (consent: CookieConsent | null): boolean =>
  consent === 'true';

export const writeCookieConsent = (consent: CookieConsent) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(COOKIE_CONSENT_KEY, consent);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent }));
};
