document.addEventListener("DOMContentLoaded", function () {
  // --- CHART INSTANCES (needed for theme switcher) ---
  let temperatureChart,
    weatherDistributionChart,
    precipitationChart,
    humidityChart,
    windChart;

  // --- THEME SWITCHER LOGIC ---
  const themeToggle = document.getElementById("checkbox");
  const body = document.body;

  const applyTheme = (theme) => {
    if (theme === "light-mode") {
      body.classList.add("light-mode");
      themeToggle.checked = true;
      updateParticles("#009688");
      updateChartColors("#2c3e50", "rgba(44, 62, 80, 0.1)");
    } else {
      body.classList.remove("light-mode");
      themeToggle.checked = false;
      updateParticles("#4db6ac");
      updateChartColors("#d8e2e9", "rgba(216, 226, 233, 0.1)");
    }
  };

  themeToggle.addEventListener("change", function () {
    if (this.checked) {
      body.classList.add("light-mode");
      localStorage.setItem("theme", "light-mode");
      updateParticles("#009688");
      updateChartColors("#2c3e50", "rgba(44, 62, 80, 0.1)");
    } else {
      body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark-mode");
      updateParticles("#4db6ac");
      updateChartColors("#d8e2e9", "rgba(216, 226, 233, 0.1)");
    }
  });

  function updateParticles(color) {
    if (window.pJSDom && window.pJSDom[0]) {
      const pJS = window.pJSDom[0].pJS;
      pJS.particles.color.value = color;
      pJS.particles.line_linked.color = color;
      pJS.fn.particlesRefresh();
    }
  }

  function updateChartColors(textColor, gridColor) {
    const charts = [
      temperatureChart,
      weatherDistributionChart,
      precipitationChart,
      humidityChart,
      windChart,
    ];
    charts.forEach((chart) => {
      if (!chart) return; // Ensure chart is initialized
      if (chart.options.plugins.title)
        chart.options.plugins.title.color = textColor;
      if (chart.options.plugins.legend)
        chart.options.plugins.legend.labels.color = textColor;
      if (chart.options.scales.x) {
        if (chart.options.scales.x.ticks)
          chart.options.scales.x.ticks.color = textColor;
        if (chart.options.scales.x.grid)
          chart.options.scales.x.grid.color = gridColor;
        if (chart.options.scales.x.title)
          chart.options.scales.x.title.color = textColor;
      }
      if (chart.options.scales.y) {
        if (chart.options.scales.y.ticks)
          chart.options.scales.y.ticks.color = textColor;
        if (chart.options.scales.y.grid)
          chart.options.scales.y.grid.color = gridColor;
        if (chart.options.scales.y.title)
          chart.options.scales.y.title.color = textColor;
      }
      if (chart.options.scales.r) {
        if (chart.options.scales.r.angleLines)
          chart.options.scales.r.angleLines.color = gridColor;
        if (chart.options.scales.r.grid)
          chart.options.scales.r.grid.color = gridColor;
        if (chart.options.scales.r.pointLabels)
          chart.options.scales.r.pointLabels.color = textColor;
        if (chart.options.scales.r.ticks) {
          chart.options.scales.r.ticks.color = textColor;
          chart.options.scales.r.ticks.backdropColor = "transparent";
        }
      }
      chart.update();
    });
  }

  // Initialize particles.js
  particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: {
        value: body.classList.contains("light-mode") ? "#009688" : "#4db6ac",
      },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: body.classList.contains("light-mode") ? "#009688" : "#4db6ac",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
        resize: true,
      },
    },
  });

  // Temperature Chart
  const tempCtx = document.getElementById("temperatureChart").getContext("2d");
  temperatureChart = new Chart(tempCtx, {
    type: "line",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Historical Average",
          data: [2, 3, 7, 12, 17, 21, 24, 23, 19, 13, 8, 4],
          borderColor: "#4db6ac",
          backgroundColor: "rgba(77, 182, 172, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
        {
          label: "2022 Actual",
          data: [3, 4, 8, 13, 18, 22, 25, 24, 20, 14, 9, 5],
          borderColor: "#e9d985",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: "2023 Prediction",
          data: [4, 5, 9, 14, 19, 23, 26, 25, 21, 15, 10, 6],
          borderColor: "#e09f3e",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Monthly Temperature Trends & Predictions (°C)",
          font: { size: 16 },
        },
        legend: { labels: {} },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: { grid: {}, ticks: {} },
        y: {
          beginAtZero: false,
          title: { display: true, text: "Temperature (°C)" },
          grid: {},
          ticks: {},
        },
      },
    },
  });

  // Weather Distribution Chart
  const distCtx = document
    .getElementById("weatherDistributionChart")
    .getContext("2d");
  weatherDistributionChart = new Chart(distCtx, {
    type: "doughnut",
    data: {
      labels: ["Sunny", "Cloudy", "Rainy", "Snowy", "Stormy"],
      datasets: [
        {
          data: [40, 25, 20, 10, 5],
          backgroundColor: [
            "#f4d03f",
            "#4db6ac",
            "#2c3e50",
            "#d8e2e9",
            "#e09f3e",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Weather Condition Distribution" },
        legend: { position: "bottom", labels: {} },
      },
    },
  });

  // Precipitation Chart
  const precipCtx = document
    .getElementById("precipitationChart")
    .getContext("2d");
  precipitationChart = new Chart(precipCtx, {
    type: "bar",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Precipitation (mm)",
          data: [85, 70, 65, 60, 55, 45, 40, 50, 65, 75, 80, 90],
          backgroundColor: "rgba(77, 182, 172, 0.7)",
          borderColor: "#4db6ac",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Monthly Precipitation" },
        legend: { display: false },
      },
      scales: {
        x: { grid: {}, ticks: {} },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Precipitation (mm)" },
          grid: {},
          ticks: {},
        },
      },
    },
  });

  // Humidity Chart
  const humidityCtx = document.getElementById("humidityChart").getContext("2d");
  humidityChart = new Chart(humidityCtx, {
    type: "line",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Humidity (%)",
          data: [80, 75, 70, 65, 60, 55, 50, 55, 65, 75, 80, 85],
          borderColor: "#9B59B6",
          backgroundColor: "rgba(155, 89, 182, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Monthly Humidity Patterns" },
        legend: { display: false },
      },
      scales: {
        x: { grid: {}, ticks: {} },
        y: {
          beginAtZero: false,
          title: { display: true, text: "Humidity (%)" },
          grid: {},
          ticks: {},
        },
      },
    },
  });

  // Wind Chart
  const windCtx = document.getElementById("windChart").getContext("2d");
  windChart = new Chart(windCtx, {
    type: "radar",
    data: {
      labels: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
      datasets: [
        {
          label: "Wind Frequency",
          data: [8, 7, 5, 4, 6, 9, 7, 10],
          backgroundColor: "rgba(233, 217, 133, 0.2)",
          borderColor: "#e9d985",
          borderWidth: 2,
          pointBackgroundColor: "#e9d985",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Wind Direction Frequency" },
      },
      scales: {
        r: {
          angleLines: {},
          grid: {},
          pointLabels: {},
          ticks: { backdropColor: "transparent" },
        },
      },
    },
  });

  // Check for saved theme preference on load
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // Default to dark mode if no theme is saved
    updateChartColors("#d8e2e9", "rgba(216, 226, 233, 0.1)");
  }

  // Process Flow Interaction
  const processSteps = document.querySelectorAll(".process-step");
  const processDetails = document.querySelectorAll(".process-details");

  processSteps.forEach((step) => {
    step.addEventListener("click", function () {
      const stepNumber = this.getAttribute("data-step");
      processSteps.forEach((s) => s.classList.remove("active"));
      processDetails.forEach((d) => d.classList.remove("active"));
      this.classList.add("active");
      document
        .getElementById(`step-details-${stepNumber}`)
        .classList.add("active");
    });
  });

  // Update chart on button click
  document.getElementById("update-btn").addEventListener("click", function () {
    temperatureChart.data.datasets[0].data = generateRandomData(12, 0, 15);
    temperatureChart.data.datasets[1].data = generateRandomData(12, 5, 25);
    temperatureChart.data.datasets[2].data = generateRandomData(12, 5, 30);
    temperatureChart.update();
    weatherDistributionChart.data.datasets[0].data = generateRandomData(
      5,
      5,
      40
    );
    weatherDistributionChart.update();
    precipitationChart.data.datasets[0].data = generateRandomData(12, 30, 100);
    precipitationChart.update();
    humidityChart.data.datasets[0].data = generateRandomData(12, 40, 85);
    humidityChart.update();
    windChart.data.datasets[0].data = generateRandomData(8, 3, 12);
    windChart.update();

    document.getElementById("avg-temp").textContent =
      Math.floor(Math.random() * 15 + 15) + "°C";
    document.getElementById("precip-chance").textContent =
      Math.floor(Math.random() * 50 + 10) + "%";
    document.getElementById("wind-speed").textContent =
      Math.floor(Math.random() * 15 + 5) + " km/h";
    document.getElementById("comfort-index").textContent =
      Math.floor(Math.random() * 30 + 70) + "%";

    const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"];
    const randomCondition =
      conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 15 + 20);
    const randomChance = Math.floor(Math.random() * 40 + 60);

    document.querySelector(
      ".prediction-output"
    ).textContent = `Weather Prediction: ${randomChance}% ${randomCondition}, ${randomTemp}°C`;

    this.innerHTML = '<i class="fas fa-check"></i> Updated!';
    setTimeout(() => {
      this.innerHTML = '<i class="fas fa-sync-alt"></i> Update Analytics';
    }, 1500);
  });

  function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
  }

  const sections = document.querySelectorAll(".section");
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);
  sections.forEach((section) => {
    observer.observe(section);
  });

  const chartCards = document.querySelectorAll(".chart-card");
  const chartObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
        }
      });
    },
    { threshold: 0.2 }
  );
  chartCards.forEach((card) => {
    chartObserver.observe(card);
  });

  createDataConnections();
});

