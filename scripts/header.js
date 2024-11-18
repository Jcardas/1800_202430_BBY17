const darkModeLink = document.getElementById("dark-mode-css");
const darkModeToggle = document.getElementById("dark-mode-toggle");

initializeDarkMode();

function initializeDarkMode() {
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  darkModeLink.disabled = !dark;
  darkModeToggle.checked = true;
  console.log(dark);
}

function toggleDarkMode() {
  darkModeLink.disabled = !darkModeToggle.checked;
}
