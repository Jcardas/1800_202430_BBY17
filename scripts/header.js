const darkModeLink = document.getElementById("dark-mode-css");
const darkModeToggle = document.getElementById("dark-mode-toggle");

initializeDarkMode();

function initializeDarkMode() {
  let darkMode;
  if (localStorage.getItem("dark-mode")) {
    darkMode = localStorage.getItem("dark-mode") == "true";
  } else {
    darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  darkModeLink.disabled = !darkMode;
  darkModeToggle.checked = darkMode;
}

darkModeToggle.addEventListener("input", () => {
  darkModeLink.disabled = !darkModeToggle.checked;
  localStorage.setItem("dark-mode", !darkModeLink.disabled);
});


var currentPage = window.location.pathname;
currentPage = currentPage.replace("/", "").replace(".html", "");

console.log(currentPage);

var selectedTab = document.getElementById(currentPage);
if (selectedTab) {
  console.log(selectedTab);

  selectedTab.classList.add("selected-tab");
}

const f = document.getElementById("searchbar-form");
const q = document.getElementById("navbar-searchbar");
const google = "https://www.google.com/search?q=";

function submitted(event) {
  event.preventDefault();
  const url = google + q.value;
  const win = window.open(url, "_blank");
  win.focus();
}

f.addEventListener("submit", submitted);