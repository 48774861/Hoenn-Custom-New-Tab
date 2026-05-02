import { navigate } from "./shared_functions/url_navigation.js";

export function handleSearch(input) {
  const query = input.trim();
  if (!query) return;

  const results = searchBookmarks(query);

  if (results.length > 0) {
    navigate(results[0].url);
  } else {
    window.location.href =
      "https://www.google.com/search?q=" +
      encodeURIComponent(query);
  }
}