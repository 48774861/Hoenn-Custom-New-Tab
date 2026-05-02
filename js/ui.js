// ---------------- BOOKMARK ----------------
export function createBookmark(node, navigate) {
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

// ---------------- ICON LOADER ----------------
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

// ---------------- FOLDER ----------------
export function createFolder(node) {
    const img = document.createElement("img");

    img.src = chrome.runtime.getURL("icons/folder.png");
    img.title = node.title;

    img.addEventListener("click", () => {
        currentFolder = node;
        renderFolder(node);
    });

    return img;
}

// ---------------- BACK ----------------
export function createBackButton() {
    const img = document.createElement("img");

    img.src = chrome.runtime.getURL("icons/backbutton.png");
    img.title = "Back";

    img.addEventListener("click", () => {
        currentFolder = null;
        renderRoot();
    });

    return img;
}

// ---------------- ROOT ----------------
export function renderRoot(root, dock, helpers) {
    dock.innerHTML = "";

    root.forEach(node => {
        if (node.url) {
            dock.appendChild(helpers.createBookmark(node));
        } else if (node.children) {
            dock.appendChild(helpers.createFolder(node));
        }
    });
}

// ---------------- FOLDER ----------------
export function renderFolder(folder, dock, helpers) {
    dock.innerHTML = "";

    dock.appendChild(helpers.createBackButton());

    (folder.children || []).forEach(node => {
        if (node.url) {
            dock.appendChild(helpers.createBookmark(node));
        } else if (node.children) {
            dock.appendChild(helpers.createFolder(node));
        }
    });
}