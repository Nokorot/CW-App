import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const languages = [
  { code: "en", label: "English" },
  { code: "nb", label: "Norsk (bokmål)" }
  // add more here...
];

// Lightweight loader for /public/locales/{lng}.json (precompiled)
async function loadLang(lng) {
  const url = `/locales/${lng}.json`;
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const data = await res.json();
  i18n.addResources(lng, "translation", data); // single default namespace
}

i18n.use(initReactI18next).init({
  lng: "en",             // will be overridden by your SettingsContext
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  resources: {},          // we lazy-load from /public
  defaultNS: "translation",
  keySeparator: false,
});

// helper to ensure language resources exist
export async function ensureLanguage(lng) {
  if (!i18n.hasResourceBundle(lng, "translation")) {
    await loadLang(lng);
  }
  if (i18n.language !== lng) await i18n.changeLanguage(lng);
}

export default i18n;
