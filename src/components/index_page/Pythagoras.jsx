import React, { useMemo, useState } from "react";
import "./Lerp.css";
import "./Pythagoras.css";


const PRESITION = 2;

const toNum = (s) => {
  const n = parseFloat(String(s).replace(",", ".")); // allow comma
  return Number.isFinite(n) ? n : NaN;
};


const Field = ({ id, label, value, onChange, filledFlag }) => {
  const isComputed = !filledFlag && value !== "" && Number.isFinite(toNum(value));
  return (
    <label className={`field ${isComputed ? "field--locked" : ""}`}>
      <span className="field__label">
        {label}
      </span>
      {isComputed ?
        <input
          readOnly
          aria-disabled
          value={value ?? ""}
          onClick={() => console.log(value)}
          disabled={true}
          tabIndex={-1}
        ></input>
        :
        <input
          onBeforeInput={(e) => {
            if (!/^[0-9.,]*$/.test(e.data)) {
              e.preventDefault();
            }
          }}
          inputMode="decimal"
          min={0}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      }
    </label>
  );
};

/**
 * Conventions:
 * - Right angle at the bottom-left vertex.
 * - a = base (horizontal leg), b = vertical leg, c = hypotenuse.
 * - α is the angle at the top-left (adjacent to b & c).
 * - β is the angle at the bottom-right (adjacent to a & c).
 *   Then α + β = 90°.
 *
 * Units: angles in DEGREES.
 */
export default function PythagorasPage() {
  const [aStr, setA] = useState("");
  const [bStr, setB] = useState("");
  const [cStr, setC] = useState("");
  const [alphaStr, setAlpha] = useState("");
  const [betaStr, setBeta] = useState("");

  // Helpers
  const deg2rad = (d) => (d * Math.PI) / 180;
  const rad2deg = (r) => (r * 180) / Math.PI;

  // const fmt = (v) => (
  //     Number.isInteger(v)
  //         ? String(v) :
  //   Number.isFinite(v) ? v.toPrecision(3) : "").replace(/\.0+/, "");

  const fmt = (v) =>
    Number.isFinite(v)
      ? (Math.abs(v) >= 1e6 || Math.abs(v) <= 1e-6
          ? v.toExponential(3)
          : +v.toFixed(PRESITION)).toString().replace(/\.0+$/, "f")
      : "";

  const inputs = {
    a: toNum(aStr),
    b: toNum(bStr),
    c: toNum(cStr),
    alpha: toNum(alphaStr),
    beta: toNum(betaStr),
  };
  const filled = {
    a: aStr.trim() !== "",
    b: bStr.trim() !== "",
    c: cStr.trim() !== "",
    alpha: alphaStr.trim() !== "",
    beta: betaStr.trim() !== "",
  };

  const { solved, err } = useMemo(() => {
    // Pick exactly which pair(s) are provided
    const provided = Object.keys(filled).filter((k) => filled[k]);


    // Copy to avoid mutating 'inputs'
    let { a, b, c, alpha, beta } = inputs;
    var solved = {}

    // Check if one of the angels are set
    if (filled.alpha) {
      solved.beta = beta = 90 - alpha;
    } else if (filled.beta) {
      solved.alpha = alpha = 90 - beta;
    } else if (provided < 2) {
      return { solved: solved, err: "" }
    }

    if (provided > 2) {
      return { solved: {}, err: "Too many provided values!" };
    }

    if (Number.isFinite(alpha)) {
      if (filled.a) {
        b = a / Math.tan(deg2rad(alpha));
        c = a / Math.sin(deg2rad(alpha));
      } else if (filled.b) {
        a = b * Math.tan(deg2rad(alpha));
        c = b / Math.cos(deg2rad(alpha));
      } else if (filled.c) {
        a = c * Math.sin(deg2rad(alpha));
        b = c * Math.cos(deg2rad(alpha));
      }
      return { solved: { a, b, c, alpha, beta }, err: "" };

    } else if (filled.a && filled.b) {
      c = Math.sqrt(a*a + b*b);
    } else if (filled.a && filled.c) {
      b = Math.sqrt(c*c - a*a);
    } else if (filled.b && filled.c) {
      a = Math.sqrt(c*c - b*b);
    } else {
      return { solved: {}, err: "Unreacable!" };
    }

    alpha = rad2deg(Math.atan2(a, b));
    beta = 90 - alpha;
    return { solved: { a, b, c, alpha, beta }, err: "" };

  }, [aStr, bStr, cStr, alphaStr, betaStr]);

  // View-model: show user's typed value if present, otherwise computed value
  const view = {
    a: filled.a ? aStr : fmt(solved.a),
    b: filled.b ? bStr : fmt(solved.b),
    c: filled.c ? cStr : fmt(solved.c),
    alpha: filled.alpha ? alphaStr : fmt(solved.alpha),
    beta: filled.beta ? betaStr : fmt(solved.beta),
  };


  // Simple triangle drawing (same as you had)
  return (
    <div className="lerp-page">
      <div className="sticky-block">
        <div className="input-panel">
          <Field id="a" label="Side A" value={view.a} onChange={setA} filledFlag={filled.a} />
          <Field id="b" label="Side B" value={view.b} onChange={setB} filledFlag={filled.b} />
          <Field id="c" label="Side C" value={view.c} onChange={setC} filledFlag={filled.c} />
          <Field id="alpha" label="Angle α (deg)" value={view.alpha} onChange={setAlpha} filledFlag={filled.alpha} />
          <Field id="beta" label="Angle β (deg)" value={view.beta} onChange={setBeta} filledFlag={filled.beta} />

          <label className="field field--clear">
            <span className="field__label">clear</span>
            <button
              type="button"
              className="clear-btn"
              onClick={() => { setA(""); setB(""); setC(""); setAlpha(""); setBeta(""); }}
            >
              Reset
            </button>
          </label>
          </div>

        {/* err ? (
          <p className="user-err-msg">{err}</p>
        ) : (
          (view.a || view.b || view.c || view.alpha || view.beta) && (
            <p className="user-msg">
              {view.a && `a=${view.a}  `} {view.b && `b=${view.b}  `}
              {view.c && `c=${view.c}  `} {view.alpha && `α=${view.alpha}°  `}
              {view.beta && `β=${view.beta}°`}
            </p>
          )
        ) */}
      </div>

      <div className="results-wrap" role="region" aria-label="Triangle">
        <div className="tri-wrap">
          <svg className="tri-svg" viewBox="0 0 230 170" aria-label="Right triangle">
            <polyline points="180,120 180,100 200,100" fill="none" stroke="#bbb" strokeWidth="2" />
            <polyline points="200,120 20,120 200,10 200,120 20,120" fill="none" className="side" />

            <g className="side-label-box" transform="translate(215,65)">
              <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" />
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">A</text>
            </g>
            <g className="side-label-box" transform="translate(110,140)">
              <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" />
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">B</text>
            </g>
            <g className="side-label-box" transform="translate(90,50)">
              <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" />
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">C</text>
            </g>

            <g className="side-label-box" transform="translate(60, 110)" >
              {/* <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" /> */}
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">α</text>
            </g>
            <g className="side-label-box" transform="translate(185, 40)" >
              {/* <rect x="-10" y="-10" width="20" height="20" rx="4" ry="4" /> */}
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle">β</text>
            </g>

          </svg>
        </div>
      </div>
    </div>
  );
}
