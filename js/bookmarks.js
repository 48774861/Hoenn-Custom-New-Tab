import { navigate } from "./shared_functions/url_navigation.js";

export let bookmarkIndex = [];
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

export function createBookmark(node) {
    const img = document.createElement("img");

    let domain = "";
    try {
        domain = new URL(node.url).hostname;
    } catch {}

    let clean = node.url.toLowerCase()
        .replace("https://", "")
        .replace("http://", "")
        .replace("www.", "");

    const firstWord = clean.substring(0, 10);

    const customIcon = chrome.runtime.getURL(`icons/${firstWord}.png`);
    const defaultIcon = chrome.runtime.getURL("icons/default.png");

    const duckIcon = domain
        ? `https://icons.duckduckgo.com/ip3/${domain}.ico`
        : null;

    const googleIcon = domain
        ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
        : null;

    const sources = [customIcon, duckIcon, googleIcon].filter(Boolean);

    loadValidIcon(img, sources, defaultIcon);

    img.title = node.title;

    img.addEventListener("click", () => {
        navigate(node.url);
    });

    return img;
}

export function loadValidIcon(img, sources, defaultIcon) {
  let index = 0;

  function tryNext() {
    if (index >= sources.length) {
      img.src = defaultIcon;
      return;
    }

    const src = sources[index];
    const testImg = new Image();

    const timeout = setTimeout(() => {
      testImg.src = "";
      index++;
      tryNext();
    }, 1200);

    testImg.onload = () => {
      clearTimeout(timeout);

      const w = testImg.naturalWidth;
      const h = testImg.naturalHeight;

      if (w < 32 || h < 32 || src.endsWith(".ico")) {
        index++;
        tryNext();
        return;
      }

      img.src = src;
    };

    testImg.onerror = () => {
      clearTimeout(timeout);
      index++;
      tryNext();
    };

    testImg.src = src;
  }

  tryNext();
}

export function normalizeQuery(query) {
  const words = query.toLowerCase().trim().split(" ");
  return words.map(w => aliasMap[w] || w).join(" ");
}

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

// // Navigate to a new link.
// export function navigate(url) {
//   setTimeout(() => {
//     window.location.href = url;
//   }, 0.001);
// }