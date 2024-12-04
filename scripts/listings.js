const listingForm = document.getElementById("listing-form-info");
const fileContainer = document.getElementById("form-type-img");
const listingFile = document.getElementById("photo-video-input");
const productPhoto = document.getElementById("input-product-photo");
const fileText = document.getElementById("photo-text");

var currentUser;
getCurrentUser().then((user) => {
  // no need to check if user exists,
  // it's impossible for a non-user to access this page in the first place
  currentUser = user;
});
generateProductOptions();
setupNameAutocorrect();

listingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    // the user is definitely logged in, but we still need this check
    // in case they click "submit" before getCurrentUser().then responds
    return;
  }

  let fileURL = "";
  // This code gets the selected product type (e.g Seeds or Produce)
  const type = document.querySelector(
    'input[name="productType"]:checked'
  )?.value;

  if (type) {
    console.log(`Selected type: ${type}`);
  } else {
    console.log("No product type selected");
  }

  const name = document.getElementById("name").value;
  if (!validProductNames.has(name)) {
    alert("Invalid product name.");
    document.getElementById("name").focus();
    return;
  }

  const price = document.getElementById("price").value;
  const units = document.getElementById("unit").value;
  const description = document.getElementById("description").value;

  if (listingFile.files.length == 0) {
    alert("You must provide a photo.");
    return;
  }

  const file = listingFile.files[0];
  const fileRef = storage.ref(`listings/${currentUser.uid}/${file.name}`);
  fileURL = await fileRef.put(file).then(() => fileRef.getDownloadURL());

  db.collection("listings")
    .add({
      type: type,
      name: name,
      price: parseFloat(price),
      units: units,
      description: description,
      userID: currentUser.uid,
      fileURL: fileURL || null,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      alert("Listing submitted successfully!");
      window.location.assign("main.html");
    })
    .catch((error) => {
      console.error("Error saving listing", error);
      alert("Failed to submit listing. Please try again.");
    });
});

fileContainer.addEventListener("click", () => listingFile.click());
fileText.addEventListener("click", () => listingFile.click());

listingFile.addEventListener("change", () => {
  const postURL = URL.createObjectURL(listingFile.files[0]);
  productPhoto.parentElement.style.width = "300px";
  productPhoto.src = postURL;
  productPhoto.style.objectFit = "cover";
  productPhoto.style.height = productPhoto.style.width = "100%";
  fileText.style.display = "none";
});

window.onload = function () {
  // Extract the productType from the URL
  const params = new URLSearchParams(window.location.search);
  const productType = params.get("productType");

  // If productType is present, autofill the product type field
  if (productType) {
    console.log("Product type was: " + productType);
    document.getElementById(productType).checked = true;
  } else {
    console.log("No product was previously selected");
  }
};

var validProductNames = new Set();
function generateProductOptions() {
  const productOptions = document.getElementById("product-options");

  // Gets the products file for reference.
  fetch("/assets/products.csv")
    .then((res) => res.text())
    .then((text) => {
      // Gets an array of products from the file, splitting on each \n.
      const entries = text.split("\n");

      // for each entry, append it to #product-options
      entries.forEach((entry) => {
        const productOption = document.createElement("option");
        productOptions.appendChild(productOption);
        productOption.value = entry;
        validProductNames.add(entry);
      });
    });
}

function setupNameAutocorrect() {
  const nameInput = document.getElementById("name");
  nameInput.oninput = function () {
    nameInput.classList.remove("invalid-name");
  };
  nameInput.onchange = function () {
    if (!autocorrect(nameInput, validProductNames)) {
      nameInput.focus();
      nameInput.classList.add("invalid-name");
    }
  };
}
