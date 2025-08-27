import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {useSettings} from "../SettingsContext";

const MemoryContext = createContext(null);

/**
 * items: number[] (or strings; your choice)
 * add(value): push to top (dedupe adjacent duplicates)
 * clear(): empty list
 * removeAt(i): remove one
 * setTarget(fn | null): inputs call this on focus to register a sink that can accept values
 * insert(value): if a target exists, call it; otherwise copy to clipboard gracefully
 */
export function MemoryProvider({ children }) {
  const {settings} = useSettings();
  const limit = Number.isFinite(settings?.memBarMax) ? settings.memBarMax : 50;

  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("cw_memory");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // Persist
  useEffect(() => {
    try { localStorage.setItem("cw_memory", JSON.stringify(items)); } catch {}
  }, [items]);


  // Target sink (a function set by the currently-focused input)
  const targetRef = useRef(null);

  const add = useCallback((value) => {
    // setItems(prev => (prev[0] === value ? prev : [value, ...prev].slice(0, 100)));
    setItems(prev => {
      if (prev[0] === value) return prev;
      const next = [value, ...prev];
      console.log(next.length, ", ", limit);
      return next.length > limit ? next.slice(0, limit) : next;
    });
  }, [limit]);
  const removeAt = useCallback((idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const setTarget = useCallback((fnOrNull) => { targetRef.current = fnOrNull; }, []);
  const insert = useCallback(async (value) => {
    if (typeof targetRef.current === "function") {
      targetRef.current(value);
      return true;
    }
    // fallback: copy to clipboard if no focused input registered
    try {
      await navigator.clipboard.writeText(String(value));
      return "copied";
    } catch {
      return false;
    }
  }, []);

  const api = useMemo(() => ({ items, add, removeAt, clear, setTarget, insert }), [items, add, removeAt, clear, setTarget, insert]);
  return <MemoryContext.Provider value={api}>{children}</MemoryContext.Provider>;
}

export function useMemory() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error("useMemory must be used inside <MemoryProvider>");
  return ctx;
}
