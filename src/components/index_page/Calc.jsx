import React, { useMemo, useRef, useState } from "react";
import "./Lerp.css";
import "./Calc.css";
import {useNumberFormat} from "../../SettingsContext";

const DEL_sym = "⌫";
const div_symbol = "÷";


// const div_symbol = "/";

/**
 * Very small, safe infix evaluator (+ - * / and parentheses)
 * - Tokenizes the expression
 * - Shunting-yard -> RPN
 * - RPN evaluation
 * Handles unary minus, decimals, and basic errors.
 */
function evaluateExpression(expr) {
  if (!expr || !expr.trim()) return { ok: true, value: "" };

  // 1) Tokenize
  const tokens = [];
  const s = expr.replace(/×/g, "*").replace(/÷/g, "/"); // accept pretty ops
  const re = /\s*([0-9]*\.?[0-9]+|\(|\)|\+|-|\*|\/|\^)\s*/g;
  let m, idx = 0;
  while ((m = re.exec(s))) {
    if (m.index !== idx) return { ok: false, err: "Invalid character" };
    tokens.push(m[1]);
    idx = re.lastIndex;
  }
  if (idx !== s.length) return { ok: false, err: "Invalid character" };

  // 2) Handle unary minus by converting to (0 - x)
  const fixed = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : null;
    const isUnaryMinus =
      t === "-" &&
      (i === 0 || prev === "(" || prev === "+" || prev === "-" || prev === "*" || prev === "/" || prev === "^");
    if (isUnaryMinus) {
      fixed.push("0");
      fixed.push("-");
    } else {
      fixed.push(t);
    }
  }

  // 3) Shunting-yard
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  const out = [];
  const op = [];
  for (const t of fixed) {
    if (/^[0-9]*\.?[0-9]+$/.test(t)) {
      out.push(t);
    } else if (t in prec) {
      while (op.length && op[op.length - 1] in prec && prec[op[op.length - 1]] >= prec[t]) {
        out.push(op.pop());
      }
      op.push(t);
    } else if (t === "(") {
      op.push(t);
    } else if (t === ")") {
      while (op.length && op[op.length - 1] !== "(") out.push(op.pop());
      if (!op.length) return { ok: false, err: "Mismatched parentheses" };
      op.pop(); // remove '('
    } else {
      return { ok: false, err: "Invalid token" };
    }
  }
  while (op.length) {
    const top = op.pop();
    if (top === "(") return { ok: false, err: "Mismatched parentheses" };
    out.push(top);
  }

  // 4) Eval RPN
  const st = [];
  for (const t of out) {
    if (/^[0-9]*\.?[0-9]+$/.test(t)) {
      st.push(parseFloat(t));
    } else {
      const b = st.pop(), a = st.pop();
      if (a == null || b == null) return { ok: false, err: "Syntax error" };
      let v;
      if (t === "+") v = a + b;
      else if (t === "-") v = a - b;
      else if (t === "*") v = a * b;
      else if (t === "^") v = a ** b;
      else if (t === "/") {
        if (b === 0) return { ok: false, err: "Division by zero" };
        v = a / b;
      } else {
        return { ok: false, err: "Invalid op" };
      }
      st.push(v);
    }
  }
  if (st.length !== 1) return { ok: false, err: "Syntax error" };

  const val = st[0];
  // prettify a bit
  // const shown =
  //   Math.abs(val) >= 1e12 || (Math.abs(val) > 0 && Math.abs(val) < 1e-6)
  //     ? val.toExponential(10)
  //     : +val.toFixed(12);
  //     String(shown).replace(/\.?0+($|e)/, "$1")
  //
  return { ok: true, value: val };
}

