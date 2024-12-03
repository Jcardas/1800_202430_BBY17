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

var selectedTab = document.getElementById(currentPage);
if (selectedTab) {
  selectedTab.classList.add("selected-tab");
}

const existingProductNames = new Set();
function getExistingProductNames() {
  return db
    .collection("listings")
    .get()
    .then((docs) => {
      docs.forEach((doc) => existingProductNames.add(doc.data().name));
      return existingProductNames;
    });
}

function populateSearchSuggestions(productNames) {
  const datalist = document.getElementById("product-names");
  productNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.innerText = name;
    datalist.appendChild(option);
  });
}

function setupSearchForms() {
  // the searchbar for mobile and desktop are separate elements,
  // so we need to setup both
  for (const form of document.querySelectorAll(".searchbar-form")) {
    form.onsubmit = function (event) {
      event.preventDefault();
      search(event.target.querySelector("input"));
    };
  }
}

// there are 2 inputs, one for desktop and one for mobile,
// the function needs to know which one it is
function search(input) {
  if (autocorrect(input, existingProductNames)) {
    window.location.assign(`main.html?product-name=${input.value}`);
  }
}
