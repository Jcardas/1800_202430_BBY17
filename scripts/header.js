const { eventNames } = require("process");

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


const searchForm = document.querySelector("#searchbar-form");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const f = document.getElementById("navbar-searchbar").value.trim();
  console.log("search submitted");
  if (!f) {
    return;
  }

  const listingsRef = db.collection("listings");
  listingsRef.where("productType", "==", f).get();
  console.log("Query executed").then((querySnapShot) => {
    const searchResults = document.getElementById("search-results");
    if (!searchResults) {
      searchResults = document.createElement("div");
      searchResults.id = "search-results";
      document.body.appendChild(searchResults);
    }
    searchResults.innerHTML = "";
  });

  if (querySnapShot.empty) {
    console.log("No results found:", searchResults);
    searchResults.innerHTML = "<p>No matching results found</p>";
  }

  querySnapShot.forEach((doc) => {
    const listing = doc.data();
    console.log("Document Data:", listing);
  });
});
