
import React, { useMemo, useState } from "react";

// InterpolationCalc
export default function LerpPageContainer() {
  const [x0, setX0] = useState("0");
  const [x1, setX1] = useState("10");
  const [steps, setSteps] = useState("5");

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

  return (
    <div style={{ maxWidth: 560, margin: "24px auto", fontFamily: "system-ui, sans-serif" }}>
    {/* <h2>Linear Interpolation Calculator</h2> */}
      <h2 style={{ marginBottom: 12 }}>Linear Spaceing</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>
          <span>Start (x0)</span>
          <input type="number" value={x0} onChange={(e) => setX0(e.target.value)} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          <span>End (x1)</span>
          <input type="number" value={x1} onChange={(e) => setX1(e.target.value)} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          <span>Steps / Samples (y0)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>

      {hasError ? (
        <p style={{ color: "#c00", marginTop: 12 }}>
          Enter valid numbers. “Steps” should be an integer ≥ 1.
        </p>
      ) : (
        <>
          <p style={{ marginTop: 12, color: "#555" }}>
            Generated {values.length} value{values.length === 1 ? "" : "s"} from x0 to x1 (inclusive).
          </p>
          <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.6 }}>
            {values.map((v, i) => (
              <li key={i}>
                <code>#{i}</code> → {Number.isInteger(v) ? v : v.toPrecision(12).replace(/\.?0+$/, "")}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14,
  color: "#333",
};

const inputStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ccc",
  outline: "none",
};
