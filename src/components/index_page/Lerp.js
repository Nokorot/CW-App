// vim: set ft=javascriptreact

import React, { useEffect, useMemo, useState } from "react";
import "./Lerp.css"

// InterpolationCalc
export default function LerpPageContainer({pageContext}) {
  const [x0, setX0] = useState("0");
  const [x1, setX1] = useState("10");
  const [steps, setSteps] = useState("5");

  const [lastPicked, setLastPicked] = useState(null); // for future mem-list UX

  const parsed = {
    x0: parseFloat(x0),
    x1: parseFloat(x1),
    n: Math.max(1, Math.floor(Number(steps))), // clamp to >= 1
  };

  const values = useMemo(() => {
    if (Number.isNaN(parsed.x0) || Number.isNaN(parsed.x1) || !Number.isFinite(parsed.n)) return [];
    const { x0, x1, n } = parsed;

    if (n === 1) return [x0]; // NumPy: single sample → start value

    const arr = new Array(n);
    const step = (x1 - x0) / (n - 1);
    for (let i = 0; i < n; i++) {
      arr[i] = x0 + step * i; // includes both endpoints
    }
    return arr;
  }, [x0, x1, steps]); // recompute live as you type

  const hasError =
    Number.isNaN(parsed.x0) || Number.isNaN(parsed.x1) || !Number.isFinite(parsed.n);

  // For the future: this is where you'd add to a memory list.
  // For now we just store which value was clicked.
  const handlePick = (value) => {
    setLastPicked(value);
    // TODO: push to mem-list state and expose it in a side panel / dropdowns
  };


           // {Number.isInteger(v) ? v : v.toPrecision(12).replace(/\.?0+$/, "")}

  const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toPrecision(3).replace(/\.?0+$/, ""));


  useEffect(() => {
    pageContext.setTopBarWidget(
      <h2 >Linear Spacing</h2>
    );
  }, []);

  return (
    <div className="lerp-page">
      <div className="striky-block">
        { /* <h2 >Linear Spacing</h2> */}
        <div className="input-panel">
          <label>
            <span>Start (x0)</span>
            <input type="number" value={x0} onChange={(e) => setX0(e.target.value)} />
          </label>

          <label>
            <span>End (x1)</span>
            <input type="number" value={x1} onChange={(e) => setX1(e.target.value)} />
          </label>

          <label>
            <span>Steps / Samples (y0)</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          </label>
        </div>
      </div>

      {hasError ? (
        <p className="user-err-msg">
          Enter valid numbers. “Steps” should be an integer ≥ 1.
        </p>
      ) : (
        <>
          <p className="user-msg">
        {/* Generated {values.length} value{values.length === 1 ? "" : "s"} from x0 to x1 (inclusive). */}

            Generated {values.length} value{values.length === 1 ? "" : "s"} from x0 to x1 (inclusive)
            {lastPicked != null ? ` • last picked: ${fmt(lastPicked)}` : ""}
            .
          </p>
        </>
      )}

      {/* Only this area scrolls */}
      <div className="results-wrap" role="region" aria-label="Results">
        {!hasError && (
          <div className="result-grid">
            {values.map((v, i) => {
              const label = fmt(v);
              return (
                <button
                  key={`${i}-${label}`}
                  type="button"
                  className="result-chip"
                  onClick={() => handlePick(v)}
                  aria-label={`Pick value ${label}`}
                  title={`Pick ${label}`}
                >
                  {/* <code>#{i}</code>&nbsp;*/} {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
