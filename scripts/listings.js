const listingForm = document.getElementById("lisiting-form-info");
const fileContainer = document.getElementById("form-type-img");
const listingFile = document.getElementById("photo-video-input");
const fileText = document.getElementById("photo-text");
const submit = document.getElementById("post");

populateSettings();

submit.addEventListener("click", async (e) => {
  e.preventDefault();
});

fileContainer.addEventListener("click", () => listingFile.click());
fileText.addEventListener("click", () => listingFile.click());

listingFile.addEventListener("change", () => {
  const fileInput = URL.createObjectURL(listingFile.files[0]);
});

function populateSettings() {
  firebase.auth().onAuthStateChanged((listing) => {
    db.collection("listing")
      .doc(listing.uid)
      .get()
      .then((doc) => {
        if (!doc.exists) return;

        const data = doc.data();
        document.getElementById("productType").value = data.productType;
        document.getElementById("price").value = data.price;
        document.getElementById("unit").value = data.unit;
        document.getElementById("description").value = data.description;
      });
  });
}

window.onload = function() {
  // Extract the productType from the URL
  const params = new URLSearchParams(window.location.search);
  const productType = params.get('productType');

  // If productType is present, autofill the product type field
  if (productType) {
    document.getElementById('productType').value = productType;
  }
};

// Existing form population code
populateSettings();
