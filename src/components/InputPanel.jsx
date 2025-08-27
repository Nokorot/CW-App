import {useSettings} from "../SettingsContext";
import "./InputPanel.css";


// TODO: Natural number input

export default function InputPanel({ states, children }) {
  const { settings } = useSettings();


  return (
      <div className="sticky-block">
        <div className="input-panel">
            {states.map((v, i) => {
              return (
                <label
                  key={`${i}`}
                >
                  <span>{v[2]}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    onBeforeInput={(e) => {
                      if (typeof e.data === "string" && e.data.length && !/^[0-9.,-]*$/.test(e.data)) {
                        e.preventDefault();
                      }
                    }}
                    value={v[0]}

                    onChange={(e) => {
                      const el = e.target;
                      const prev = v[0];                   // previous string from props/state
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
                      v[1](s);
                      requestAnimationFrame(() => {
                        // compute new caret position: subtract removed chars that were before the caret
                        const delta = removedBefore - (neg ? 1 : 0);
                        const newPos = Math.max(0, start - delta);
                        el.setSelectionRange(newPos, newPos);
                      });
                    }}
                  />
                </label>
              );
            })}
          {children}
        </div>
      </div>
  );
};
