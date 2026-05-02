/*
  Gets the bookmarks from the Chrome browser's bookmarks bar.
  Renders all the icons for the bookmarks bar, including folder navigation within the bookmarks bar.
*/

import { createBookmark, createFolder, createBackButton } from "./get_icons.js"
import { buildBookmarkIndex } from "./search_bookmarks.js";
import { navigate } from "../shared_functions/url_navigation.js";

export function setupBookmarks() {

  let root = [];
  const dock = document.getElementById("app-dock");

  // Gets the bookmarks from the Chrome browser and renders it.
  chrome.bookmarks.getTree((tree) => {
      const bar = tree?.[0]?.children?.find(n => n.id === "1");
      root = bar?.children || [];

      buildBookmarkIndex(root);
      renderRoot(root, dock);
  });
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