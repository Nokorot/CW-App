import "./InputPanel.css";

export default function InputPanel({ states, children }) {
  return (
      <div className="sticky-block">
        <div className="input-panel">
            {states.map((v, i) => {
              return (
                <label
                  key={`${i}`}
                >
                  <span>{v[2]}</span>
                  <input type="number" value={v[0]} onChange={(e) => v[1](e.target.value)} />
                </label>
              );
            })}



          {children}
        </div>
      </div>
  );
};
