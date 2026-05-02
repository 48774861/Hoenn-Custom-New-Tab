import { searchBookmarks } from "./bookmarks/search_bookmarks.js";
import { navigate } from "./shared_functions/url_navigation.js";
import { setupBookmarks } from "./bookmarks/setup.js";

import { startClock } from "./clock.js";
import { startWeather } from "./weather.js";
import { initNotes } from "./notes.js";
import { initWiggle } from "./effects.js";

document.addEventListener("DOMContentLoaded", () => {
  const dock = document.getElementById("app-dock");
  const searchInput = document.getElementById("search");

  setupBookmarks(dock);

  // ---------------- SEARCH ----------------
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const query = searchInput.value.trim();
    if (!query) return;

    const results = searchBookmarks(query);

    if (results.length) {
      navigate(results[0].url);
    } else {
      window.location.href =
        "https://www.google.com/search?q=" +
        encodeURIComponent(query);
    }
  });

  const settingsBtn = document.getElementById("settings-btn");

  settingsBtn?.addEventListener("click", () => {
    chrome.tabs.update({ url: "chrome://settings/" });
  });

  // ---------------- INIT OTHER FEATURES ----------------
  startClock();
  startWeather();
  initNotes();
  initWiggle();
});