import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { store } from "./redux/store";
import "./i18n";
import "./Styles/index.css";
import { fetchPublicFavicon } from "./utils/siteFavicon";

fetchPublicFavicon();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

const appShell = document.getElementById("app-shell");

function hideAppShell() {
  if (!appShell) return;
  appShell.classList.add("fade-out");
  window.setTimeout(() => appShell.remove(), 480);
}

if (appShell) {
  window.addEventListener(
    "dashboard:ready",
    () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(hideAppShell);
      });
    },
    { once: true },
  );

  window.setTimeout(hideAppShell, 8000);
}
