// ==== DARK MODE TOGGLE WITH ICON PERSISTENCE ====
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");

  // Apply stored theme on page load
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
  }

  // Toggle theme on button click
  themeToggleBtn?.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
  });
});

// ==== HAMBURGER MENU TOGGLE WITH ANIMATION ====
document.getElementById("hamburger")?.addEventListener("click", () => {
  const navLinks = document.getElementById("nav-links");
  const hamburgerIcon = document.getElementById("hamburger");

  navLinks?.classList.toggle("show");
  hamburgerIcon?.classList.toggle("open");
});