document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("settings-btn");
  const dock = document.getElementById("app-dock");

  let root = [];
  let currentFolder = null;

  btn.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://settings/" });
  });

  // ---------------- ICON LOADER ----------------
  function loadValidIcon(img, sources, defaultIcon) {
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

  // ---------------- BOOKMARK ICON ----------------
  function createBookmark(node) {
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
      window.open(node.url, "_blank");
    });

    return img;
  }

  // ---------------- FOLDER ICON ----------------
  function createFolder(node) {
    const img = document.createElement("img");

    img.src = chrome.runtime.getURL("icons/folder.png");
    img.title = node.title;
    img.style.cursor = "pointer";

    img.addEventListener("click", () => {
      currentFolder = node;
      renderFolder(node);
    });

    return img;
  }

  // ---------------- BACK BUTTON ----------------
  function createBackButton() {
    const img = document.createElement("img");

    img.src = chrome.runtime.getURL("icons/backbutton.png");
    img.title = "Back";
    img.style.cursor = "pointer";

    img.addEventListener("click", () => {
      currentFolder = null;
      renderRoot();
    });

    return img;
  }

  // ---------------- LEVEL 1 VIEW ----------------
  function renderRoot() {
    dock.innerHTML = "";

    root.forEach((node) => {
      if (node.url) {
        dock.appendChild(createBookmark(node));
      } else if (node.children) {
        dock.appendChild(createFolder(node));
      }
    });
  }

  // ---------------- LEVEL 2 VIEW ----------------
  function renderFolder(folder) {
    dock.innerHTML = "";

    dock.appendChild(createBackButton());

    (folder.children || []).forEach((node) => {
      if (node.url) {
        dock.appendChild(createBookmark(node));
      } else if (node.children) {
        dock.appendChild(createFolder(node));
      }
    });
  }

  // ---------------- INIT ----------------
  chrome.bookmarks.getTree((tree) => {
    const bar = tree?.[0]?.children?.find(n => n.id === "1");
    root = bar?.children || [];

    renderRoot();
  });
});
