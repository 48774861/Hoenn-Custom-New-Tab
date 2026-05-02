import { buildBookmarkIndex, searchBookmarks, navigate } from "./bookmarks.js";
import {
  createBookmark,
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

  let root = [];
  let currentFolder = null;

  // ---------------- HELPERS (DEFINED ONCE) ----------------
  const helpers = {
    createBookmark: (node) => createBookmark(node, navigate),

    createFolder: (node) =>
        createFolder(node, (folder) => {
            currentFolder = folder;
            renderFolder(folder, dock, helpers);
        }),

    createBackButton: () =>
        createBackButton(() => {
            currentFolder = null;
            renderRoot(root, dock, helpers);
        })
    };

  // ---------------- BOOKMARK INIT ----------------
  chrome.bookmarks.getTree((tree) => {
    const bar = tree?.[0]?.children?.find(n => n.id === "1");
    root = bar?.children || [];

    buildBookmarkIndex(root);

    renderRoot(root, dock, helpers);
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

  // ---------------- INIT OTHER FEATURES ----------------
  startClock();
  startWeather();
  initNotes();
  initWiggle();
});