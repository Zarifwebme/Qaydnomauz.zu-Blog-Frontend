/* ===== Theme Toggle (desktop + mobile) ===== */

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  // Ikki toggle ham bor bo'lishi mumkin: desktop va mobile
  const icon = theme === "dark"
    ? '<i class="bi bi-sun"></i>'
    : '<i class="bi bi-moon-stars"></i>';

  const ids = ["themeToggle", "themeToggleMobile"];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.innerHTML = icon;
  });
}

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function toggleTheme() {
  const oldTheme = document.documentElement.getAttribute("data-theme") || "light";
  const nextTheme = oldTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
}

function initTheme() {
  const current = getInitialTheme();
  applyTheme(current);

  // Har ikkala toggle buttonga click event qo'shamiz
  const ids = ["themeToggle", "themeToggleMobile"];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", toggleTheme);
  });
}

document.addEventListener("DOMContentLoaded", initTheme);