import React from "react";
import "./Lerp.css";
import "./Settings.css";
import {useSettings} from "../../SettingsContext";

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
                onChange={(e) =>
                  update({
                    fractionDigits: Math.max(0, Math.min(12, Math.floor(+e.target.value || 0))),
                  })
                }
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
