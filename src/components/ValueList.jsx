
import "./ValueList.css";

export default function ValueList({ values, handlePick, fmt }) {
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
                  onClick={() => handlePick(v)}
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
