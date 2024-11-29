const darkModeLink = document.getElementById("dark-mode-css");
const darkModeToggle = document.getElementById("dark-mode-toggle");

initializeDarkMode();
getExistingProductNames()
  .then(populateSearchSuggestions)
  .then(setupSearchForms);

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
  for (const form of document.querySelectorAll(".searchbar-form")) {
    form.onsubmit = submit;
  }

  function submit(event) {
    const form = event.target;
    const input = form.querySelector("input");
    input.value = input.value.trim();

    if (existingProductNames.has(input.value)) return;

    let products = [...existingProductNames];
    let chosenProduct = products[0];
    let minDistance = levenshtein(chosenProduct, input.value);
    for (let i = 1; i < products.length; ++i) {
      let product = products[i];
      let distance = levenshtein(product, input.value);
      if (distance < minDistance) {
        chosenProduct = product;
        minDistance = distance;
      }
    }

    const SIMILARITY_THRESHOLD = 5;
    if (minDistance < SIMILARITY_THRESHOLD) {
      input.value = chosenProduct;
      return;
    }

    event.preventDefault();
    alert("No products exist with that name");
    return;
  }
}
