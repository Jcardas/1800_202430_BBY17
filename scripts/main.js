let cardTemplate = document.getElementById("productCardTemplate");
displayPosts();

function displayPosts() {
  let listingsRef = db.collection("listings");
  const urlParams = new URLSearchParams(window.location.search);
  const search = urlParams.get("product-name")?.trim();
  if (search) {
    listingsRef = listingsRef.where("name", "==", search);
  }

  listingsRef.get().then((docs) => {
    const promises = [];
    docs.forEach((doc) => promises.push(addPostToPage(doc)));
    Promise.all(promises)
      .then(hideLoadingWheel)
      .catch((error) => console.error("Error getting user data:", error));
  });
}

function addPostToPage(doc) {
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

  return db
    .collection("users")
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
    });
}
