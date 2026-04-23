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
  // document.body.style.transition = "opacity 0.05s ease";
  // document.body.style.opacity = "0";
  
  setTimeout(() => {
    window.location.href = url;
  }, 0.001);
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
        navigate(results[0].url);
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

function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();

  // 🗓️ Date: Month Day, Year
  const date = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // 🕒 Time: US format with seconds
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

async function loadWeather() {
  const tempEl = document.getElementById("temp");
  const conditionEl = document.getElementById("condition");
  const extraEl = document.getElementById("extra");

  try {
    // 📍 Richardson, TX approx coords
    const lat = 32.9483;
    const lon = -96.7299;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`;

    const res = await fetch(url);
    const data = await res.json();

    const weather = data.current_weather;
    const temp = weather.temperature;
    const code = weather.weathercode;

    // 🌤️ simple condition mapping
    const conditions = {
      0: "Clear Sky",
      1: "Mostly Clear",
      2: "Partly Cloudy",
      3: "Cloudy",
      45: "Fog",
      48: "Fog",
      51: "Drizzle",
      61: "Rain",
      71: "Snow",
      80: "Rain Showers",
      95: "Thunderstorm"
    };

    tempEl.textContent = `${Math.round(temp)}°F`;
    conditionEl.textContent = conditions[code] || "Unknown";

    // fallback humidity (optional safe default)
    extraEl.textContent = "Local Weather";

  } catch (e) {
    tempEl.textContent = "--°F";
    conditionEl.textContent = "Weather Error";
    extraEl.textContent = "";
  }
}

loadWeather();

function getWeekdays() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = new Date().getDay();

  let result = [];
  for (let i = 0; i < 7; i++) {
    result.push(days[(today + i) % 7]);
  }

  return result;
}

// =====================
// 🌡️ COLOR PALETTE
// =====================
const cold = "#437afa";     // blue
const neutral = "#c8b08a";  // wood
const hot = "#ff6b6b";      // red

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// =====================
// 🌡️ SINGLE TEMP MODEL
// =====================
const MIN_TEMP = 10;
const MAX_TEMP = 110;

function normalizeTemp(temp) {
  let t = (temp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  return Math.max(0, Math.min(1, t));
}

// =====================
// 🎨 TEMP COLOR
// =====================
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map(x => Math.round(x).toString(16).padStart(2, "0"))
      .join("")
  );
}

function getTempColor(temp) {
  const t = normalizeTemp(temp);

  const coldRGB = hexToRgb(cold);
  const neutralRGB = hexToRgb(neutral);
  const hotRGB = hexToRgb(hot);

  if (t < 0.5) {
    // cold → neutral
    const localT = t / 0.5;

    return rgbToHex(
      lerp(coldRGB.r, neutralRGB.r, localT),
      lerp(coldRGB.g, neutralRGB.g, localT),
      lerp(coldRGB.b, neutralRGB.b, localT)
    );
  } else {
    // neutral → hot
    const localT = (t - 0.5) / 0.5;

    return rgbToHex(
      lerp(neutralRGB.r, hotRGB.r, localT),
      lerp(neutralRGB.g, hotRGB.g, localT),
      lerp(neutralRGB.b, hotRGB.b, localT)
    );
  }
}

// =====================
// 🌊 GRADIENT SPLIT CONTROL
// =====================
function getTempPush(temp) {
  const t = normalizeTemp(temp);

  // 30% (cold) → 70% (hot)
  if(t < 0.5) {
    // 60% gradient at coldest, 30% gradient at warmest.
    return 30 + (0.5-t) * 30
  } else {
    // 30% gradient at coldest, 60% gradient at warmest.
    return 30 + t * 30;
  }
}

// =====================
// 📅 FORECAST LOADER
// =====================
async function loadForecast() {
  const forecastEl = document.getElementById("forecast");
  if (!forecastEl) return;

  const lat = 32.9483;
  const lon = -96.7299;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&daily=weathercode,temperature_2m_max` +
    `&temperature_unit=fahrenheit` +
    `&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();
  const daily = data.daily;
  const weekdays = getWeekdays();

  const weather = {
    0:  { text: "Clear", icon: "☀️" },
    1:  { text: "Mostly clear", icon: "🌤️" },
    2:  { text: "Partly cloudy", icon: "⛅" },
    3:  { text: "Overcast", icon: "☁️" },

    45: { text: "Fog", icon: "🌫️" },
    48: { text: "Freezing fog", icon: "🌫️" },

    51: { text: "Light drizzle", icon: "🌦️" },
    53: { text: "Drizzle", icon: "🌦️" },
    55: { text: "Heavy drizzle", icon: "🌧️" },

    61: { text: "Light rain", icon: "🌧️" },
    63: { text: "Rain", icon: "🌧️" },
    65: { text: "Heavy rain", icon: "🌧️" },

    71: { text: "Light snow", icon: "🌨️" },
    73: { text: "Snow", icon: "❄️" },
    75: { text: "Heavy snow", icon: "❄️" },

    80: { text: "Rain showers", icon: "🌦️" },
    81: { text: "Strong showers", icon: "🌧️" },
    82: { text: "Violent showers", icon: "⛈️" },

    95: { text: "Thunderstorm", icon: "⛈️" },
    96: { text: "Thunder + hail", icon: "⛈️" },
    99: { text: "Heavy thunder + hail", icon: "⛈️" }
  };

  forecastEl.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const temp = 30;
    // const temp = Math.round(daily.temperature_2m_max[i]);
    const code = daily.weathercode[i];

    const div = document.createElement("div");
    div.className = "weather-plank";

    const baseDate = new Date();
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);

    const fullDate = currentDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    div.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      ">

        <!-- LEFT SIDE -->
        <div style="
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        ">

          <div style="
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.3px;
          ">
            ${fullDate}
          </div>

          <div style="
            font-size: 10px;
            opacity: 0.75;
            margin-top: 2px;
          ">
            ${weekdays[i]}
          </div>

        </div>

        <!-- RIGHT SIDE -->
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
        ">

          <span class="temp-color">
            ${temp}°F
          </span>

          <span style="font-size: 22px;">
            ${weather[code]?.icon || "☁️"}
          </span>

        </div>

      </div>
    `;

    const tempEl = div.querySelector(".temp-color");

    if (tempEl) {
      const tempColor = getTempColor(temp);
      const split = getTempPush(temp);

      tempEl.style.setProperty("--temp-color", tempColor);
      tempEl.style.setProperty("--split", `${split}%`);
    }

    forecastEl.appendChild(div);
  }
}

loadForecast();
setInterval(loadWeather, 10 * 60 * 1000); // update every 10 min

