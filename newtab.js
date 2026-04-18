let bookmarkIndex = [];

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
function normalizeQuery(query) {
  const words = query.toLowerCase().trim().split(" ");
  return words.map(w => aliasMap[w] || w).join(" ");
}

// ---------------- INDEX ----------------
function buildBookmarkIndex(nodes) {
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
function searchBookmarks(query) {
  query = normalizeQuery(query);

  return bookmarkIndex.filter(b =>
    b.title.toLowerCase().includes(query) ||
    b.url.toLowerCase().includes(query)
  );
}

// ---------------- SEARCH HANDLER ----------------
function handleSearch(input) {
  const query = input.trim();
  if (!query) return;

  const results = searchBookmarks(query);

  if (results.length > 0) {
    window.open(results[0].url, "_blank");
  } else {
    window.location.href =
      "https://www.google.com/search?q=" +
      encodeURIComponent(query);
  }
}

// ---------------- OMNIBOX QUERY ----------------
function getOmniboxQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q");
}

// ---------------- MAIN ----------------
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("settings-btn");
  const dock = document.getElementById("app-dock");

  const searchInput = document.getElementById("search");
  const topSearch = document.getElementById("top-search");

  let root = [];
  let currentFolder = null;

  // ---------------- SETTINGS BUTTON ----------------
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

  // ---------------- BOOKMARK ----------------
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

  // ---------------- FOLDER ----------------
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

  // ---------------- BACK ----------------
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

  // ---------------- ROOT ----------------
  function renderRoot() {
    dock.innerHTML = "";

    root.forEach(node => {
      if (node.url) {
        dock.appendChild(createBookmark(node));
      } else if (node.children) {
        dock.appendChild(createFolder(node));
      }
    });
  }

  // ---------------- FOLDER ----------------
  function renderFolder(folder) {
    dock.innerHTML = "";

    dock.appendChild(createBackButton());

    (folder.children || []).forEach(node => {
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

    bookmarkIndex = [];
    buildBookmarkIndex(bar?.children || []);

    renderRoot();

    const q = getOmniboxQuery();
    if (q) handleSearch(q);
  });

  // ---------------- SEARCH BAR ----------------
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const query = searchInput.value.trim();
      if (!query) return;

      const results = searchBookmarks(query);

      if (results.length > 0) {
        window.open(results[0].url, "_blank");
      } else {
        window.location.href =
          "https://www.google.com/search?q=" +
          encodeURIComponent(query);
      }
    });
  }

  // ---------------- 🔥 CLEAN RELIABLE FOCUS (FINAL FIX) ----------------
  window.addEventListener("load", () => {
    const searchInput = document.getElementById("search");

    if (!searchInput) return;

    setTimeout(() => {
      searchInput.focus();

      const len = searchInput.value.length;
      searchInput.setSelectionRange(len, len);
    }, 250);
  });

});

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");

  if (!searchInput) return;

  let lastTime = 0;

  function getIntensity() {
    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;

    // smaller delta = faster typing
    if (delta < 80) return "fast";
    if (delta < 180) return "medium";
    return "slow";
  }

  function wiggle(intensity) {
    searchInput.style.animation = "none";
    void searchInput.offsetHeight;

    if (intensity === "fast") {
      searchInput.style.animation = "wiggleFast 0.12s ease";
    } else if (intensity === "medium") {
      searchInput.style.animation = "wiggle 0.15s ease";
    } else {
      searchInput.style.animation = "wiggleSoft 0.2s ease";
    }
  }

  searchInput.addEventListener("keydown", () => {
    const intensity = getIntensity();
    wiggle(intensity);
  });

  searchInput.addEventListener("click", () => wiggle("medium"));
  searchInput.addEventListener("focus", () => wiggle("medium"));
});