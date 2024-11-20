const productContainer = document.getElementById("product-content-container");

var sellerID;
retrieveProductData().then(retrieveSellerData);

function retrieveProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingID = urlParams.get("id");

  return db
    .collection("listing")
    .doc(listingID)
    .get()
    .then((doc) => {
      const data = doc.data();
      const type = data.type;
      const price = data.price;
      const photo = data.fileURL;
      const description = data.description;
      sellerID = data.userID;

      productContainer.querySelector("#product-photo").src = photo;
      productContainer.querySelector("#price").innerText = price;
      productContainer.querySelector("#product-type").innerText = type;
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
