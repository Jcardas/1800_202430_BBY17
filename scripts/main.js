displayCardsDynamically();
determineFarmerStatus();

function displayCardsDynamically() {
  let cardTemplate = document.getElementById("productCardTemplate");

  let listingsRef = db.collection("listings");
  const urlParams = new URLSearchParams(window.location.search);
  const search = urlParams.get("product-name")?.trim();
  if (search) {
    console.log("here");
    listingsRef = listingsRef.where("name", "==", search);
  }

  // Start a counter for the number of cards loaded
  let cardsToLoad = 0;

  listingsRef.get().then((docs) => {
    // Set the number of cards to load to the size of the documents
    cardsToLoad = docs.size;

    // If no cards to load, hide the loading wheel immediately
    if (cardsToLoad === 0) {
      hideLoadingWheel();
      return;
    }

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

          // Default farmer name in case one can't be found
          const name = data.name || "Unknown Farmer";
          newcard.querySelector(".product-profile-icon").src = avatar;
          newcard.querySelector(".product-farmer-name").innerText = name;

          // Append card to the page
          document.getElementById("products-go-here").appendChild(newcard);

          // Decrement the counter and hide the loading wheel if all cards are loaded
          cardsToLoad--;
          if (cardsToLoad === 0) {
            hideLoadingWheel();
          }
        })

        // Error in case the user data cant load.
        .catch((error) => {
          console.error("Error getting user data:", error);
          cardsToLoad--; // Decrement even if there is an error
          if (cardsToLoad === 0) {
            hideLoadingWheel();
          }
        });
    });

    //Throw an error in case the listings cant load.
  }).catch((error) => {
    console.error("Error getting listings:", error);
    hideLoadingWheel(); // Hide the loading wheel if there is an error.
  });
}