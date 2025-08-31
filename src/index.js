import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {ensureLanguage} from './i18n';

// simple resolver: 1) saved choice, 2) browser language, 3) 'en'
function resolveInitialLang() {
  const saved = localStorage.getItem("lng");
  if (saved) return saved;
  const browser = navigator.language?.split("-")[0]; // e.g. "nb" from "nb-NO"
  return browser || "en";
}

(async () => {
  await ensureLanguage(resolveInitialLang());
  ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  );
})();

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
