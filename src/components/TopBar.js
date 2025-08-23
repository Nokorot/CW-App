import React, { useCallback, useState, useRef, useEffect }  from "react";
import "./TopBar.css";




const TopBar = ({ pageContext, widget }) => {
  // const { user, isAuthenticated, logout } = useAuth0();
  // const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  // const [menuOpen, setMenuOpen] = useState(false);
  // const menuRef = useRef();


  const menuStateClosed = { type: 'closed' };

  const optionsRef = useRef();
  const menuStateOptions = { type: 'options', ref: optionsRef };

  const userMenuRef = useRef();
  const menuStateUserMenu = { type: 'user', ref: userMenuRef };

  const [menuState, setMenuState] = useState(menuStateClosed);

  const closeMenu = useCallback(() => setMenuState(menuStateClosed), []);
  const openOptions  = useCallback(() => setMenuState(menuStateOptions), []);
  const openUserMenu  = useCallback(() => setMenuState(menuStateUserMenu), []);

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


  const setViewState = (page) => {
    pageContext.setViewState({type: page});
    closeMenu();
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
      {/*
    <div className="top-bar-user" ref={menuRef}>
        {isAuthenticated && user && (
          <>
            <img
              src={user.picture}
              alt={user.name}
              className="top-bar-user-pic"
              onClick={() => setMenuOpen((open) => !open)}
              style={{ cursor: "pointer" }}
            />
            {menuOpen && (
              <div className="user-menu-popup">
                <button className="user-menu-item">Your Profile</button>
                <button className="user-menu-item">Settings</button>
                <button
                  className="user-menu-item"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  Log Out
                </button>
 */}
                {/* <button className="user-menu-item">Help</button> */}
    {/*
              </div>
            )}
          </>
        )}
      </div>
  */}

      { menuState.type == menuStateOptions.type && (
        <>
          <div className="drawer-overlay" onClick={closeMenu} />
          <nav
            className="options-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Options"
          >
            <button
              className={`option-item`}
              onClick={() => setViewState("lerp")}
            >
              Linear Spacing
            </button>
            <button
              className={`option-item`}
              onClick={() => setViewState("steps")}
            >
              Step Spacing
            </button>

            {/* Add more pages here later */}
            {/* <button className="option-item" onClick={() => go("/something")}>Something</button> */}
          </nav>
        </>
      )}

    </div>
  );
};

export default TopBar;
