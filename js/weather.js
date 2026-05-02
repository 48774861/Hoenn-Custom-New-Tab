export function getTempGradientSpan(temp) {

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
export async function loadForecast() {
  const forecastEl = document.getElementById("forecast");
  if (!forecastEl) return;

  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = new Date().getDay();

  forecastEl.innerHTML = "";

  // -----------------------------
  // HEADER
  // -----------------------------
  const header = document.createElement("div");
  header.className = "weather-plank weather-header";
  header.innerHTML = `<div style="font-weight:800;font-size: clamp(14px, 2.2vw, 28px);">Weather Forecast</div>`;
  forecastEl.appendChild(header);

  const sway = document.createElement("div");
  sway.className = "forecast-sway";

  const stack = document.createElement("div");
  stack.className = "forecast-stack";

  sway.appendChild(stack);
  forecastEl.appendChild(sway);

  // -----------------------------
  // CACHE LOAD
  // -----------------------------
  const cached = localStorage.getItem("weather_cache");
  const cachedData = cached ? JSON.parse(cached).data : null;

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

  // -----------------------------
  // PHASE 1: RENDER BASE ROWS (DATES ALWAYS SHOWN)
  // -----------------------------
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    const weekday = weekdays[(today + i) % 7];

    const hasCached = cachedData?.daily?.temperature_2m_max?.[i] != null;

    const temp = hasCached ? Math.round(cachedData.daily.temperature_2m_max[i]) : null;
    const icon = hasCached ? (weatherIcons[cachedData.daily.weathercode[i]] || "☁️") : "⏳";

    const div = document.createElement("div");
    div.className = "weather-plank";

    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:20px;">

        <!-- LEFT -->
        <div style="display:flex;flex-direction:column;gap:2px;justify-content:center;">

          <div style="font-size: clamp(8px, 1.4vw, 16px);font-weight:700;line-height:1.1;">
            ${month} ${day}, ${year}
          </div>

          <div style="font-size: clamp(6px, 1.2vw, 12px);opacity:0.7;line-height:1.1;">
            ${weekday}
          </div>

        </div>

        <!-- RIGHT -->
        <div style="display:flex;align-items:center;gap:8px;font-size: clamp(9px, 1.6vw, 18px);font-weight:600;">
          <div class="temp-group">
            ${
              temp != null
                ? getTempGradientSpan(temp)
                : `<span class="temp-text">--°F</span>`
            }
            <span class="temp-icon">${icon}</span>
          </div>
        </div>

      </div>
    `;

    stack.appendChild(div);
    div.style.setProperty("--delay", `${i * 80}ms`);
    div.style.setProperty("--winddelay", `${i * 80}ms`);
  }

  // -----------------------------
  // FETCH FRESH DATA
  // -----------------------------
  try {
    const lat = 32.9483;
    const lon = -96.7299;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&forecast_days=7&temperature_unit=fahrenheit`;

    const res = await fetch(url);
    const data = await res.json();

    // save cache
    localStorage.setItem("weather_cache", JSON.stringify({
      time: Date.now(),
      data
    }));

    const temps = data.daily.temperature_2m_max;
    const codes = data.daily.weathercode;

    // -----------------------------
    // PHASE 2: UPDATE IN PLACE
    // -----------------------------
    const rows = stack.querySelectorAll(".weather-plank");

    for (let i = 0; i < rows.length; i++) {
      const temp = Math.round(temps[i]);
      const icon = weatherIcons[codes[i]] || "☁️";

      const group = rows[i].querySelector(".temp-group");

      group.innerHTML = `
        ${getTempGradientSpan(temp)}
        <span class="temp-icon">${icon}</span>
      `;
    }

  } catch (e) {
    console.warn("Forecast unavailable", e);
  }
}

export function startWeather() {
    loadForecast();
    setInterval(loadForecast, 10 * 60 * 1000);
}