import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// TODO: Replace the following with your app's Firebase configuration
const firebaseConfig = {
  //...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://victory-road-70e2b-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
