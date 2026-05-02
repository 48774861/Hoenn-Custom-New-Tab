import { createBookmark } from "./bookmarks.js"

export function createFolder(node) {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("icons/folder.png");
  img.title = node.title;
  return img;
}

export function createBackButton() {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("icons/backbutton.png");
  img.title = "Back";
  return img;
}

// Render the original bookmarks bar
export function renderRoot(root, dock) {
  dock.innerHTML = ""; // Reset the bookmarks currently rendered in the dock.

  // For each bookmark in the original bookmarks bar
  root.forEach(node => {
    if (node.url) { // Navigate to the bookmark's URL if it's an actual bookmark.
      const el = createBookmark(node);
      el.addEventListener("click", () => navigate(node.url));
      dock.appendChild(el);
    } else if (node.children) { // Make it a folder if has bookmarks inside of it.
      const el = createFolder(node);
      el.addEventListener("click", () => renderFolder(node, root, dock));
      dock.appendChild(el);
    }
  });
}

// Render the bookmarks within a folder
export function renderFolder(folder, root, dock) {
  dock.innerHTML = ""; // Reset the bookmarks currently rendered in the dock.

  // Back Button renders the previous bookmarks bar again.
  const back = createBackButton();
  back.addEventListener("click", () => { renderRoot(root, dock); });
  dock.appendChild(back);

  // For each bookmark in the current folder
  folder.children.forEach(node => {
    if (node.url) { // Navigate to the bookmark's URL if it's an actual bookmark.
      const el = createBookmark(node);
      el.addEventListener("click", () => navigate(node.url));
      dock.appendChild(el);
    } else if (node.children) { // Make it a folder if has bookmarks inside of it.
      const el = createFolder(node);
      el.addEventListener("click", () => renderFolder(node));
      dock.appendChild(el);
    }
  });
}