export default function CalculatorPage() {
  const [expr, setExpr] = useState("");
  const inputRef = useRef(null);

  const result = useMemo(() => evaluateExpression(expr), [expr]);

  const {fmt, toNum} = useNumberFormat();

  // Only allow digits, operators, parentheses, dot and spaces in manual typing
  const onBeforeInput = (e) => {
    if (typeof e.data !== "string") return;
    if (!/^[0-9+\-*/().\s]$/.test(e.data)) e.preventDefault();
  };

  const insert = (text) => {
    const el = inputRef.current;
    if (!el) { setExpr(expr + text); return; }
    const start = el.selectionStart ?? expr.length;
    const end = el.selectionEnd ?? expr.length;
    const next = expr.slice(0, start) + text + expr.slice(end);
    setExpr(next);
    // put caret after inserted text on next tick
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const backspace = () => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? expr.length;
    const end = el?.selectionEnd ?? expr.length;
    if (start !== end) {
      setExpr(expr.slice(0, start) + expr.slice(end));
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(start, start);
      });
      return;
    }
    if (start === 0) return;
    const next = expr.slice(0, start - 1) + expr.slice(end);
    setExpr(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start - 1, start - 1);
    });
  };

  const clearAll = () => setExpr("");

  const equals = () => {
    if (result.ok && result.value !== "") setExpr(result.value);
  };

  const keys = [
    // ["^2", "^", "sqrt", "log", "e"],
    ["7", "8", "9", div_symbol, DEL_sym],
    ["4", "5", "6", "×", "("],
    ["1", "2", "3", "−", ")"],
    ["0", ".", "C", "+", "="],
  ];

  const onKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); equals(); }
  };

  return (
    <div className="lerp-page">
      <div className="sticky-block">
        <div className="calc-inputs">
          <input
            ref={inputRef}
            className="calc-expr"
            type="text"
            inputMode="none"
            placeholder="Type or tap…"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={onKeyDown}
            onBeforeInput={onBeforeInput}
            aria-label="Expression"
          />
          <button className={`calc-result ${result.ok ? "" : "calc-result--err"}`}
            >
            {result.ok ? (result.value === "" ? " " : fmt(result.value)) : result.err}
          </button>
        </div>
      </div>

      <div className="results-wrap" role="region" aria-label="Keypad">
        <div className="pad-grid">
          {keys.flat().map((k, i) => {
            const cls =
              k === "=" ? "pad-key pad-key--equals" :
              k === "C" ? "pad-key pad-key--clear" :
              k === DEL_sym ? "pad-key pad-key--del" :
              "pad-key";
            return (
              <button
                key={i}
                className={cls}
                onClick={() => {
                  if (k === "C") return clearAll();
                  if (k === DEL_sym) return backspace();
                  if (k === "=") return equals();
                  if (k === "×") return insert("*");
                  // if (k === "÷") return insert("/");
                  if (k === "−") return insert("-");
                  return insert(k);
                }}
                aria-label={`Key ${k}`}
              >
                {/* {k} */}
{ k === "⌫" ? (
<svg width="40px" height="40x" viewBox="0 -2 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.91006 12.6651L8.35606 15.5261C8.59533 15.82 8.95209 15.9935 9.33106 16.0001L13.0501 15.9931H16.2391C18.0288 16.0036 19.4885 14.5618 19.5001 12.7721V10.2221C19.4891 8.43193 18.0292 6.98953 16.2391 7.00006L9.33106 7.00706C8.95226 7.01341 8.59552 7.18647 8.35606 7.48006L5.91006 10.3421C5.36331 11.0199 5.36331 11.9872 5.91006 12.6651V12.6651Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.1603 9.46359C11.864 9.17409 11.3892 9.17957 11.0997 9.47582C10.8102 9.77207 10.8156 10.2469 11.1119 10.5364L12.1603 9.46359ZM12.6469 12.0364C12.9431 12.3259 13.418 12.3204 13.7075 12.0242C13.997 11.7279 13.9915 11.2531 13.6953 10.9636L12.6469 12.0364ZM13.6963 10.9646C13.4006 10.6745 12.9258 10.6791 12.6357 10.9748C12.3456 11.2705 12.3502 11.7453 12.6458 12.0354L13.6963 10.9646ZM14.1748 13.5354C14.4705 13.8255 14.9454 13.8209 15.2355 13.5252C15.5255 13.2295 15.521 12.7547 15.2253 12.4646L14.1748 13.5354ZM13.6953 12.0364C13.9915 11.7469 13.997 11.2721 13.7075 10.9758C13.418 10.6796 12.9431 10.6741 12.6469 10.9636L13.6953 12.0364ZM11.1119 12.4636C10.8156 12.7531 10.8102 13.2279 11.0997 13.5242C11.3892 13.8204 11.864 13.8259 12.1603 13.5364L11.1119 12.4636ZM12.6458 10.9646C12.3502 11.2547 12.3456 11.7295 12.6357 12.0252C12.9258 12.3209 13.4006 12.3255 13.6963 12.0354L12.6458 10.9646ZM15.2253 10.5354C15.521 10.2453 15.5255 9.77046 15.2355 9.47477C14.9454 9.17909 14.4705 9.17454 14.1748 9.46462L15.2253 10.5354ZM11.1119 10.5364L12.6469 12.0364L13.6953 10.9636L12.1603 9.46359L11.1119 10.5364ZM12.6458 12.0354L14.1748 13.5354L15.2253 12.4646L13.6963 10.9646L12.6458 12.0354ZM12.6469 10.9636L11.1119 12.4636L12.1603 13.5364L13.6953 12.0364L12.6469 10.9636ZM13.6963 12.0354L15.2253 10.5354L14.1748 9.46462L12.6458 10.9646L13.6963 12.0354Z" fill="#000000"/>
</svg>
) : k }
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
