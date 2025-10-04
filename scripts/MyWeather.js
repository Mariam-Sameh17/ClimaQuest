document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("loader");
  const errorMessage = document.getElementById("error-message");
  const weatherGrid = document.getElementById("weather-grid");
  const locationDisplay = document.getElementById("location-display");
  let activeCharts = {};

  // --- THEME SWITCHER LOGIC ---
  const themeToggle = document.getElementById("checkbox");
  const body = document.body;

  const applyTheme = (theme) => {
    if (theme === "light-mode") {
      body.classList.add("light-mode");
      themeToggle.checked = true;
    } else {
      body.classList.remove("light-mode");
      themeToggle.checked = false;
    }
    updateAllChartsColors();
  };

  themeToggle.addEventListener("change", function () {
    if (this.checked) {
      body.classList.add("light-mode");
      localStorage.setItem("theme", "light-mode");
    } else {
      body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark-mode");
    }
    updateAllChartsColors();
  });

  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme || "dark-mode");

  // --- MAIN APP LOGIC ---
  async function init() {
    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      const locationName = await getLocationName(latitude, longitude);
      locationDisplay.textContent = locationName;
      const weatherData = await getWeatherData(latitude, longitude);
      displayWeatherData(weatherData);
    } catch (error) {
      let userMessage =
        "Could not get your location. Showing weather for a default location.";
      console.error("Initialization failed:", error.message || error);
      showError(userMessage);
      locationDisplay.textContent = "Cairo, Egypt (Default)";
      try {
        const weatherData = await getWeatherData(30.0444, 31.2357);
        displayWeatherData(weatherData);
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        showError(
          "Could not fetch data for the default location. Please try again later."
        );
      }
    }
  }

  function getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation is not supported."));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async function getLocationName(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      return (
        `${data?.address?.city || data?.address?.state}, ${
          data?.address?.country
        }` || "Current Location"
      );
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Current Location";
    }
  }

  async function getWeatherData(lat, lng) {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 9);
    const formatDate = (date) =>
      date.toISOString().split("T")[0].replace(/-/g, "");
    const start = formatDate(startDate);
    const end = formatDate(today);
    const params = ["T2M_MAX", "T2M_MIN", "WS10M", "PRECTOTCORR"].join(",");
    const apiUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=RE&longitude=${lng}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Failed to fetch data from NASA POWER API.");
    const data = await response.json();
    if (!data.properties?.parameter) throw new Error("Invalid data from API.");
    return data.properties.parameter;
  }

  function displayWeatherData(data) {
    loader.classList.remove("active");
    errorMessage.classList.remove("active");
    weatherGrid.innerHTML = "";
    activeCharts = {};

    const dates = Object.keys(data.T2M_MAX || {});
    if (dates.length === 0) {
      showError("No historical data available for this location.");
      return;
    }
    dates.sort((a, b) => b.localeCompare(a));

    dates.forEach((dateStr) => {
      const date = new Date(
        dateStr.substring(0, 4),
        dateStr.substring(4, 6) - 1,
        dateStr.substring(6, 8)
      );
      const dayName = date.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const maxTemp = data.T2M_MAX[dateStr]?.toFixed(1) || "N/A";
      const minTemp = data.T2M_MIN[dateStr]?.toFixed(1) || "N/A";
      const wind = data.WS10M[dateStr]?.toFixed(1) || "N/A";
      const rain = data.PRECTOTCORR[dateStr]?.toFixed(1) || "N/A";

      const card = document.createElement("div");
      card.className = "weather-card";
      const canvasId = `chart-${dateStr}`;
      const chartData = {
        maxTemp: parseFloat(maxTemp) || 0,
        minTemp: parseFloat(minTemp) || 0,
        wind: parseFloat(wind) || 0,
        rain: parseFloat(rain) || 0,
      };
      const iconClass = getWeatherIcon(maxTemp, wind, rain);

      const hotPercent = Math.min(
        100,
        Math.max(0, ((maxTemp - 25) / 15) * 100)
      );
      const coldPercent = Math.min(
        100,
        Math.max(0, ((10 - minTemp) / 15) * 100)
      );
      const windyPercent = Math.min(100, Math.max(0, (wind / 12) * 100));
      const rainyPercent = Math.min(100, Math.max(0, (rain / 10) * 100));

      card.innerHTML = `
                <h3>${dayName}</h3>
                <div class="weather-icon"><i class="fas ${iconClass}"></i></div>
                <div class="temp-details">
                    <p><span class="label">Max:</span> ${maxTemp}°C</p>
                    <p><span class="label">Min:</span> ${minTemp}°C</p>
                    <p><span class="label">Wind:</span> ${wind} m/s</p>
                    <p><span class="label">Rain:</span> ${rain} mm</p>
                </div>
                <div class="graph-container"><canvas id="${canvasId}"></canvas></div>
                <div class="weather-tooltip">
                    <div class="condition-item">
                        <div class="condition-name">Hot</div>
                        <div class="probability-bar"><div class="probability-fill hot" style="width: ${hotPercent}%"></div></div>
                        <div class="probability-text">${hotPercent.toFixed(
                          0
                        )}%</div>
                    </div>
                    <div class="condition-item">
                        <div class="condition-name">Cold</div>
                        <div class="probability-bar"><div class="probability-fill cold" style="width: ${coldPercent}%"></div></div>
                        <div class="probability-text">${coldPercent.toFixed(
                          0
                        )}%</div>
                    </div>
                    <div class="condition-item">
                        <div class="condition-name">Windy</div>
                        <div class="probability-bar"><div class="probability-fill windy" style="width: ${windyPercent}%"></div></div>
                        <div class="probability-text">${windyPercent.toFixed(
                          0
                        )}%</div>
                    </div>
                    <div class="condition-item">
                        <div class="condition-name">Rainy</div>
                        <div class="probability-bar"><div class="probability-fill wet" style="width: ${rainyPercent}%"></div></div>
                        <div class="probability-text">${rainyPercent.toFixed(
                          0
                        )}%</div>
                    </div>
                </div>`;

      card.addEventListener("click", () => {
        const isVisible = card.classList.toggle("graph-visible");
        if (isVisible && !activeCharts[canvasId]) {
          createWeatherChart(canvasId, chartData);
        }
      });
      weatherGrid.appendChild(card);
    });
    weatherGrid.classList.add("active");
  }

  function createWeatherChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const isLight = document.body.classList.contains("light-mode");
    const textColor = isLight ? "#1f2937" : "#ecf0f1";
    const gridColor = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)";

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Max Temp (°C)", "Min Temp (°C)", "Wind (m/s)", "Rain (mm)"],
        datasets: [
          {
            label: "Weather Metrics",
            data: [data.maxTemp, data.minTemp, data.wind, data.rain],
            backgroundColor: [
              "rgba(231, 76, 60, 0.5)",
              "rgba(52, 152, 219, 0.5)",
              "rgba(149, 165, 166, 0.5)",
              "rgba(46, 204, 113, 0.5)",
            ],
            borderColor: [
              "rgb(231, 76, 60)",
              "rgb(52, 152, 219)",
              "rgb(149, 165, 166)",
              "rgb(46, 204, 113)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Daily Weather Summary",
            color: textColor,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
      },
    });
    activeCharts[canvasId] = chart;
  }

  function updateAllChartsColors() {
    const isLight = document.body.classList.contains("light-mode");
    const textColor = isLight ? "#1f2937" : "#ecf0f1";
    const gridColor = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)";

    for (const chartId in activeCharts) {
      const chart = activeCharts[chartId];
      chart.options.plugins.title.color = textColor;
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.update();
    }
  }

  function getWeatherIcon(temp, wind, rain) {
    if (rain > 2.0) return "fa-cloud-showers-heavy";
    if (wind > 8.0) return "fa-wind";
    if (temp > 30) return "fa-sun";
    if (temp < 10) return "fa-snowflake";
    return "fa-cloud-sun";
  }

  function showError(message = "An error occurred.") {
    loader.classList.remove("active");
    weatherGrid.classList.remove("active");
    errorMessage.querySelector("p").textContent = message;
    errorMessage.classList.add("active");
  }

  init();
});
