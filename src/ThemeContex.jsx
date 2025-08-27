import { createContext, useContext, useEffect, useState } from "react";
import themes from "./themes.json"; // import the file above

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState("default");

  useEffect(() => {
    const theme = themes[themeName];
    if (!theme) return;
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function getThemes() {
  return Object.keys(themes);
}


export function useTheme() {
  return useContext(ThemeContext);
}


  // background-color: #d9ead3;
