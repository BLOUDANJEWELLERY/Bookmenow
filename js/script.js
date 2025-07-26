// ==== HAMBURGER MENU TOGGLE WITH ANIMATION ====
document.getElementById("hamburger")?.addEventListener("click", () => {
  const navLinks = document.getElementById("nav-links");
  const hamburgerIcon = document.getElementById("hamburger");

  navLinks?.classList.toggle("show");
  hamburgerIcon?.classList.toggle("open");
});