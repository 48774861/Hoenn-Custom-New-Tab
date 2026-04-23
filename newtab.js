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
    navigate(results[0].url);
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

// Navigate to a new link.
function navigate(url) {
  setTimeout(() => {
    window.location.href = url;
  }, 0.001);
}

// ---------------- MAIN ----------------
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("settings-btn");
  const dock = document.getElementById("app-dock");

  const searchInput = document.getElementById("search");

  let root = [];
  let currentFolder = null;

  // ---------------- SETTINGS BUTTON ----------------
  btn.addEventListener("click", () => {
    chrome.tabs.update({ url: "chrome://settings/" });
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
      navigate(node.url);
    });

    return img;
  }

  // ---------------- FOLDER ----------------
  function createFolder(node) {
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
  function createBackButton() {
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
  function renderRoot() {
    dock.innerHTML = "";

    root.forEach(node => {
      if (node.url) dock.appendChild(createBookmark(node));
      else if (node.children) dock.appendChild(createFolder(node));
    });
  }

  // ---------------- FOLDER ----------------
  function renderFolder(folder) {
    dock.innerHTML = "";

    dock.appendChild(createBackButton());

    (folder.children || []).forEach(node => {
      if (node.url) dock.appendChild(createBookmark(node));
      else if (node.children) dock.appendChild(createFolder(node));
    });
  }

  // ---------------- INIT ----------------
  chrome.bookmarks.getTree((tree) => {
    const bar = tree?.[0]?.children?.find(n => n.id === "1");
    root = bar?.children || [];

    bookmarkIndex = [];
    buildBookmarkIndex(bar?.children || []);

    renderRoot();
  });

  // ---------------- SEARCH ----------------
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const query = searchInput.value.trim();
      if (!query) return;

      const results = searchBookmarks(query);

      if (results.length > 0) navigate(results[0].url);
      else {
        window.location.href =
          "https://www.google.com/search?q=" +
          encodeURIComponent(query);
      }
    });
  }

  // ---------------- FOCUS FIX ----------------
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

// ---------------- WIGGLE EFFECT ----------------
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;

  let lastTime = 0;

  function getIntensity() {
    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;

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

  searchInput.addEventListener("keydown", () => wiggle(getIntensity()));
  searchInput.addEventListener("click", () => wiggle("medium"));
  searchInput.addEventListener("focus", () => wiggle("medium"));
});

// ---------------- CLOCK ----------------
function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();

  const date = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  clock.innerHTML = `${date}<br>${time}`;
}

setInterval(updateClock, 1000);
updateClock();


function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getTempGradientSpan(temp) {

  const maxTemp = 110;
  const minTemp = 10;
  const avgTemp = (maxTemp + minTemp) / 2.0;
  const temp_in_range = Math.max(Math.min(maxTemp, temp), minTemp)
  const t = (temp_in_range - minTemp) / (maxTemp - minTemp)
  const far_from_avg = Math.pow(Math.abs(t - 0.5) * 2, 0.5);

  // Optionals: you can tweak these if you want more/less intensity based on temp
  const startColor = "#edd8ac"; // light brown
  const gradient = 60 - far_from_avg*50;

  const coldVivid = "#3a86ff";
  const hotVivid  = "#ff3838";
  const c1Hex = "#edd8ac";

  const hexToRgb = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const lerpColor = (a, b, t) => ({
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  });

  const c1 = hexToRgb(c1Hex);
  const c2 = hexToRgb(temp >= avgTemp ? hotVivid : coldVivid);

  const { r, g, b } = lerpColor(c1, c2, far_from_avg);

  const endColor = `rgb(${r}, ${g}, ${b})`;

  return `
    <span class="temp-text"
      style="
        --start-color: ${startColor || '#edd8ac'};
        --end-color: ${endColor || '#ff3838'};
        --gradient: ${gradient ?? 50}%;
      "
    >
      ${temp}°F
    </span>
  `;
}

// ---------------- FORECAST ----------------
async function loadForecast() {
  const forecastEl = document.getElementById("forecast");
  if (!forecastEl) return;

  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = new Date().getDay();

  forecastEl.innerHTML = "";

  // Header
  const header = document.createElement("div");
  header.className = "weather-plank weather-header";
  header.innerHTML = `<div style="font-weight:800;font-size:24px">Weather Forecast</div>`;
  forecastEl.appendChild(header);

  const sway = document.createElement("div");
  sway.className = "forecast-sway";

  const stack = document.createElement("div");
  stack.className = "forecast-stack";

  sway.appendChild(stack);
  forecastEl.appendChild(sway);

  try {
    const lat = 32.9483;
    const lon = -96.7299;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&forecast_days=7&temperature_unit=fahrenheit`;

    const res = await fetch(url);
    const data = await res.json();

    const temps = data.daily.temperature_2m_max;
    const codes = data.daily.weathercode;

    const weatherIcons = {
      0: "☀️",
      1: "🌤️",
      2: "⛅",
      3: "☁️",
      45: "🌫️",
      48: "🌫️",
      51: "🌦️",
      61: "🌧️",
      71: "❄️",
      80: "🌦️",
      95: "⛈️"
    };

    for (let i = 0; i < 7; i++) {
      const div = document.createElement("div");
      div.className = "weather-plank";

      const date = new Date();
      date.setDate(date.getDate() + i);

      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate();
      const year = date.getFullYear();

      const weekday = weekdays[(today + i) % 7];

      const icon = weatherIcons[codes[i]] || "☁️";
      const temp = Math.round(temps[i]);

      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:stretch;gap:20px;">

          <div style="display:flex;flex-direction:column;gap:2px;justify-content:center;">

            <div style="font-size:16px;font-weight:700;line-height:1.1;">
              ${month} ${day}, ${year}
            </div>

            <div style="font-size:12px;opacity:0.7;line-height:1.1;margin-top:-2px;">
              ${weekday}
            </div>

          </div>

          <!-- RIGHT SIDE (true vertical center) -->
          <div style="display:flex;align-items:center;justify-content:flex-end;">
            <div style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;">
              <span style="position: relative; display: inline-block; font-weight: 600;">

              <!-- Base layer -->
              ${getTempGradientSpan(temp)}

              </span>
              <span>${icon}</span>
            </div>
          </div>

        </div>
      `;

      stack.appendChild(div);
    }

  } catch (e) {
    stack.innerHTML = `<div class="weather-plank">Forecast unavailable</div>`;
  }
}

loadForecast();
setInterval(loadForecast, 10 * 60 * 1000);