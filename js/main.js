import { createBookmark, buildBookmarkIndex, searchBookmarks } from "./bookmarks.js";
import { navigate } from "./shared_functions/url_navigation.js";
import {
  createFolder,
  createBackButton,
  renderRoot,
  renderFolder
} from "./ui.js";

import { startClock } from "./clock.js";
import { startWeather } from "./weather.js";
import { initNotes } from "./notes.js";
import { initWiggle } from "./effects.js";

document.addEventListener("DOMContentLoaded", () => {
  const dock = document.getElementById("app-dock");
  const searchInput = document.getElementById("search");

  // ---------------- STATE ----------------
  let root = [];
  let currentFolder = null;

  // ---------------- BOOKMARK INIT ----------------
  chrome.bookmarks.getTree((tree) => {
      const bar = tree?.[0]?.children?.find(n => n.id === "1");
      root = bar?.children || [];

      buildBookmarkIndex(root);

      renderRoot(root, dock);
  });

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