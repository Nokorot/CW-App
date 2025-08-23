import React, { useMemo, useState } from "react";
import "./Lerp.css";         // reuse your base layout styles
import "./Pythagoras.css";   // small extra styles for the triangle

export default function PythagorasPage() {
  // a, b are legs; c is hypotenuse
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("5");
  const [unknown, setUnknown] = useState("c"); // "a" | "b" | "c"

  const nums = {
    a: parseFloat(a),
    b: parseFloat(b),
    c: parseFloat(c),
  };

  const fmt = (v) =>
    Number.isFinite(v)
      ? (Number.isInteger(v) ? String(v) : v.toPrecision(12).replace(/\.?0+$/, ""))
      : "";

  // Compute solution and validation
  const { solved, error } = useMemo(() => {
    const isNum = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0;

    if (unknown === "c") {
      if (!isNum(nums.a) || !isNum(nums.b)) return { solved: { a: NaN, b: NaN, c: NaN }, error: "Enter non-negative numbers for a and b." };
      const c = Math.sqrt(nums.a * nums.a + nums.b * nums.b);
      return { solved: { a: nums.a, b: nums.b, c }, error: "" };
    }

    if (unknown === "a") {
      if (!isNum(nums.b) || !isNum(nums.c)) return { solved: { a: NaN, b: NaN, c: NaN }, error: "Enter non-negative numbers for b and c." };
      if (nums.c < nums.b) return { solved: { a: NaN, b: NaN, c: NaN }, error: "c must be ≥ b." };
      const a = Math.sqrt(nums.c * nums.c - nums.b * nums.b);
      return { solved: { a, b: nums.b, c: nums.c }, error: "" };
    }

    // unknown === "b"
    if (!isNum(nums.a) || !isNum(nums.c)) return { solved: { a: NaN, b: NaN, c: NaN }, error: "Enter non-negative numbers for a and c." };
    if (nums.c < nums.a) return { solved: { a: NaN, b: NaN, c: NaN }, error: "c must be ≥ a." };
    const b = Math.sqrt(nums.c * nums.c - nums.a * nums.a);
    return { solved: { a: nums.a, b, c: nums.c }, error: "" };
  }, [a, b, c, unknown]);

  // Determine displayed values (computed one is read-only)
  const display = {
    a: unknown === "a" ? fmt(solved.a) : a,
    b: unknown === "b" ? fmt(solved.b) : b,
    c: unknown === "c" ? fmt(solved.c) : c,
  };

  const hasError = Boolean(error) || [solved.a, solved.b, solved.c].some((x) => Number.isNaN(x));

  const onPick = (v) => {
    console.log("Picked: ", v);
  }

  return (
    <div className="lerp-page">
      <div className="sticky-block">
        <div className="input-panel">
          {/* <label>
            <span>Unknown</span>
            <select
              value={unknown}
              onChange={(e) => setUnknown(e.target.value)}
            >
              <option value="c">Solve for c (hypotenuse)</option>
              <option value="a">Solve for a (leg)</option>
              <option value="b">Solve for b (leg)</option>
            </select>
          </label> */}

          <label>
            <span>Side a</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={display.a}
              onChange={(e) => setA(e.target.value)}
              readOnly={unknown === "a"}
              aria-disabled={unknown === "a"}
            />
          </label>

          <label>
            <span>Side b</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={display.b}
              onChange={(e) => setB(e.target.value)}
              readOnly={unknown === "b"}
              aria-disabled={unknown === "b"}
            />
          </label>

          <label>
            <span>Side c (hypotenuse)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={display.c}
              onChange={(e) => setC(e.target.value)}
              readOnly={unknown === "c"}
              aria-disabled={unknown === "c"}
            />
          </label>
        </div>

        {hasError ? (
          <p className="user-err-msg">{error || "Invalid values."}</p>
        ) : (
          <p className="user-msg">
            {`a² + b² = c²  →  ${fmt(solved.a)}² + ${fmt(solved.b)}² = ${fmt(solved.c)}²`}
          </p>
        )}
      </div>

      {/* Scrollable content area: SVG triangle + a small summary list */}
      <div className="results-wrap" role="region" aria-label="Triangle and result">
        <div className="tri-wrap">
          <svg className="tri-svg" viewBox="0 0 220 170" aria-label="Right triangle">
            {/* Right-angle marker */}
            <polyline points="30,140 30,120 40,120" fill="none" stroke="#bbb" strokeWidth="2" />

            {/* PreDraw the triangle */}
            <polyline points="30,140 30,40 200,140 30,140 30,40" fill="none" className="side" />

            {/* Triangle sides */}
            {/* a: base (left→right) */}
            <line
              x1="30" y1="140" x2="200" y2="140"
              className={`side ${unknown === "a" ? "unknown" : ""}`}
            />
            {/* b: vertical (bottom→top) */}
            <line
              x1="30" y1="140" x2="30" y2="40"
              className={`side ${unknown === "b" ? "unknown" : ""}`}
            />
            {/* c: hypotenuse */}
            <line
              x1="30" y1="40" x2="200" y2="140"
              className={`side ${unknown === "c" ? "unknown" : ""}`}
            />


            <g
              className="side-label-box"
              transform="translate(40, 60)"
            >
              {/* <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" /> */}
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">α</text>
            </g>
            <g
              className="side-label-box"
              transform="translate(165, 130)"
            >
              {/* <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" /> */}
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">β</text>
            </g>



            <g
              className="side-label-box"
              transform="translate(110, 154)"
            >
              <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" />
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">A</text>
            </g>

            <g
              className="side-label-box"
              transform="translate(15, 94)"
            >
              <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" />
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">B</text>
            </g>

            <g
              className="side-label-box"
              transform="translate(122, 72)"
            >
              <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" />
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">C</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

