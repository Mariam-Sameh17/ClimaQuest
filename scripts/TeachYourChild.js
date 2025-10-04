document.addEventListener("DOMContentLoaded", () => {
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
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  // --- Starry Background Generation ---
  const starsBackground = document.querySelector(".stars-background");
  const numberOfStars = 150;

  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 3;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    starsBackground.appendChild(star);
  }

  const allSteps = Array.from(document.querySelectorAll(".step"));
  allSteps.forEach((step) => step.classList.remove("is-visible"));
  if (allSteps.length > 0) {
    allSteps[0].classList.add("is-visible");
  }

  const revealNextStep = (currentStepElement) => {
    const currentIndex = allSteps.indexOf(currentStepElement);
    if (currentIndex < allSteps.length - 1) {
      const nextStep = allSteps[currentIndex + 1];
      nextStep.classList.add("is-visible");
      setTimeout(() => {
        nextStep.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  };

  // --- Gemini API Integration ---
  const generateSummary = async (button) => {
    const stepElement = button.closest(".step");
    const videoTopic = stepElement.dataset.videoTopic;
    const summaryContainer = stepElement.querySelector(".summary-container");

    if (!videoTopic) return;

    summaryContainer.innerHTML = '<div class="loading-spinner"></div>';
    button.disabled = true;

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const systemPrompt =
      "You are an expert science communicator. Summarize the following topic for a beginner in a concise, engaging, and easy-to-understand paragraph.";
    const userQuery = `Summarize the key points about: ${videoTopic}.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        summaryContainer.innerHTML = candidate.content.parts[0].text;
      } else {
        summaryContainer.textContent =
          "Sorry, I couldn't generate a summary at this time.";
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      summaryContainer.textContent =
        "An error occurred. Please try again later.";
    }
  };

  document.querySelectorAll(".ai-summary-trigger").forEach((button) => {
    button.addEventListener("click", () => generateSummary(button));
  });

  // --- Quiz Data ---
  const quizData = {
    quiz1: {
      title: "Quiz: Episode 1",
      question:
        "Q1. In London, it starts raining very heavily. What should you do?",
      options: [
        "Run in the rain with no umbrella",
        "Climb a light pole",
        "Stand under a safe shelter until it stops",
        "none",
      ],
      answer: "Stand under a safe shelter until it stops",
    },
    quiz2: {
      title: "Quiz: Episode 2",
      question:
        "Q2. In Shanghai, the wind is blowing very strongly. What’s the best choice?",
      options: [
        " Hold on to your hat and walk in the middle of the street",
        "Stay away from trees and big signs ",
        "Fly a kite in the storm",
        "none",
      ],
      answer: "Stay away from trees and big signs ",
    },
    quiz3: {
      title: "Quiz: Episode 3",
      question:
        "In New York, the streets are covered with ice. How should you walk?",
      options: [
        "Run fast so you don’t slip",
        "Jump on the icy roads",
        "both a and b",
        "Walk slowly and carefully",
      ],
      answer: "Walk slowly and carefully Way",
    },
    quiz4: {
      title: "Quiz: Episode 4",
      question:
        "In Cairo, the weather is very hot and dry. What should you remember to do?",
      options: [
        "Wear a heavy jacket",
        "Stay under the sun all day",
        "both a and b",
        " Drink plenty of water",
      ],
      answer: "Drink plenty of water",
    },
  };

  const modalOverlay = document.querySelector(".modal-overlay");
  const modalClose = document.querySelector(".modal-close");
  const quizTitle = document.getElementById("quiz-title");
  const quizQuestion = document.getElementById("quiz-question");
  const quizOptionsContainer = document.getElementById("quiz-options");
  const quizFeedback = document.getElementById("quiz-feedback");
  let currentStepForQuiz = null;

  const loadQuiz = (quizId, stepElement) => {
    currentStepForQuiz = stepElement;
    const currentQuiz = quizData[quizId];
    if (!currentQuiz) return;

    quizOptionsContainer.innerHTML = "";
    quizFeedback.textContent = "";
    quizTitle.textContent = currentQuiz.title;
    quizQuestion.textContent = currentQuiz.question;

    currentQuiz.options.forEach((optionText) => {
      const button = document.createElement("button");
      button.textContent = optionText;
      button.addEventListener("click", () => checkAnswer(button, currentQuiz));
      quizOptionsContainer.appendChild(button);
    });
  };

  const checkAnswer = (selectedButton, quiz) => {
    const isCorrect = selectedButton.textContent === quiz.answer;
    const optionButtons = quizOptionsContainer.querySelectorAll("button");

    optionButtons.forEach((btn) => {
      btn.classList.add("disabled");
      if (btn.textContent === quiz.answer) btn.classList.add("correct");
    });

    if (isCorrect) {
      selectedButton.classList.add("correct");
      quizFeedback.textContent = "Correct! Moving to the next step.";
      quizFeedback.style.color = "var(--accent-tertiary)";
      setTimeout(() => {
        closeModal();
        revealNextStep(currentStepForQuiz);
      }, 1500);
    } else {
      selectedButton.classList.add("incorrect");
      quizFeedback.textContent =
        "Not quite! Try again or pass to the next step.";
      quizFeedback.style.color = "#c0392b";
    }
  };

  document.querySelectorAll(".quiz-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      const quizId = button.dataset.quizId;
      const stepElement = button.closest(".step");
      loadQuiz(quizId, stepElement);
      modalOverlay.classList.add("active");
    });
  });

  document.querySelectorAll(".pass-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      const stepElement = button.closest(".step");
      revealNextStep(stepElement);
    });
  });

  const closeModal = () => modalOverlay.classList.remove("active");
  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetElement = document.querySelector(this.getAttribute("href"));
      if (targetElement) {
        targetElement.classList.add("is-visible");
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});
