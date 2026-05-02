import { createBookmark } from "./bookmarks.js"

let root = [];
let currentFolder = null;

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

// ---------------- ROOT ----------------
export function renderRoot(root, dock) {
  dock.innerHTML = "";
  currentFolder = null;

  root.forEach(node => {
    if (node.url) {
      const el = createBookmark(node);
      el.addEventListener("click", () => navigate(node.url));
      dock.appendChild(el);
    } else if (node.children) {
      const el = createFolder(node);
      el.addEventListener("click", () => renderFolder(node, root, dock));
      dock.appendChild(el);
    }
  });
}

// ---------------- FOLDER ----------------
export function renderFolder(folder, root, dock) {
  dock.innerHTML = "";
  currentFolder = folder;

  // back button
  const back = createBackButton();
  back.addEventListener("click", () => { renderRoot(root, dock); });
  dock.appendChild(back);

  folder.children.forEach(node => {
    if (node.url) {
      const el = createBookmark(node);
      el.addEventListener("click", () => navigate(node.url));
      dock.appendChild(el);
    } else if (node.children) {
      const el = createFolder(node);
      el.addEventListener("click", () => renderFolder(node));
      dock.appendChild(el);
    }
  });
}