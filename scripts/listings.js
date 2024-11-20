const listingForm = document.getElementById("listing-form-info");
const fileContainer = document.getElementById("form-type-img");
const listingFile = document.getElementById("photo-video-input");
const fileText = document.getElementById("photo-text");
const submit = document.getElementById("post");

var currentUser;
firebase.auth().onAuthStateChanged((user) => {
  // no need to check if user exists,
  // it's impossible for a non-user to access this page in the first place
  currentUser = user;
});

submit.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    // the user is definitely logged in, but we still need this check
    // in case they click "submit" before firebase.auth().onAuthStateChanged responds
    return;
  }

  let fileURL = "";
  const type = document.getElementById("productType").value;
  const price = document.getElementById("price").value;
  const units = document.getElementById("unit").value;
  const description = document.getElementById("description").value;
  const resupplies = document.getElementById("form-text-resupplied").value;

  if (listingFile.files.length == 0) {
    alert("You must provide a photo.");
    return;
  }

  // TODO: allow uploading multiple files
  const file = listingFile.files[0];
  const fileRef = storage.ref(`listings/${currentUser.uid}/${file.name}`);
  fileURL = await fileRef.put(file).then(() => fileRef.getDownloadURL());

  db.collection("listing")
    .add({
      type: type,
      price: parseFloat(price),
      units: units,
      description: description,
      resupplies: resupplies,
      userID: currentUser.uid,
      fileURL: fileURL || null,
    })
    .then(() => {
      alert("Listing submitted successfully!");
      listingForm.reset();
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
  fileContainer.src = postURL;
});

window.onload = function () {
  // Extract the productType from the URL
  const params = new URLSearchParams(window.location.search);
  const productType = params.get("productType");

  // If productType is present, autofill the product type field
  if (productType) {
    document.getElementById("productType").value = productType;
  }
};

function checkInput(checkbox) {
  if (checkbox.checked) {
    console.log("Checked");
    document.getElementById("form-text-resupplied").style.display = "block";
  } else {
    console.log("not checked");
    document.getElementById("form-text-resupplied").style.display = "none";
  }
}
