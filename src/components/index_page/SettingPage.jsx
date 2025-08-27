import React from "react";
import "./Lerp.css";
import "./Settings.css";
import {useSettings} from "../../SettingsContext";
import {useMemory} from "../MemoryContext";

function Help({ id, children }) {
  return (
    <span className="help">
      <span className="help__icon" tabIndex={0} aria-describedby={id} aria-label="More info">?</span>
      <span role="tooltip" id={id} className="help__bubble">
        {children}
      </span>
    </span>
  );
}

export default function SettingsPage() {
  const { settings, update } = useSettings();
  const { clear } = useMemory();
  const sample = 1234.56789;

  const fmtPreview = () => {
    let s = sample.toFixed(settings.fractionDigits);
    if (settings.decimalSeparator === ",") s = s.replace(".", ",");
    return s;
  };

  return (
    <div className="lerp-page">
      <div className="sticky-block">
        <div className="settings-list">
          {/* Decimal separator */}
          <div className="settings-row">
            <div className="settings-label">
              <span>Decimal separator</span>
              <Help id="help-sep">
                Choose whether decimals show with a period (.) or a comma (,). Parsing accepts both.
              </Help>
            </div>
            <div className="settings-control">
              <label className="choice">
                <input
                  type="radio"
                  name="sep"
                  value="."
                  checked={settings.decimalSeparator === "."}
                  onChange={() => update({ decimalSeparator: "." })}
                />
                <span>.</span>
              </label>
              <label className="choice">
                <input
                  type="radio"
                  name="sep"
                  value=","
                  checked={settings.decimalSeparator === ","}
                  onChange={() => update({ decimalSeparator: "," })}
                />
                <span>,</span>
              </label>
            </div>
          </div>

          {/* Fraction digits */}
          <div className="settings-row">
            <div className="settings-label">
              <span>Digits after separator</span>
              <Help id="help-digits">
                Number of digits to display after the decimal separator (0–12). This affects display only.
              </Help>
            </div>
            <div className="settings-control">
              <input
                type="number"
                min={0}
                max={12}
                step={1}
                value={settings.fractionDigits}
                onChange={(e) => {
                  const raw = e.target.value;

                  // Allow empty entry
                  if (raw === "") {
                    update({ fractionDigits: "" });
                    return;
                  }
                  const n = Math.max(0, Math.min(12, Math.floor(+raw)));
                  update({ fractionDigits: n });
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    // if user left it empty, reset to a sensible default
                    update({ fractionDigits: 0 });
                  }
                }}
                className="num"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="settings-row">
            <div className="settings-label">
              <span>Preview</span>
              <Help id="help-preview">
                Example of how numbers will look with your current settings.
              </Help>
            </div>
            <div className="settings-control">
              <div className="preview">{fmtPreview()}</div>
            </div>
          </div>

          {/* MemBar length */}
          <div className="settings-row">
            <div className="settings-label">
              <span>Memory bar length</span>
              <Help id="help-membar">
                The maximum number of saved values shown and stored in the memory bar.
                Older values are dropped when the limit is reached.
              </Help>
            </div>
            <div className="settings-control">
              <input
                type="number"
                min={1}
                max={500}
                step={1}
                className="num"
                value={settings.memBarMax === "" ? "" : settings.memBarMax}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return update({ memBarMax: "" });   // let it be empty while editing
                  const n = Math.max(1, Math.min(500, Math.floor(+raw)));
                  update({ memBarMax: n });
                }}
                onBlur={(e) => {
                  if (e.target.value === "") update({ memBarMax: 50 }); // default if left empty
                }}
              />
            </div>
          </div>

          {/* Clear memory */}
          <div className="settings-row">
            <div className="settings-label">
              <span>Clear memory</span>
              <Help id="help-clear">
                Remove all saved values from the memory bar. This action cannot be undone.
              </Help>
            </div>
            <div className="settings-control">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (window.confirm("Clear all memory values?")) clear();
                }}
              >
                Clear memory
              </button>
            </div>
          </div>


          {/* Reset */}
          <div className="settings-row">
            <div className="settings-label">
              <span>Reset</span>
              <Help id="help-reset">Restore the default settings.</Help>
            </div>
            <div className="settings-control">
              <button
                type="button"
                className="btn"
                onClick={() => update({ decimalSeparator: ".", fractionDigits: 4 })}
              >
                Reset to defaults
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optional space below for notes/future settings */}
      <div className="results-wrap" />
    </div>
  );
}
