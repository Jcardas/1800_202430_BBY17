displayCardsDynamically();
determineFarmerStatus();

function displayCardsDynamically() {
  let cardTemplate = document.getElementById("productCardTemplate");

  let listingsRef = db.collection("listings");
  const urlParams = new URLSearchParams(window.location.search);
  const search = urlParams.get("product-name")?.trim();
  console.log(search);
  if (search) {
    console.log("here");
    listingsRef = listingsRef.where("name", "==", search);
  }

  listingsRef.get().then((docs) => {
    docs.forEach((doc) => {
      const data = doc.data();
      var name = data.name;
      var unit = data.units;
      var price = data.price;
      var productPhoto = data.fileURL;

      let newcard = cardTemplate.content.cloneNode(true);
      newcard
        .querySelector("a")
        .setAttribute("href", `/each_product.html?id=${doc.id}`);
      newcard.querySelector(".card-title").innerText = `\$${price} | ${name}`;
      newcard.querySelector(".card-text").innerText = unit;
      newcard.querySelector(".card-img").src = productPhoto;

      db.collection("users")
        .doc(data.userID)
        .get()
        .then((doc) => {
          const data = doc.data();
          const avatar = data.avatar || "/assets/profile_photo.png";
          const name = data.name;
          newcard.querySelector(".product-profile-icon").src = avatar;
          newcard.querySelector(".product-farmer-name").innerText = name;
          document.getElementById("products-go-here").appendChild(newcard);
        });
    });
  });
}

function determineFarmerStatus() {
  firebase.auth().onAuthStateChanged((user) => {
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (!doc.exists) return;

        if (doc.data().isFarmer) {
          // currently there is only one "make-a-post" button,
          // but loop through all in case we add more in the future
          // (e.g. one floating in the cards, one in the navbar)
          for (const button of document.querySelectorAll(".make-a-post")) {
            button.style.display = "";
          }
        }
      });
  });
}
