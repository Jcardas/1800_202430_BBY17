const productContainer = document.getElementById("product-content-container");
const messageButton = document.getElementById("message-button");

var sellerID;
retrieveProductData().then(retrieveSellerData);

function retrieveProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingID = urlParams.get("id");

  return db
    .collection("listings")
    .doc(listingID)
    .get()
    .then((doc) => {
      const data = doc.data();
      const name = data.name;
      const price = data.price;
      const photo = data.fileURL;
      const description = data.description;
      sellerID = data.userID;

      productContainer.querySelector("#product-photo").src = photo;
      productContainer.querySelector("#price").innerText = price;
      productContainer.querySelector("#product-name").innerText = name;
      productContainer.querySelector("#product-desc").innerText = description;
    });
}

function retrieveSellerData() {
  db.collection("users")
    .doc(sellerID)
    .get()
    .then((doc) => {
      const data = doc.data();
      const avatar = data.avatar || "/assets/profile_photo.png";
      const name = data.name;
      productContainer.querySelector(".product-profile-icon").src = avatar;
      productContainer.querySelector(".product-farmer-name").innerText = name;
    });
}

messageButton.addEventListener("click", () => {
  // in case the button is clicked before firebase responds with who the seller is
  if (!sellerID) return;

  firebase.auth().onAuthStateChanged((user) => {
    db.collection("users")
      .doc(user.uid)
      .update({
        contacts: firebase.firestore.FieldValue.arrayUnion(sellerID),
      })
      .then(() => location.assign(`messages.html?to=${sellerID}`));
  });
});

function saveListingDocIDAndRedirect() {
  let params = new URL(window.location.href)
  let ID = params.searchParams.get("id");
  localStorage.setItem('listingDocID', ID);
  window.location.href = 'review.html';
}
