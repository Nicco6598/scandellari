import { useSyncExternalStore } from 'react';

export const COOKIE_CONSENT_KEY = 'cookiesAccepted';
export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed';

const COOKIE_CONSENT_VALUES = ['true', 'minimal'] as const;

export type CookieConsent = (typeof COOKIE_CONSENT_VALUES)[number];

const isCookieConsent = (value: string | null): value is CookieConsent =>
  value !== null && COOKIE_CONSENT_VALUES.some((consent) => consent === value);

export const readCookieConsent = (): CookieConsent | null => {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return isCookieConsent(value) ? value : null;
};

export const hasAnalyticsConsent = (consent: CookieConsent | null) =>
  consent === 'true';

const subscribeToCookieConsent = (onStoreChange: () => void) => {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
};

export const useCookieConsent = () =>
  useSyncExternalStore(subscribeToCookieConsent, readCookieConsent, () => null);

export const writeCookieConsent = (consent: CookieConsent) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(COOKIE_CONSENT_KEY, consent);
  window.dispatchEvent(new CustomEvent<CookieConsent>(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent }));
};
