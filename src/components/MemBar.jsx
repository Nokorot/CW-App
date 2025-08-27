import React from "react";
import "./MemBar.css";
import { useMemory } from "./MemoryContext";
import {useNumberFormat} from "../SettingsContext";

export default function MemBar() {
  const { items, removeAt, clear, insert } = useMemory();
  const { fmt } = useNumberFormat();

  if (!items.length) return null;

  return (
    <div className="mem-bar" role="region" aria-label="Memory bar">
      <div className="mem-scroll">

        {items.map((v, i) => (
          <button
            key={i}
            type="button"
            className="mem-chip"
            title="Insert into focused field"
            onClick={() => insert(v)}
            onContextMenu={(e) => { e.preventDefault(); removeAt(i); }}
          >
            {fmt(Number(v))}
          </button>
        ))}
      </div>
    </div>
  );
}
