import React, { useCallback, useState, useRef, useEffect }  from "react";
import "./TopBar.css";




const TopBar = ({ pageContext, widget }) => {
  const menuStateClosed = { type: 'closed' };

  const optionsRef = useRef();
  const menuStateOptions = { type: 'options', ref: optionsRef };

  const [menuState, setMenuState] = useState(menuStateClosed);

  const closeMenu = useCallback(() => setMenuState(menuStateClosed), []);
  const openOptions  = useCallback(() => setMenuState(menuStateOptions), []);

  // Close Options on Escape or when clicking outside
  useEffect(() => {
    if (menuState.type == menuStateClosed.type) return;
    const onKey = (e) => { if (e.key === "Escape") closeMenu(); };
    window.addEventListener("keydown", onKey);

    const onClick = (event) => {
      if (menuState.ref.current && !menuState.ref.current.contains(event.target))
        closeMenu();
    }
    window.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick)
    }
  }, [menuState]);


  // Lock body scroll when drawer is open (mobile comfort)
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuState.type != menuStateClosed.type)
      document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuState]);


  const setViewState = (view) => {
    pageContext.setViewState(view);
    closeMenu();
  }

  const isActive = (view) => {
    return view.type == pageContext.currentView.type;
  }

  return (
    <div className="top-bar">
      <button
        className="top-bar-icon"
        aria-label="Options"
        onClick={openOptions}
      >
        {/* Hamburger menu icon (SVG) */}
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h24M3 12h24M3 18h24" stroke="currentColor" strokeWidth="2" fill="#333"/>
        </svg>
      </button>

      <div className="top-bar-widget">
        {widget}
      </div>

      { menuState.type == menuStateOptions.type && (
        <>
          <div className="drawer-overlay" onClick={closeMenu} />
          <nav
            className="options-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Options"
          >

            {Object.keys(pageContext.viewStates).map(key => {
              var view = pageContext.viewStates[key];

              if (!view.topBarMenu)
                return;

              return (<button
                  key={view.type}
                  className={`option-item ${isActive(view) ? "active" : ""}`}
                  onClick={() => setViewState(view)}
                >
                { view.title }
              </button>);
            })}

            <button
              className="options-close-btn"
              onClick={() => closeMenu()}
              aria-label="Close menu"
            >
              ✕
            </button>
          </nav>

        </>
      )}

    </div>
  );
};

export default TopBar;
