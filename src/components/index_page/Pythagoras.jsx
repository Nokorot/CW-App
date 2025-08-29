import React, { useMemo } from "react";
import "./Pythagoras.css";
import "../InputPanel.css";
import {useNumberFormat, usePersistentState, useSettings} from "../../SettingsContext";
import {useInputFiled} from "../InputPanel";
import {useMemory} from "../MemoryContext";

const Field = ({
  label,
  value,
  setValue,
  filledFlag,
  toNum
}) => {

  const isComputed = !filledFlag && value !== "" && Number.isFinite(toNum(value));

  const { add, setTarget } = useMemory();
  const { settings } = useSettings();

  const formatForField = (numOrStr) => {
    // accept numbers or strings; return string respecting settings.decimalSeparator
    const n = typeof numOrStr === "number" ? numOrStr : parseFloat(String(numOrStr).replace(",", "."));
    if (!Number.isFinite(n)) return "";
    let s = n.toString();
    // If you prefer consistent display digits, use Settings fmt here instead.
    if (settings.decimalSeparator === ",") s = s.replace(".", ",");
    return s;
  };

  const {onChange, onFocus } = useInputFiled(settings, setTarget, formatForField)

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
          onMouseDown={(e) => {
            e.preventDefault();
            add(toNum(value));
            // add(value);
            console.log(value)
          }}
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
          onChange={(e) => onChange(e, value, setValue)}
          onFocus={() => onFocus(value, setValue)}
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
  const [aStr, setA] = usePersistentState("pythgas-a", "");
  const [bStr, setB] = usePersistentState("pythgas-b", "");
  const [cStr, setC] = usePersistentState("pythgas-c", "");
  const [alphaStr, setAlpha] = usePersistentState("pythgas-alpta", "");
  const [betaStr, setBeta] = usePersistentState("pythgas-beta", "");

  // Helpers
  const deg2rad = (d) => (d * Math.PI) / 180;
  const rad2deg = (r) => (r * 180) / Math.PI;

  const {fmt, toNum} = useNumberFormat();

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
    const provided = Object.keys(filled).filter((k) => filled[k]).length;


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


  const fields = [
    ["Side A", view.a, setA, filled.a],
    ["Side B", view.b, setB, filled.b],
    ["Side C", view.c, setC, filled.c],
    ["Angle α (deg)", view.alpha, setAlpha, filled.alpha],
    ["Angle β (deg)", view.beta, setBeta, filled.beta],
  ];


  // Simple triangle drawing (same as you had)
  return (
    <>
      <div className="sticky-block">
        <div className="input-panel">
          {fields.map((args) => {
            return (<Field
              label={args[0]}
              value={args[1]}
              setValue={args[2]}
              filledFlag={args[3]}
              toNum={toNum}
            />);
          })}

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
      </div>

      <div className="scrollable-content" role="region" aria-label="Triangle">
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
    </>
  );
}
