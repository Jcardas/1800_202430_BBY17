const listingForm = document.getElementById("listing-form-info");
const fileContainer = document.getElementById("form-type-img");
const listingFile = document.getElementById("photo-video-input");
const fileText = document.getElementById("photo-text");
const submit = document.getElementById("post");

var currentUser;
var listingAvatar;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (!doc.exists) return;
        data = doc.data();
        if (data.avatar) {
          listingAvatar = data.avatar;
        }
      })
      .catch((error) => {
        console.error("Error getting user data", error);
      });
  } else {
    console.warn("No user is signed in.");
    currentUser = null;
  }
});

submit.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("You need to login to submit a listing.");
    return;
  }

  let fileURL = "";
  const type = document.getElementById("productType").value;
  const price = document.getElementById("price").value;
  const units = document.getElementById("unit").value;
  const description = document.getElementById("description").value;
  const resupplies = document.getElementById("form-text-resupplied").value;

  if (listingFile.files.length > 0) {
    const file = listingFile.files[0];
    const storageref = firebase.storage().ref();
    const fileRef = storageref.child(
      `listings/${currentUser.uid}/${file.name}`
    );

    await fileRef.put(file);
    fileURL = await fileRef.getDownloadURL();
  }

  db.collection("listing")
    .add({
      type: type,
      price: parseFloat(price),
      units: units,
      description: description,
      resupplies: resupplies,
      userID: currentUser.uid,
      avatar: listingAvatar || null,
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
