"use strict";
const RightChoiseAdvices = {
  highTemp: [
    "✅ Great choice! Wear light, breathable clothing like cotton or linen.",
    "✅ Perfect! Remember to stay hydrated by drinking plenty of water.",
    "✅ Smart move. Apply sunscreen generously and wear a wide-brimmed hat.",
    "✅ Good thinking! Plan outdoor activities for the cooler morning or evening hours.",
    "✅ Excellent idea! This is the perfect weather for swimming or visiting an air-conditioned museum.",
  ],
  lowTemp: [
    "✅ Great choice! Dress in warm layers to trap heat effectively.",
    "✅ Perfect! Wear a hat, gloves, and a scarf to protect against heat loss.",
    "✅ Smart move. Choose insulated and waterproof footwear to keep your feet warm and dry.",
    "✅ Good thinking! Enjoy warm beverages like hot chocolate or tea.",
    "✅ Excellent idea! This is ideal weather for cozy indoor activities or winter sports.",
  ],
  windy: [
    "✅ Great choice! A windbreaker jacket will keep you comfortable.",
    "✅ Perfect! Secure any loose items like hats or scarves.",
    "✅ Smart move. This is a great day for flying a kite at a park.",
    "✅ Good thinking! Be cautious if cycling or driving a tall vehicle.",
  ],
  rainy: [
    "✅ Great choice! A waterproof jacket and boots are your best friends today.",
    "✅ Perfect! Don't forget a sturdy umbrella.",
    "✅ Smart move. This is the perfect opportunity to visit an indoor gallery, cinema, or a cozy café.",
    "✅ Good thinking! Allow extra travel time as roads may be slippery.",
  ],
  normal: [
    "✅ Great choice! The weather is perfect for a wide range of outdoor activities like hiking or a picnic.",
    "✅ Perfect! It's an ideal day for exploring the city on foot.",
    "✅ Smart move. Bring a light jacket or sweater, as it might get cooler in the evening.",
  ],
};
const wrongChoiseAdvices = {
  highTemp: [
    "⚠️ Be careful! Avoid wearing dark, heavy fabrics that absorb heat.",
    "⚠️ Heads up! Strenuous outdoor exercise during midday can lead to heatstroke.",
    "⚠️ Watch out! Forgetting to drink water can quickly lead to dehydration.",
    "⚠️ Don't risk it! Never leave children or pets unattended in a vehicle.",
  ],
  lowTemp: [
    "⚠️ Be careful! Insufficient clothing can increase the risk of hypothermia.",
    "⚠️ Heads up! Try to limit the amount of exposed skin to prevent frostbite.",
    "⚠️ Watch out! Cotton clothing is not ideal as it holds moisture and can make you colder if it gets wet.",
    "⚠️ Don't risk it! Avoid long periods of inactivity outdoors.",
  ],
  windy: [
    "⚠️ Be careful! Using a flimsy umbrella can be difficult and result in it breaking.",
    "⚠️ Heads up! Activities like boating or paddleboarding can be dangerous in high winds.",
    "⚠️ Watch out! A picnic might be challenging with things blowing away.",
    "⚠️ Don't risk it! Avoid walking near construction sites where debris could be dislodged.",
  ],
  rainy: [
    "⚠️ Be careful! Wearing shoes made of canvas or suede will likely result in wet, cold feet.",
    "⚠️ Heads up! Driving too fast on wet roads can be very dangerous.",
    "⚠️ Watch out! Some hiking trails can become extremely slippery and hazardous when wet.",
    "⚠️ Don't risk it! Planning activities in areas known for flash flooding is a bad idea.",
  ],
  normal: [
    "⚠️ Heads up! Even on a mild day, you can get a sunburn. Consider sunscreen.",
    "⚠️ Be careful! Don't assume the temperature will stay the same all day; a cool evening can catch you unprepared without an extra layer.",
  ],
};

