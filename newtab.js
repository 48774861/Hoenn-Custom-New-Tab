import { setupBookmarks } from "./js/bookmarks/setup.js";
import { setupSearchBar } from "./js/search_bar/setup.js";
import { setupClock } from "./js/clock.js";
import { setupRandomizedGIF } from "./js/randomized_gif/setup.js";
import { setupSettingsButton } from "./js/settings.js";
import { setupWeather } from "./js/weather.js";
import { setupNotesBox } from "./js/notes.js";

document.addEventListener("DOMContentLoaded", () => {

  setupBookmarks();
  setupClock();
  setupNotesBox();
  setupRandomizedGIF();
  setupSearchBar();
  setupWeather();

  const settingsBtn = document.getElementById("settings-btn");

  settingsBtn?.addEventListener("click", () => {
    chrome.tabs.update({ url: "chrome://settings/" });
  });

});