function createDataConnections() {
  const dataFlow = document.querySelector(".data-flow");
  const nodes = document.querySelectorAll(".data-node");
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      const x1 = node1.offsetLeft + node1.offsetWidth / 2;
      const y1 = node1.offsetTop + node1.offsetHeight / 2;
      const x2 = node2.offsetLeft + node2.offsetWidth / 2;
      const y2 = node2.offsetTop + node2.offsetHeight / 2;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      const connection = document.createElement("div");
      connection.className = "data-connection";
      connection.style.width = `${length}px`;
      connection.style.top = `${y1}px`;
      connection.style.left = `${x1}px`;
      connection.style.transform = `rotate(${angle}deg)`;
      dataFlow.appendChild(connection);
    }
  }
}

function updateEquationCards() {
  const container = document.getElementById("equationCardsContainer");
  const cards = document.querySelectorAll(".equation-card");
  const dots = document.querySelectorAll(".scroll-dot");
  const prevButton = document.getElementById("prevCard");
  const nextButton = document.getElementById("nextCard");
  const cardCounter = document.getElementById("cardCounter");
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  let activeCard = null;
  let minDistance = Infinity;
  let activeIndex = 0;

  cards.forEach((card) => card.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  cards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    const distanceFromCenter = Math.abs(cardCenter - containerCenter);
    if (distanceFromCenter < minDistance) {
      minDistance = distanceFromCenter;
      activeCard = card;
      activeIndex = index;
    }
  });

  if (activeCard) {
    activeCard.classList.add("active");
    if (dots[activeIndex]) {
      dots[activeIndex].classList.add("active");
    }
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === cards.length - 1;
    cardCounter.textContent = `${activeIndex + 1} of ${cards.length}`;
  }
}

