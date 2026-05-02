const aliasMap = {
  gm: "gmail",
  mail: "gmail",
  yt: "youtube",
  gh: "github",
  docs: "google docs",
  drive: "google drive",
  cal: "google calendar",
  work: "work",
  canvas: "smu.instructure",
  can: "smu.instructure",
  canv: "smu.instructure",
  canva: "smu.instructure",
  onedrive: "smu365-my.sharepoint",
  one: "smu365-my.sharepoint"
};

// ---------------- NORMALIZE ----------------
export function normalizeQuery(query) {
  const words = query.toLowerCase().trim().split(" ");
  return words.map(w => aliasMap[w] || w).join(" ");
}

// ---------------- SEARCH HANDLER ----------------
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