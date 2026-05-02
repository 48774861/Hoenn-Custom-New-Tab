
import { initWiggle } from "./animation.js";
import { navigate } from "../shared_functions/url_navigation.js";
import { searchBookmarks } from "../bookmarks/search_bookmarks.js";

export function setupSearchBar() {
    const searchInput = document.getElementById("search");
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

    initWiggle();
}