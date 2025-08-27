import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const SettingsContext = createContext(null);

const DEFAULTS = {
  decimalSeparator: ",",      // "." or ","
  fractionDigits: 4,          // 0..12
  memBarMax: 100,
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

  useEffect(() => {
    try { localStorage.setItem("cw_settings", JSON.stringify(settings)); } catch {}
  }, [settings]);

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const api = useMemo(() => ({ settings, update }), [settings]);
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
    // fixed digits, then swap decimal if needed, and strip trailing zeros if fractionDigits==0
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


export function usePersistentState(key, initialValue) {
  // load once from localStorage
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // save whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota errors */
    }
  }, [key, value]);

  return [value, setValue];
}

