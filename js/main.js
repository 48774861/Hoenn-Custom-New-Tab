import { setupBookmarks } from "./bookmarks/setup.js";
import { setupSearchBar } from "./search_bar/setup.js";

import { setupClock } from "./clock.js";
import { startWeather } from "./weather.js";
import { initNotes } from "./notes.js";

document.addEventListener("DOMContentLoaded", () => {
  
  const searchInput = document.getElementById("search");

  setupBookmarks();
  setupSearchBar();

  const settingsBtn = document.getElementById("settings-btn");

  settingsBtn?.addEventListener("click", () => {
    chrome.tabs.update({ url: "chrome://settings/" });
  });

  // ---------------- INIT OTHER FEATURES ----------------
  setupClock();
  startWeather();
  initNotes();
});