
import React, { useEffect, useMemo, useState } from "react";
import "./Lerp.css"

import InputPanel from "../InputPanel";
import ValueList from "../ValueList";
import {useNumberFormat, usePersistentState} from "../../SettingsContext";


export default function StepsPC({pageContext}) {
  var states = [];

  const [x0, setX0] = usePersistentState("steps-x0", "2.5");
  states.push([x0, setX0, "Start" ]);
  const [x1, setX1] = usePersistentState("steps-x1", "9.25");
  states.push([x1, setX1, "Spacing" ]);
  const [steps, setSteps] = usePersistentState("steps-steps", "123");
  states.push([steps, setSteps, "Steps" ]);

  const {toNum} = useNumberFormat();

  const parsed = {
    x0: toNum(x0),
    step: toNum(x1),
    n: Math.min(999, Math.max(1, Math.floor(Number(steps)))), // clamp to >= 1
  };

  const hasInvalidInput =
    Number.isNaN(parsed.x0) || Number.isNaN(parsed.x1) || !Number.isFinite(parsed.n);

  const values = useMemo(() => {
    if ( hasInvalidInput ) return [];
    const { x0, step, n } = parsed;

    const arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = x0 + step * i;
    }
    return arr;
  }, [x0, x1, steps]);


  const [lastPicked, setLastPicked] = useState(null); // for future mem-list UX

  const handlePick = (value) => { setLastPicked(value);
    // TODO: push to mem-list state and expose it in a side panel / dropdowns
  };

  return (
    <div className="lerp-page">
        <InputPanel
          states={states}
            >

          {hasInvalidInput ? (
            <p className="user-err-msg">
              Enter valid numbers. “Steps” should be an integer ≥ 1.
            </p>
          ) : (
            <>
              {/*
              <p className="user-msg">
                Generated {values.length} value{values.length === 1 ? "" : "s"} from x0 to x1 (inclusive)
                {lastPicked != null ? ` • last picked: ${fmt(lastPicked)}` : ""}
                .
              </p>
              */}
            </>

          )}
        </InputPanel>

        {!hasInvalidInput ? (
          <ValueList
            values = {values}
            handlePick={handlePick}
          />
        ) : ""}
    </div>
  );
}
