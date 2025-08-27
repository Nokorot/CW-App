import {useSettings} from "../SettingsContext";
import "./InputPanel.css";
import {useMemory} from "./MemoryContext";

export function useInputFiled(settings, setTarget, formatForField) {
  const onChange = (e, state, setState ) => {
    const el = e.target;
    const prev = state;                   // previous string from props/state
    const start = el.selectionStart ?? prev.length;


    // 1) build new string from raw input
    let s = el.value;

    // replace commas with dots (same length → no caret shift)
    s = s.replace(/,/g, ".");

    // collapse multiple dots — track how many we remove before the caret
    const first = s.indexOf(".");
    let removedBefore = 0;
    if (first !== -1) {
      const left = s.slice(0, first + 1);
      const right = s.slice(first + 1);
      // how many dots are in the substring before the caret?
      const beforeCaret = s.slice(0, start);
      const extraDotsBefore = (beforeCaret.match(/\./g) ?? []).length - (beforeCaret.slice(0, first + 1).match(/\./g) ?? []).length;
      s = left + right.replace(/\./g, "");
      removedBefore = Math.max(0, extraDotsBefore);
    }

    // 2) apply UI preference
    if (settings.decimalSeparator === ",") s = s.replace(".", ",");

    // 4) sign normalization
    const minusCount = (s.match(/-/g) || []).length;
    const neg = minusCount % 2 === 1;

    // how many '-' are before current caret?
    removedBefore += (s.slice(0, start).match(/-/g) || []).length;

    // remove all '-' then add a single leading one if odd
    s = s.replace(/-/g, "");
    if (neg) s = "-" + s;

    // 3) set state and restore caret
    setState(s);
    requestAnimationFrame(() => {
      // compute new caret position: subtract removed chars that were before the caret
      const delta = removedBefore - (neg ? 1 : 0);
      const newPos = Math.max(0, start - delta);
      el.setSelectionRange(newPos, newPos);
    });
  }

  const onFocus = ((state, setState) => {
    // register as target: insert at caret position
    setTarget((memValue) => {
      const el = document.activeElement;
      if (!el || el.tagName !== "INPUT") { setState(formatForField(memValue)); return; }

      const start = el.selectionStart ?? state.length;
      const end = el.selectionEnd ?? state.length;
      const raw = state ?? "";
      let insertStr = formatForField(memValue);
      // Normalize to internal '.' before splicing, then convert back for UI
      const toDot = (s) => s.replace(/,/g, ".");
      const toUI  = (s) => (settings.decimalSeparator === "," ? s.replace(/\./g, ",") : s);
      const next = toUI(toDot(raw).slice(0, start) + toDot(insertStr) + toDot(raw).slice(end));
      setState(next);
      // restore caret after inserted text
      requestAnimationFrame(() => {
        try {
          const pos = start + insertStr.length;
          el.setSelectionRange(pos, pos);
        } catch {}
      });
    });
  });


  return { onChange, onFocus };

}



// TODO: Natural number input

export default function InputPanel({ states, children }) {
  const { setTarget } = useMemory();
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

  const {onChange, onFocus} = useInputFiled(settings, setTarget, formatForField);

  return (
      <div className="sticky-block">
        <div className="input-panel">
            {states.map(([state, setState, label], i) => {

              return (
                <label
                  key={`${i}`}
                >
                  <span>{label}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    onBeforeInput={(e) => {
                      if (typeof e.data === "string" && e.data.length && !/^[0-9.,-]*$/.test(e.data)) {
                        e.preventDefault();
                      }
                    }}
                    value={state}
                    onChange={e => onChange(e, state, setState)}
                    onFocus={() => onFocus(state, setState)}

                  />
                </label>
              );
            })}
          {children}
        </div>
      </div>
  );
};