document.addEventListener("DOMContentLoaded", function () {
  let map;
  let marker = null;
  let selectedLat = null;
  let selectedLng = null;
  let lastPredictions = null;

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
  };

  themeToggle.addEventListener("change", function () {
    if (this.checked) {
      body.classList.add("light-mode");
      localStorage.setItem("theme", "light-mode");
    } else {
      body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark-mode");
    }
  });

  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme || "dark-mode");

  // --- Main Initialization ---
  function init() {
    initMap();
    setupEventListeners();
    setDefaultDates();
    document.getElementById("loading").style.display = "none";
    document.getElementById("results").style.display = "none";
  }

  function initMap() {
    map = L.map("map").setView([30.0444, 31.2357], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
    map.on("click", function (e) {
      document.getElementById("placeInput").value = "";
      updateLocation(e.latlng.lat, e.latlng.lng, "Selected on map");
    });
    navigator.geolocation?.getCurrentPosition(
      function (position) {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 10);
        updateLocation(latitude, longitude, "Your Current Location");
      },
      function (error) {
        console.warn("Could not get user location:", error.message);
        updateLocation(30.0444, 31.2357, "Cairo, Egypt (Default)");
      }
    );
  }

  function setupEventListeners() {
    document
      .getElementById("search-button")
      .addEventListener("click", handleForecastRequest);
    document
      .querySelector(".modal-close-advice")
      .addEventListener("click", hideAdviceModal);
    document.getElementById("advice-modal").addEventListener("click", (e) => {
      if (e.target.id === "advice-modal") hideAdviceModal();
    });
    document
      .getElementById("refresh-advice-btn")
      .addEventListener("click", setRandomAdvice);
  }

  async function handleForecastRequest() {
    const query = document.getElementById("placeInput").value.trim();
    if (query) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          updateLocation(parseFloat(lat), parseFloat(lon), display_name);
          generateForecast();
        } else {
          alert("Place not found. Please try again.");
        }
      } catch (err) {
        alert("Geocoding service failed. Please try again later.");
        console.error(err);
      }
    } else if (selectedLat && selectedLng) {
      generateForecast();
    } else {
      alert("Please enter a destination or click a location on the map.");
    }
  }

  function setDefaultDates() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    document.getElementById("startDate").valueAsDate = today;
    document.getElementById("endDate").valueAsDate = nextWeek;
  }

  function updateLocation(lat, lng, displayName) {
    selectedLat = lat;
    selectedLng = lng;
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map).bindPopup(displayName).openPopup();
    map.setView([lat, lng], 10);
    document.getElementById("selected-location").textContent = displayName;
    document.getElementById("lat").textContent = lat.toFixed(4);
    document.getElementById("lon").textContent = lng.toFixed(4);
  }

  async function generateForecast() {
    const startDateStr = document.getElementById("startDate").value;
    const endDateStr = document.getElementById("endDate").value;
    const container = document.querySelector(".container");

    if (!startDateStr || !endDateStr) {
      alert("Please select both a start and end date.");
      return;
    }
    if (new Date(endDateStr) < new Date(startDateStr)) {
      alert("End date cannot be before the start date.");
      return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("results").style.display = "none";
    document.getElementById("advice-prompt-card").classList.add("result");
    container.classList.add("two-columns");
    document.querySelector(".panel2").classList.remove("result");

    try {
      const predictions = await getNasaPowerData(
        selectedLat,
        selectedLng,
        startDateStr,
        endDateStr
      );
      lastPredictions = predictions;
      updateUI(predictions);
    } catch (error) {
      console.error("Failed to get weather data:", error);
      document.getElementById(
        "summary"
      ).textContent = `Error: ${error.message}`;
    } finally {
      document.getElementById("loading").style.display = "none";
      document.getElementById("results").style.display = "block";
      const adviceCard = document.getElementById("advice-prompt-card");
      adviceCard.innerHTML = `
                        <div class="feature-icon"><i class="fas fa-info-circle"></i></div>
                        <h3>Need Some Advice?</h3>
                        <p>Based on the forecast, we can provide some tips for a better trip.</p>
                        <br />
                        <button class="cta-button knowMore">Get Trip Advice</button>
                    `;
      adviceCard.classList.remove("result");
      adviceCard
        .querySelector(".knowMore")
        .addEventListener("click", displayAdviceModal);
    }
  }

  async function getNasaPowerData(lat, lng, startDateStr, endDateStr) {
    const start = startDateStr.replace(/-/g, "");
    const end = endDateStr.replace(/-/g, "");
    const params = ["T2M_MAX", "T2M_MIN", "WS10M_MAX", "PRECTOTCORR"].join(",");
    const apiUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=RE&longitude=${lng}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Failed to fetch data from NASA POWER API.");
    const data = await response.json();
    if (!data.properties?.parameter)
      throw new Error("Invalid data format from API.");
    const paramsData = data.properties.parameter;
    const dates = Object.keys(paramsData.T2M_MAX || {});
    const totalDays = dates.length;
    if (totalDays === 0) return { hot: 0, cold: 0, windy: 0, wet: 0 };

    let hotDays = 0,
      coldDays = 0,
      windyDays = 0,
      wetDays = 0;
    dates.forEach((date) => {
      if (paramsData.T2M_MAX[date] > 32) hotDays++;
      if (paramsData.T2M_MIN[date] < 10) coldDays++;
      if (paramsData.WS10M_MAX[date] > 8) windyDays++;
      if (paramsData.PRECTOTCORR[date] > 1) wetDays++;
    });

    return {
      hot: Math.round((hotDays / totalDays) * 100),
      cold: Math.round((coldDays / totalDays) * 100),
      windy: Math.round((windyDays / totalDays) * 100),
      wet: Math.round((wetDays / totalDays) * 100),
    };
  }

  function updateUI(predictions) {
    updateProbabilityBar("hot", predictions.hot);
    updateProbabilityBar("cold", predictions.cold);
    updateProbabilityBar("windy", predictions.windy);
    updateProbabilityBar("wet", predictions.wet);
    updateSummary(predictions);
  }

  function updateProbabilityBar(condition, probability) {
    document.getElementById(
      `${condition}-probability`
    ).style.width = `${probability}%`;
    document.getElementById(
      `${condition}-text`
    ).textContent = `${probability}%`;
  }

  function updateSummary(predictions) {
    const summaryElement = document.getElementById("summary");
    const options = { year: "numeric", month: "long", day: "numeric" };
    const startDate = new Date(
      document.getElementById("startDate").value
    ).toLocaleDateString("en-US", options);
    const endDate = new Date(
      document.getElementById("endDate").value
    ).toLocaleDateString("en-US", options);
    const periodString = `For the period from ${startDate} to ${endDate}`;
    let conditions = [];
    if (predictions.hot > 30)
      conditions.push(`a ${predictions.hot}% chance of hot days`);
    if (predictions.cold > 30)
      conditions.push(`a ${predictions.cold}% chance of cold days`);
    if (predictions.windy > 30)
      conditions.push(`a ${predictions.windy}% chance of strong winds`);
    if (predictions.wet > 30)
      conditions.push(`a ${predictions.wet}% chance of rain`);
    summaryElement.textContent =
      conditions.length > 0
        ? `${periodString}, expect ${conditions.join(", ")}.`
        : `${periodString}, weather conditions are expected to be generally mild.`;
  }

  function setRandomAdvice() {
    if (!lastPredictions) return;
    let dominantCondition = "normal";
    let maxProb = 0;
    if (lastPredictions.hot > maxProb) {
      maxProb = lastPredictions.hot;
      dominantCondition = "highTemp";
    }
    if (lastPredictions.cold > maxProb) {
      maxProb = lastPredictions.cold;
      dominantCondition = "lowTemp";
    }
    if (lastPredictions.windy > maxProb) {
      maxProb = lastPredictions.windy;
      dominantCondition = "windy";
    }
    if (lastPredictions.wet > maxProb) {
      maxProb = lastPredictions.wet;
      dominantCondition = "rainy";
    }
    if (maxProb < 25) dominantCondition = "normal";

    const goodAdvice = RightChoiseAdvices[dominantCondition];
    const badAdvice = wrongChoiseAdvices[dominantCondition];
    const goodList = document.getElementById("good-advice-list");
    const badList = document.getElementById("bad-advice-list");
    const randomGoodAdvice =
      goodAdvice[Math.floor(Math.random() * goodAdvice.length)];
    const randomBadAdvice =
      badAdvice[Math.floor(Math.random() * badAdvice.length)];
    goodList.innerHTML = `<li>${randomGoodAdvice}</li>`;
    badList.innerHTML = `<li>${randomBadAdvice}</li>`;
  }

  function displayAdviceModal() {
    setRandomAdvice();
    document.getElementById("advice-modal").classList.add("active");
  }

  function hideAdviceModal() {
    document.getElementById("advice-modal").classList.remove("active");
  }

  init();
});
