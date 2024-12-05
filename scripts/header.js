const darkModeLink = document.getElementById("dark-mode-css");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const filterMenu = document.getElementById("filters-container");
const priceSorter = document.getElementById("price-sorter");
const priceInput = document.getElementById("price-max");
const priceUnit = document.getElementById("unit-selector");
const reviewSorter = document.getElementById("review-sorter");
const reviewStars = document.querySelectorAll(".review-star");

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

  const params = [];

  const farmerId = urlParams.get("farmer-id");
  if (farmerId) {
    params.push(`farmer-id=${farmerId}`);
  }

  const name = input.value;
  if (name.length > 0) {
    params.push(`product-name=${name}`);
  }

  const price = priceInput.value;
  const priceSort = priceSorter.innerText;
  if (price.length > 0 && !isNaN(price)) {
    params.push(`price=${price}`);
    params.push(`price-sort=${priceSort == "Price ↑" ? "asc" : "desc"}`);
  }

  const unit = priceUnit.value;
  if (unit.length > 0) {
    params.push(`unit=${unit}`);
  }

  let review = 0;
  reviewStars.forEach((star) => {
    if (star.innerText == "star") ++review;
  });
  const reviewSort = reviewSorter.innerText;
  if (review > 0) {
    params.push(`review=${review}`);
    params.push(`review-sort=${reviewSort == "Review ↑" ? "asc" : "desc"}`);
  }

  if (params.length > 0) {
    window.location.assign(`main.html?${params.join("&")}`);
  }
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
  priceSorter.innerText =
    priceSorter.innerText === "Price ↑" ? "Price ↓" : "Price ↑";
}

function changeReviewSorting() {
  reviewSorter.innerText =
    reviewSorter.innerText === "Reviews ↑" ? "Reviews ↓" : "Reviews ↑";
}

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
