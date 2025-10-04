function createStars(containerId, count) {
  const starsContainer = document.getElementById(containerId);
  if (!starsContainer) return;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const size = Math.random() * 2 + 1;

    star.style.top = `${top}%`;
    star.style.left = `${left}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    starsContainer.appendChild(star);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // --- THEME SWITCHER LOGIC ---
  const themeToggle = document.getElementById("checkbox");
  const body = document.body;

  // Function to apply the theme
  const applyTheme = (theme) => {
    if (theme === "light-mode") {
      body.classList.add("light-mode");
      themeToggle.checked = true;
    } else {
      body.classList.remove("light-mode");
      themeToggle.checked = false;
    }
  };

  // Event listener for the toggle
  themeToggle.addEventListener("change", function () {
    if (this.checked) {
      body.classList.add("light-mode");
      localStorage.setItem("theme", "light-mode");
    } else {
      body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark-mode");
    }
  });

  // Check for saved theme preference on load
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  // --- EXISTING SCRIPT LOGIC ---
  createStars("featuresStars", 150);
  createStars("recommendationsStars", 120);
  createStars("howItWorksStars", 100);

  const heroContent = document.querySelector(".hero-content");
  heroContent.style.opacity = "0";
  heroContent.style.transform = "translateY(30px) scale(0.95)";

  setTimeout(() => {
    heroContent.style.transition = "opacity 1s, transform 1s";
    heroContent.style.opacity = "1";
    heroContent.style.transform = "translateY(0) scale(1)";
  }, 300);

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  const fadeUpElements = document.querySelectorAll(
    ".feature-card, .destination-card, .step"
  );
  fadeUpElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s, transform 0.6s";
    observer.observe(el);
  });

  // Smooth scrolling for nav links
  document.querySelector(".workBtn").addEventListener("click", function (e) {
    e.preventDefault();
    document
      .querySelector("#how-it-works")
      .scrollIntoView({ behavior: "smooth" });
  });

  document.querySelector(".destBtn").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector("#recommend").scrollIntoView({ behavior: "smooth" });
  });

  document
    .querySelector(".contactrBtn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      document
        .querySelector("#contact-info")
        .scrollIntoView({ behavior: "smooth" });
    });
});
