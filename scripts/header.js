const darkModeLink = document.getElementById("dark-mode-css");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const filterMenu = document.getElementById("filters-container");

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
  if (!autocorrect(input, existingProductNames)) return;
  window.location.assign(`main.html?product-name=${input.value}`);
}

// Filter Menu Dropdown ------------

window.addEventListener("resize", hideMenuOnResize);
// Hide the menu when the page is resized, to prevent misalignment.
function hideMenuOnResize() {
  filterMenu.style.display = "none";
}

// Aligns the filter menu below the search bar when the icon is clicked.
function alignFilterMenu(event) {
  // Gets the element that triggered the function
  const callerElement = event.target;

  // Gets a rectangle and location bounding the element, then determines the location of it.
  const rect = callerElement.getBoundingClientRect();
  const position = {
    x: rect.left + window.scrollX, // The location of the left of the box around the element
    y: rect.bottom + window.scrollY, // The bottom of the box
  };

  filterMenu.style.left = `${position.x - 278}px`;
  filterMenu.style.top = `${position.y + 20}px`;

  displayFilters();
}

function displayFilters() {
  // Toggle the filter menu
  filterMenu.style.display =
    filterMenu.style.display === "none" || filterMenu.style.display === ""
      ? "grid"
      : "none";
}

function changePriceSorting() {
  const priceSorter = document.getElementById("price-sorter");
  priceSorter.innerText =
    priceSorter.innerText === "Price ↑" ? "Price ↓" : "Price ↑";
}

function changeReviewSorting() {
  const reviewSorter = document.getElementById("review-sorter");
  reviewSorter.innerText =
    reviewSorter.innerText === "Reviews ↑" ? "Reviews ↓" : "Reviews ↑";
}

const reviewStars = document.querySelectorAll(".review-star");
reviewStars.forEach(
  (star, index) =>
    (star.onclick = () => {
      for (let i = 0; i <= index; i++) {
        reviewStars[i].innerText = "star";
      }
      for (let i = index + 1; i < 5; i++) {
        reviewStars[i].innerText = "star_outline";
      }
    })
);
