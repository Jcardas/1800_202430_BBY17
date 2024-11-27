const darkModeLink = document.getElementById("dark-mode-css");
const darkModeToggle = document.getElementById("dark-mode-toggle");

initializeDarkMode();
populateSearchSuggestions();

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

var selectedTab = document.getElementById(currentPage);
if (selectedTab) {
  console.log(selectedTab);

  selectedTab.classList.add("selected-tab");
}

function populateSearchSuggestions() {
  const datalist = document.getElementById("product-names");
  getExistingProductNames().then((names) => {
    names.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.innerText = name;
      datalist.appendChild(option);
    });
  });
}

function getExistingProductNames() {
  return db
    .collection("listings")
    .get()
    .then((docs) => {
      const names = new Set();
      docs.forEach((doc) => names.add(doc.data().name));
      return names;
    });
}
