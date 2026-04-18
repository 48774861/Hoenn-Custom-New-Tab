document.addEventListener("DOMContentLoaded", () => {
const btn = document.getElementById("settings-btn");

btn.addEventListener("click", () => {
chrome.tabs.create({ url: "chrome://settings/" });
});

const dock = document.getElementById("app-dock");

function loadValidIcon(img, sources, defaultIcon) {
let index = 0;

function tryNext() {
  if (index >= sources.length) {
    img.src = defaultIcon;
    return;
  }

  const src = sources[index];
  const testImg = new Image();

  // ⏱️ Timeout = treat as failure (like unreachable/blocked/slow servers)
  const timeout = setTimeout(() => {
    testImg.src = ""; // cancel
    index++;
    tryNext();
  }, 1200);

  testImg.onload = () => {
    clearTimeout(timeout);

    const w = testImg.naturalWidth;
    const h = testImg.naturalHeight;

    // 🚫 Reject bad images
    if (
      w < 32 ||
      h < 32 ||
      src.endsWith(".ico") // optional but VERY effective
    ) {
      index++;
      tryNext();
      return;
    }

    // ✅ Accept
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

chrome.bookmarks.getTree((tree) => {
const root = tree?.[0]?.children || [];

function walk(nodes) {
  nodes.forEach((node) => {
    if (node.url) {
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

      const sources = [
        customIcon,
        duckIcon,
        googleIcon
      ].filter(Boolean);

      loadValidIcon(img, sources, defaultIcon);

      img.addEventListener("click", () => {
        window.open(node.url, "_blank");
      });

      dock.appendChild(img);
    }

    if (node.children) {
      walk(node.children);
    }
  });
}

walk(root);

});
});
