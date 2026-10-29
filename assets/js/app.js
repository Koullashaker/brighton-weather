// Settings for the API, kept in one place (Brighton to start).
// Open-Meteo needs no API key. If an API did need one,
// it would go here, e.g. apiKey: "your-key".
// Remember: anything in a web page can be seen in DevTools.
const CONFIG = {
  town: "Brighton",
  place: "England, United Kingdom",
  latitude: 50.8284,
  longitude: -0.1395,
  timezone: "Europe/London"
};

// Build the API address from the settings
function buildUrl() {
  return "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + CONFIG.latitude +
    "&longitude=" + CONFIG.longitude +
    "&current=temperature_2m,weather_code,wind_speed_10m" +
    "&timezone=" + encodeURIComponent(CONFIG.timezone);
}

// Turn "2026-10-28T12:45" into "28/10/2026 12:45"
function formatDate(isoString) {
  const parts = isoString.split("T");
  const date = parts[0].split("-");
  return date[2] + "/" + date[1] + "/" + date[0] + " " + parts[1];
}

// Turn the weather code into words
function describeWeather(code) {
  if (code === 0) return "Clear sky";
  if (code >= 1 && code <= 3) return "Cloudy";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

// Extra 2: a large picture for the weather
function weatherIcon(code) {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

// Extra 2: background colours to match the weather [top, bottom]
function weatherColours(code) {
  if (code === 0) return ["#ff8a00", "#ffd166"];                // sunny
  if (code >= 1 && code <= 3) return ["#3a7bd5", "#86b6f6"];    // cloudy
  if (code >= 45 && code <= 48) return ["#5f7385", "#a9b8c6"];  // fog
  if (code >= 51 && code <= 67) return ["#1f3b63", "#4a6fa5"];  // rain
  if (code >= 71 && code <= 77) return ["#4a7bd0", "#a9c6f5"];  // snow
  if (code >= 80 && code <= 82) return ["#2f5d8a", "#6fb1e8"];  // showers
  if (code >= 85 && code <= 86) return ["#5a72b0", "#a6bde8"];  // snow showers
  if (code >= 95) return ["#16123a", "#4b3b78"];                // storm
  return ["#1e3a8a", "#38bdf8"];
}

// Fun: fill the sky with a sun, clouds, rain, snow, fog or lightning
function setScene(code) {
  const sky = document.getElementById("sky");
  const words = describeWeather(code);
  sky.innerHTML = "";

  function add(className, styles, text) {
    const el = document.createElement("div");
    el.className = className;
    for (const name in styles) el.style.setProperty(name, styles[name]);
    if (text) el.textContent = text;
    sky.appendChild(el);
  }
  function rand(min, max) { return min + Math.random() * (max - min); }

  function clouds(count, opacity) {
    for (let i = 0; i < count; i++) {
      add("cloud", {
        "--top": rand(4, 70) + "vh",
        "--w": rand(140, 300) + "px",
        "--o": opacity,
        "--d": rand(40, 80) + "s",
        "--delay": -rand(0, 80) + "s"
      });
    }
  }
  function rain(count) {
    for (let i = 0; i < count; i++) {
      add("drop", { "--x": rand(0, 105) + "vw", "--d": rand(0.6, 1.1) + "s", "--delay": -rand(0, 1.2) + "s" });
    }
  }
  function snow(count) {
    for (let i = 0; i < count; i++) {
      add("flake", { "--x": rand(0, 100) + "vw", "--s": rand(10, 24) + "px", "--d": rand(7, 14) + "s", "--delay": -rand(0, 14) + "s" }, "❄");
    }
  }

  if (words === "Clear sky")    { add("sun", {}); clouds(2, 0.35); }
  if (words === "Cloudy")       { add("sun", {}); clouds(7, 0.55); }
  if (words === "Fog")          { for (let i = 0; i < 5; i++) add("fog-band", { "--top": (i * 20) + "vh", "--d": rand(8, 14) + "s" }); clouds(2, 0.3); }
  if (words === "Rain")         { clouds(5, 0.35); rain(110); }
  if (words === "Rain showers") { add("sun", {}); clouds(5, 0.45); rain(60); }
  if (words === "Snow")         { clouds(3, 0.45); snow(70); }
  if (words === "Snow showers") { clouds(5, 0.4); snow(45); }
  if (words === "Thunderstorm") { clouds(6, 0.2); rain(140); add("flash", {}); }
  if (words === "Unknown")      { clouds(3, 0.4); }
}

// Fun: a friendly line about what to wear
function weatherMood(code, temp, wind) {
  const words = describeWeather(code);
  if (words === "Thunderstorm") return "Stay inside, it's a wild one! ⚡";
  if (words === "Rain" || words === "Rain showers") return "Grab your umbrella! ☔";
  if (words === "Snow" || words === "Snow showers") return "Snowball fight time! ⛄";
  if (words === "Fog") return "Spooky and misty out there 👻";
  if (wind >= 40) return "Blowing a gale! Hold on tight 🌬️";
  if (wind >= 20) return "Windy! Hold onto your hat 🎩";
  if (temp < 0) return "Brrr! Freezing cold 🥶";
  if (temp < 8) return "Hat and scarf weather 🧣";
  if (temp < 15) return "Jacket weather 🧥";
  if (temp < 22) return "Lovely and mild 😊";
  if (temp < 28) return "T-shirt time! 😎";
  return "Scorcher! Ice cream needed 🍦";
}

// Fun: count the temperature up to its value
function countUp(el, target) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / 700, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + "°C";
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Pick out the parts we want and show them
function showWeather(data) {
  const code = data.current.weather_code;
  const temp = Math.round(data.current.temperature_2m);
  const colours = weatherColours(code);
  const words = describeWeather(code);

  document.getElementById("town").textContent = CONFIG.town;
  document.getElementById("place").textContent = CONFIG.place;
  document.getElementById("weather").textContent = words;
  document.getElementById("wind").textContent = data.current.wind_speed_10m + " km/h";
  document.getElementById("time").textContent = formatDate(data.current.time);
  document.getElementById("mood").textContent = weatherMood(code, temp, data.current.wind_speed_10m);
  countUp(document.getElementById("temp"), temp);

  // Make the icon pop in again each time
  const icon = document.getElementById("icon");
  icon.textContent = weatherIcon(code);
  icon.classList.remove("pop");
  void icon.offsetWidth;
  icon.classList.add("pop");

  // Background colour and animated sky to match the weather
  document.body.style.setProperty("--bg-from", colours[0]);
  document.body.style.setProperty("--bg-to", colours[1]);
  setScene(code);

  // Highlight the matching code in the key
  document.querySelectorAll("#codes li").forEach(function (li) {
    li.classList.toggle("active", li.dataset.word === words);
  });
}

// Show a message under the card (red if it's an error)
function showMessage(text, isError) {
  const message = document.getElementById("message");
  message.textContent = text;
  message.className = isError ? "error" : "";
}

// Turn the loading look on or off
function setLoading(isLoading) {
  document.getElementById("card").classList.toggle("loading", isLoading);
  document.getElementById("refresh").disabled = isLoading;
  document.getElementById("search").disabled = isLoading;
}

// Get the data from the API, then show it
async function loadWeather() {
  showMessage("Loading...", false);
  setLoading(true);
  try {
    const response = await fetch(buildUrl());
    const data = await response.json();
    showWeather(data);
    showMessage("Checked at " + new Date().toLocaleTimeString("en-GB"), false);
  } catch (error) {
    showMessage("Could not load the weather.", true);
  }
  setLoading(false);
}

// Extra 3: find a town's location, update CONFIG, then load its weather
async function searchTown(event) {
  event.preventDefault(); // stop the form reloading the page

  const name = document.getElementById("townInput").value.trim();
  if (name === "") {
    showMessage("Type a town first.", true);
    return;
  }

  showMessage("Finding " + name + "...", false);
  setLoading(true);
  try {
    const url = "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" + encodeURIComponent(name);
    const response = await fetch(url);
    const data = await response.json();
    setLoading(false);

    if (!data.results) {
      showMessage("Town not found.", true);
      return;
    }

    const result = data.results[0];
    CONFIG.town = result.name;
    CONFIG.place = [result.admin1, result.country].filter(Boolean).join(", ");
    CONFIG.latitude = result.latitude;
    CONFIG.longitude = result.longitude;
    CONFIG.timezone = result.timezone || "Europe/London";

    document.getElementById("townInput").value = "";
    loadWeather();
  } catch (error) {
    setLoading(false);
    showMessage("Could not search for that town.", true);
  }
}

// Run when the page loads, and on the buttons
document.getElementById("town").textContent = CONFIG.town;
document.getElementById("place").textContent = CONFIG.place;
loadWeather();
document.getElementById("refresh").addEventListener("click", loadWeather);
document.getElementById("searchForm").addEventListener("submit", searchTown);

// Fun: quick town buttons fill the box and search straight away
document.querySelectorAll("#chips .chip").forEach(function (chip) {
  chip.addEventListener("click", function () {
    document.getElementById("townInput").value = chip.textContent;
    document.getElementById("searchForm").requestSubmit();
  });
});
