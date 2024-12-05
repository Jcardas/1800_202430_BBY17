const listingForm = document.getElementById("listing-form-info");
const fileContainer = document.getElementById("form-type-img");
const listingFile = document.getElementById("photo-video-input");
const productPhoto = document.getElementById("input-product-photo");
const fileText = document.getElementById("photo-text");

var currentUser;
var validProductNames = new Set();

getCurrentUser()
  .then((user) => (currentUser = user))
  .then(prefillForm)
  .then(showButtons);

generateProductOptions();
setupNameAutocorrect();

listingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  submitPost();
});

listingForm.addEventListener("reset", (e) => {
  e.preventDefault();
  deletePost().then(() => window.location.assign("main.html"));
});

fileContainer.addEventListener("click", () => listingFile.click());
fileText.addEventListener("click", () => listingFile.click());

listingFile.addEventListener("change", () =>
  updateProductPhoto(URL.createObjectURL(listingFile.files[0]))
);

function updateProductPhoto(src) {
  productPhoto.src = src;
  productPhoto.style.objectFit = "cover";
  productPhoto.style.height = productPhoto.style.width = "100%";
  productPhoto.parentElement.style.width = "300px";
  fileText.style.display = "none";
}

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

function submitPost() {
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

  if (urlParams.get("edit")) {
    const docId = urlParams.get("edit");

    if (listingFile.files.length == 0) {
      return db
        .collection("listings")
        .doc(docId)
        .update({
          type: type,
          name: name,
          price: parseFloat(price),
          units: units,
          description: description,
          userID: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => window.location.assign("main.html"))
        .catch((error) => {
          console.log(error);
          alert("Failed to update listing. Please try again.");
        });
    }

    const file = listingFile.files[0];
    const fileRef = storage.ref(`listings/${currentUser.uid}/${file.name}`);
    return fileRef
      .put(file)
      .then(() => fileRef.getDownloadURL())
      .then((fileURL) => {
        db.collection("listings")
          .doc(docId)
          .update({
            type: type,
            name: name,
            price: parseFloat(price),
            units: units,
            description: description,
            userID: currentUser.uid,
            fileURL: fileURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => window.location.assign("main.html"))
          .catch((error) => {
            console.log(error);
            alert("Failed to update listing. Please try again.");
          });
      });
  }

  if (listingFile.files.length == 0) {
    alert("You must provide a photo.");
    return;
  }

  const file = listingFile.files[0];
  const fileRef = storage.ref(`listings/${currentUser.uid}/${file.name}`);
  return fileRef
    .put(file)
    .then(() => fileRef.getDownloadURL())
    .then((fileURL) => {
      db.collection("listings")
        .add({
          type: type,
          name: name,
          price: parseFloat(price),
          units: units,
          description: description,
          userID: currentUser.uid,
          fileURL: fileURL,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => window.location.assign("main.html"))
        .catch((error) => {
          console.log(error);
          alert("Failed to submit listing. Please try again.");
        });
    });
}

function deletePost() {
  const docId = urlParams.get("edit");
  return db
    .collection("listings")
    .doc(docId)
    .delete()
    .catch((error) => {
      console.log(error);
      alert("Failed to delete listing. Please try again.");
    });
}

function prefillForm() {
  const docId = urlParams.get("edit");
  if (docId) {
    return db
      .collection("listings")
      .doc(docId)
      .get()
      .then((doc) => {
        const data = doc.data();
        updateProductPhoto(data.fileURL);
        document.getElementById("name").value = data.name;
        document.getElementById(data.type).checked = true;
        document.getElementById("price").value = data.price;
        document.getElementById("unit").value = data.units;
        document.getElementById("description").value = data.description;
        document.getElementById("post").innerText = "Update";
        document.getElementById("delete").style.display = "";
      });
  }

  const productType = urlParams.get("productType");
  if (productType) {
    document.getElementById(productType).checked = true;
  }
  return Promise.resolve(null);
}

function showButtons() {
  document.getElementById("buttons-container").style.display = "";
}
