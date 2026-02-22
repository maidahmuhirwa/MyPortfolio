// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);

function setError(id, msg) {
  const el = $(id);
  if (el) el.textContent = msg || "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== Dynamic year (extra interaction) =====
$("#year").textContent = new Date().getFullYear();

// ===== Mobile menu toggle (extra interaction) =====
const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close menu when clicking a link (mobile UX)
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "a" && navLinks.classList.contains("open")) {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

// ===== Dark/Light mode (extra interaction) =====
const themeToggle = $("#themeToggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "" : "light";
  if (next) document.documentElement.setAttribute("data-theme", next);
  else document.documentElement.removeAttribute("data-theme");
  localStorage.setItem("theme", next || "");
});

// ===== Calculator: Musanze Transport Fare Estimator =====
// Rule (simple): base fee + rate per km. Adjust as you like.
const RATES = {
  moto: { base: 300, perKm: 180 },
  taxi: { base: 800, perKm: 350 },
  bus:  { base: 200, perKm: 120 }
};

$("#fareForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const distance = Number($("#distanceKm").value);
  const rideType = $("#rideType").value;

  // Validation
  let ok = true;
  if (!$("#distanceKm").value.trim()) {
    setError("#distanceError", "Distance is required.");
    ok = false;
  } else if (Number.isNaN(distance) || distance <= 0) {
    setError("#distanceError", "Distance must be a number > 0.");
    ok = false;
  } else if (distance > 200) {
    setError("#distanceError", "Distance too large. Enter a realistic value (<= 200km).");
    ok = false;
  } else {
    setError("#distanceError", "");
  }

  if (!ok) {
    $("#fareResult").textContent = "—";
    $("#fareDetails").textContent = "";
    return;
  }

  // DOM manipulation + logic
  const { base, perKm } = RATES[rideType];
  const estimate = Math.round(base + perKm * distance);

  $("#fareResult").textContent = `${estimate.toLocaleString()} RWF`;
  $("#fareDetails").textContent = `Type: ${rideType.toUpperCase()} • Base: ${base} RWF • Rate: ${perKm} RWF/km • Distance: ${distance} km`;
});

$("#calcReset").addEventListener("click", () => {
  $("#distanceKm").value = "";
  $("#rideType").value = "moto";
  setError("#distanceError", "");
  $("#fareResult").textContent = "—";
  $("#fareDetails").textContent = "";
});

// ===== Contact form validation + mailto (no backend) =====
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = $("#cName").value.trim();
  const email = $("#cEmail").value.trim();
  const msg = $("#cMsg").value.trim();

  let ok = true;

  if (!name) { setError("#cNameError", "Name is required."); ok = false; }
  else setError("#cNameError", "");

  if (!email) { setError("#cEmailError", "Email is required."); ok = false; }
  else if (!isValidEmail(email)) { setError("#cEmailError", "Enter a valid email."); ok = false; }
  else setError("#cEmailError", "");

  if (!msg) { setError("#cMsgError", "Message is required."); ok = false; }
  else if (msg.length < 10) { setError("#cMsgError", "Message must be at least 10 characters."); ok = false; }
  else setError("#cMsgError", "");

  if (!ok) {
    $("#contactHint").textContent = "Please fix errors above.";
    return;
  }

  $("#contactHint").textContent = "Opening your email app...";
  const TO = "REPLACE_ME_EMAIL"; // change this
  const subject = encodeURIComponent(`Portfolio Contact — ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`);

  window.location.href = `mailto:${TO}?subject=${subject}&body=${body}`;
});