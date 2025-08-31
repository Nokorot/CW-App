import React, { useMemo } from "react";
import "./Lerp.css"

import InputPanel from "../InputPanel";
import ValueList from "../ValueList";
import {useNumberFormat, usePersistentState} from "../../SettingsContext";
import {useTranslation} from "react-i18next";

export default function LerpPC({ }) {
  const {t} = useTranslation();

  var states = [];
  const [x0, setX0] = usePersistentState("lerp-x0", "2.5");
  states.push([x0, setX0, t("lerp.x0") ]);
  const [x1, setX1] = usePersistentState("lerp-x1", "9.25");
  states.push([x1, setX1, t("lerp.x1") ]);
  const [steps, setSteps] = usePersistentState("lerp-steps", "5");
  states.push([steps, setSteps, t("lerp.steps") ]);

  const {toNum} = useNumberFormat();

  const parsed = {
    x0: toNum(x0),
    x1: toNum(x1),
    n: Math.min(999, Math.max(1, Math.floor(Number(steps)))), // clamp to >= 1
  };


  const hasInvalidInput =
    Number.isNaN(parsed.x0) || Number.isNaN(parsed.x1) || !Number.isFinite(parsed.n);

  const values = useMemo(() => {
    if (hasInvalidInput) return [];
    const { x0, x1, n } = parsed;

    if (n === 1) return [x0];

    const arr = new Array(n);
    const step = (x1 - x0) / (n - 1);
    for (let i = 0; i < n; i++) {
      arr[i] = x0 + step * i;
    }
    return arr;
  }, [x0, x1, steps]);

  return (
    <div className="lerp-page">
        <InputPanel
          states={states}
            >
        </InputPanel>

        {!hasInvalidInput ? (
          <ValueList
            values = {values}
          />
        ) : ""}

    </div>
  );
}
