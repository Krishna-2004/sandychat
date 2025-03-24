document.addEventListener("DOMContentLoaded", () => {
  AOS.init();
  lottie.loadAnimation({
    container: document.getElementById("lottie-chat"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json",
  });
  particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 4,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 1 } },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  });
  function speakMessage(message) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }
  }
  async function sendMessage() {
    const userInputElement = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const userInput = userInputElement.value.trim();
    if (!userInput) {
      alert("Please enter a scenario.");
      return;
    }
    const userMsg = document.createElement("p");
    userMsg.className = "chat-message";
    userMsg.innerHTML = `<i class="fa-solid fa-user"></i><span class="user-msg"><strong>You:</strong> ${userInput}</span>`;
    chatBox.appendChild(userMsg);
    gsap.fromTo(
      userMsg,
      { opacity: 0, x: -100 },
      { opacity: 1, x: 0, duration: 0.5 }
    );
    userInputElement.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
    const typingIndicator = document.createElement("p");
    typingIndicator.className = "chat-message typing-indicator";
    typingIndicator.innerHTML = `<i class="fa-solid fa-gavel"></i><span class="bot-msg"><strong>Bot:</strong> Typing...</span>`;
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    try {
      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: userInput }),
      });
      const data = await response.json();
      typingIndicator.classList.remove("typing-indicator");
      typingIndicator.innerHTML = `<i class="fa-solid fa-gavel"></i><span class="bot-msg"><strong>Bot:</strong> ${data.response}</span>`;
      gsap.fromTo(
        typingIndicator,
        { opacity: 0, x: 100 },
        { opacity: 1, x: 0, duration: 0.5 }
      );
      speakMessage(data.response);
    } catch (error) {
      typingIndicator.classList.remove("typing-indicator");
      typingIndicator.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i><span class="error-msg"><strong>Error:</strong> Unable to connect to the server.</span>`;
      gsap.fromTo(
        typingIndicator,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  document.getElementById("analyze-btn").addEventListener("click", sendMessage);
  document.getElementById("user-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  document.getElementById("new-chat-btn").addEventListener("click", () => {
    document.getElementById("chat-box").innerHTML = "";
  });
  const voiceBtn = document.getElementById("voice-btn");
  let recognition;
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById("user-input").value = transcript;
    });
    recognition.addEventListener("speechend", () => {
      recognition.stop();
      voiceBtn.classList.remove("listening");
      voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> Speak';
      sendMessage();
    });
    recognition.addEventListener("error", (event) => {
      console.error("Speech recognition error: " + event.error);
      voiceBtn.classList.remove("listening");
      voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> Speak';
    });
  } else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Voice recognition is not supported in this browser.";
  }
  voiceBtn.addEventListener("click", () => {
    if (recognition) {
      voiceBtn.innerHTML =
        '<i class="fa-solid fa-microphone-slash"></i> Listening...';
      voiceBtn.classList.add("listening");
      recognition.start();
    }
  });
  const customCursor = document.getElementById("custom-cursor");
  document.addEventListener("mousemove", (e) => {
    customCursor.style.left = e.clientX + "px";
    customCursor.style.top = e.clientY + "px";
  });
  document.addEventListener("mousedown", () =>
    customCursor.classList.add("dragging")
  );
  document.addEventListener("mouseup", () =>
    customCursor.classList.remove("dragging")
  );
  const interactiveElements = document.querySelectorAll("button, textarea, a");
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () =>
      gsap.to(customCursor, { scale: 1.6, duration: 0.2 })
    );
    el.addEventListener("mouseleave", () =>
      gsap.to(customCursor, { scale: 1, duration: 0.2 })
    );
  });
});