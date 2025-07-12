// Dark mode toggle
document.getElementById("theme-toggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Apply stored theme
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});

// Hamburger toggle
document.getElementById("hamburger")?.addEventListener("click", () => {
  document.getElementById("nav-links")?.classList.toggle("show");
});