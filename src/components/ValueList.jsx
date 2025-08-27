
import {useNumberFormat} from "../SettingsContext";
import {useMemory} from "./MemoryContext";
import "./ValueList.css";

export default function ValueList({ values }) {
  const { add } = useMemory();
  const { fmt } = useNumberFormat();

  return (
      <div className="results-wrap" role="region" aria-label="Results">
          <div className="result-grid">
            {values.map((v, i) => {
              const label = fmt(v);
              return (
                <button
                  key={`${i}-${label}`}
                  type="button"
                  className="result-chip"
                  onClick={() => add(v)}
                  aria-label={`Pick value ${label}`}
                  title={`Pick ${label}`}
                >
                  {/* <code>#{i}</code>&nbsp;*/} {label}
                </button>
              );
            })}
          </div>
      </div>
  );
};
