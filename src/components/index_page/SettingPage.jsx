import React from "react";
import "./Settings.css";
import { useSettings } from "../../SettingsContext";
import { useMemory } from "../MemoryContext";
import { useTranslation } from "react-i18next";
import i18n, {ensureLanguage, languages} from "../../i18n";

function Help({ id, children }) {
  const { t } = useTranslation();
  return (
    <span className="help">
      <span
        className="help__icon"
        tabIndex={0}
        aria-describedby={id}
        aria-label={t("common.moreInfo")}
      >
        ?
      </span>
      <span role="tooltip" id={id} className="help__bubble">
        {children}
      </span>
    </span>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { settings, update, availableThemes } = useSettings();
  const { clear } = useMemory();

  const sample = 1234.56789;

  const fmtPreview = () => {
    let s = sample.toFixed(settings.fractionDigits);
    if (settings.decimalSeparator === ",") s = s.replace(".", ",");
    return s;
  };

  const onLangChange = async (e) => {
    const lng = e.target.value;
    await ensureLanguage(lng);
    localStorage.setItem("lng", lng);
  };


  return (
    <>
      <div className="settings-list">
        {/* Choose Language */}
        <div className="settings-row">
          <div className="settings-label">
            <span>{t("settings.language.label")}</span>
            <Help id="help-theme">{t("settings.language.help")}</Help>
          </div>
          <div className="settings-control">
            <select value={i18n.language} onChange={onLangChange} aria-label={"settings.language.label"}>
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>

              {/* availableThemes.map((key) => (
              )) */}
          </div>
        </div>


        {/* Decimal separator */}
        <div className="settings-row">
          <div className="settings-label">
            <span>{t("settings.decimalSep")}</span>
            <Help id="help-sep">{t("settings.help.decimalSep")}</Help>
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
            <span>{t("settings.digits")}</span>
            <Help id="help-digits">{t("settings.help.digits")}</Help>
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
                if (raw === "") return update({ fractionDigits: "" });
                const n = Math.max(0, Math.min(12, Math.floor(+raw)));
                update({ fractionDigits: n });
              }}
              onBlur={(e) => {
                if (e.target.value === "") update({ fractionDigits: 0 });
              }}
              className="num"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="settings-row">
          <div className="settings-label">
            <span>{t("settings.preview")}</span>
            <Help id="help-preview">{t("settings.help.preview")}</Help>
          </div>
          <div className="settings-control">
            <div className="preview">{fmtPreview()}</div>
          </div>
        </div>

        {/* Memory bar length */}
        <div className="settings-row">
          <div className="settings-label">
            <span>{t("settings.memBar.length.label")}</span>
            <Help id="help-membar">{t("settings.memBar.length.help")}</Help>
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
                if (raw === "") return update({ memBarMax: "" });
                const n = Math.max(1, Math.min(500, Math.floor(+raw)));
                update({ memBarMax: n });
              }}
              onBlur={(e) => {
                if (e.target.value === "") update({ memBarMax: 50 });
              }}
            />
          </div>
        </div>

        {/* Clear memory */}
        <div className="settings-row">
          <div className="settings-label">
            <span>{t("settings.clearMemory.label")}</span>
            <Help id="help-clear">{t("settings.clearMemory.help")}</Help>
          </div>
          <div className="settings-control">
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (window.confirm(t("settings.clearMemory.confirm"))) clear();
              }}
            >
              {t("settings.clearMemory.button")}
            </button>
          </div>
        </div>

        {/* Choose theme */}
        <div className="settings-row">
          <div className="settings-label">
            <span>{t("settings.theme.label")}</span>
            <Help id="help-theme">{t("settings.theme.help")}</Help>
          </div>
          <div className="settings-control">
            <select
              value={settings.themeName}
              onChange={(e) => update({ themeName: e.target.value })}
            >
              {availableThemes.map((key) => (
                <option key={key} value={key}>
                  {/* Try translate "settings.theme.option.<key>" else show the key */}
                  {t(`settings.theme.option.${key}`, { defaultValue: key })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Memory bar position */}
        <div className="settings-row">
          <div className="settings-label">
            {t("settings.memBar.position.label")}
          </div>
          <div className="settings-control">
            <select
              value={settings.memBarPosition}
              onChange={(e) => update({ memBarPosition: e.target.value })}
            >
              <option value="top">{t("settings.memBar.position.top")}</option>
              <option value="bottom">{t("settings.memBar.position.bottom")}</option>
              <option value="hidden">{t("settings.memBar.position.hidden")}</option>
            </select>
          </div>
        </div>

        {/* Reset */}
        <div className="settings-row">
          <div className="settings-label">
            <span>{t("settings.reset.label")}</span>
            <Help id="help-reset">{t("settings.reset.help")}</Help>
          </div>
          <div className="settings-control">
            <button
              type="button"
              className="btn"
              onClick={() => update({ decimalSeparator: ".", fractionDigits: 4 })}
            >
              {t("settings.reset.button")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
