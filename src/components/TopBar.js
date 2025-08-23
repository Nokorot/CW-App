import React, { useState, useRef, useEffect }  from "react";
import "./TopBar.css";

const TopBar = ({ widget }) => {
  // const { user, isAuthenticated, logout } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="top-bar">
      <button className="top-bar-icon" aria-label="Options">
        {/* Hamburger menu icon (SVG) */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect y="4" width="24" height="2" rx="1" fill="#333" />
          <rect y="11" width="24" height="2" rx="1" fill="#333" />
          <rect y="18" width="24" height="2" rx="1" fill="#333" />
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

    </div>
  );
};

export default TopBar;
