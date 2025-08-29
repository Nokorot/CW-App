import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import themes from "./themes.json"; // { light: {...}, dark: {...}, ... }

const SettingsContext = createContext(null);

/** If your themes.json uses keys WITHOUT the "--" prefix (recommended),
 *  this will add it when applying. If you *do* have leading "--", it uses them as-is. */
function applyThemeVars(themeObj) {
  if (!themeObj) return;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(themeObj)) {
    const cssVar = key.startsWith("--") ? key : `--${key}`;
    root.style.setProperty(cssVar, String(val));
  }
}

const DEFAULTS = {
  decimalSeparator: ",", // "." or ","
  fractionDigits: 4,     // 0..12
  memBarMax: 100,
  themeName: "light",    // <-- persisted theme selection
  memBarPosition: "top" // "top" | "bottom"
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("cw_settings");
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // Persist settings
  useEffect(() => {
    try { localStorage.setItem("cw_settings", JSON.stringify(settings)); } catch {}
  }, [settings]);

  // Apply theme variables whenever themeName changes (or on first mount)
  useEffect(() => {
    const theme = themes[settings.themeName] ?? themes[DEFAULTS.themeName];
    applyThemeVars(theme);
  }, [settings.themeName]);

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const api = useMemo(() => ({
    settings,
    update,
    // Theming helpers (optional convenience)
    // themeName: settings.themeName,
    // setThemeName: (name) => update({ themeName: name }),
    availableThemes: Object.keys(themes),
  }), [settings]);

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

/** Formatting + parsing helpers driven by settings */
export function useNumberFormat() {
  const { settings } = useSettings();
  const { fractionDigits, decimalSeparator } = settings;

  const fmt = (value) => {
    if (value == null || !Number.isFinite(value)) return "";
    let s = value.toFixed(fractionDigits);
    if (decimalSeparator === ",") s = s.replace(".", ",");
    return s;
  };

  // parse string that may contain "," or "." into a Number
  const toNum = (str) => {
    if (str == null || str === "") return NaN;
    const s = String(str).trim().replace(",", ".");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : NaN;
  };

  return { fmt, toNum };
}

/** Persist any scalar value under a key */
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}
