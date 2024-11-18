import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && "serviceWorker" in navigator && "Notification" in window) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/stock-news/build/sw.js?v=v_1")
//       .then((registration) => {
//         if (Notification.permission !== "granted") {
//           Notification.requestPermission();
//         }
//       });
//   });
// }
