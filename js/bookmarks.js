export let bookmarkIndex = [];

// ---------------- INDEX ----------------
export function buildBookmarkIndex(nodes) {
  nodes.forEach(node => {
    if (node.url) {
      bookmarkIndex.push({
        title: node.title || "",
        url: node.url
      });
    }

    if (node.children) {
      buildBookmarkIndex(node.children);
    }
  });
}

// ---------------- SEARCH ----------------
export function searchBookmarks(query) {
  query = normalizeQuery(query);

  return bookmarkIndex.filter(b =>
    b.title.toLowerCase().includes(query) ||
    b.url.toLowerCase().includes(query)
  );
}

// Navigate to a new link.
export function navigate(url) {
  setTimeout(() => {
    window.location.href = url;
  }, 0.001);
}