function scrollToCard(index) {
  const container = document.getElementById("equationCardsContainer");
  const cards = document.querySelectorAll(".equation-card");
  if (cards[index]) {
    const card = cards[index];
    const containerWidth = container.offsetWidth;
    const cardWidth = card.offsetWidth;
    const scrollPosition = card.offsetLeft - containerWidth / 2 + cardWidth / 2;
    container.scrollTo({ left: scrollPosition, behavior: "smooth" });
  }
}

function nextCard() {
  const cards = document.querySelectorAll(".equation-card");
  const activeCard = document.querySelector(".equation-card.active");
  const activeIndex = Array.from(cards).indexOf(activeCard);
  if (activeIndex < cards.length - 1) {
    scrollToCard(activeIndex + 1);
  }
}

function prevCard() {
  const cards = document.querySelectorAll(".equation-card");
  const activeCard = document.querySelector(".equation-card.active");
  const activeIndex = Array.from(cards).indexOf(activeCard);
  if (activeIndex > 0) {
    scrollToCard(activeIndex - 1);
  }
}

function setupDotClicks() {
  const dots = document.querySelectorAll(".scroll-dot");
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => scrollToCard(index));
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const equationContainer = document.getElementById("equationCardsContainer");
  if (equationContainer) {
    equationContainer.addEventListener("scroll", updateEquationCards);
    document.getElementById("prevCard").addEventListener("click", prevCard);
    document.getElementById("nextCard").addEventListener("click", nextCard);
    setupDotClicks();
    setTimeout(() => updateEquationCards(), 100);
    window.addEventListener("resize", updateEquationCards);
    setTimeout(() => scrollToCard(0), 200);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") prevCard();
    else if (e.key === "ArrowRight") nextCard();
  });
});
