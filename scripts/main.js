let cardTemplate = document.getElementById("productCardTemplate");
const pageName = document.getElementById("page-name");

displayPosts();

function displayPosts() {
  let listingsRef = db.collection("listings");

  applyFilter(listingsRef).onSnapshot((docs) => {
    const promises = [];
    docs.forEach((doc) => promises.push(addCard(doc)));
    Promise.all(promises)
      .then(hideLoadingWheel)
      .catch((error) => console.error("Error getting user data:", error));
  });
}

function applyFilter(listingsRef) {
  const productName = urlParams.get("product-name")?.trim();
  const searchFarmer = urlParams.get("farmer-id")?.trim();
  const price = urlParams.get("price");
  const unit = urlParams.get("unit");
  const priceSort = urlParams.get("price-sort");
  const review = urlParams.get("review");
  const reviewSort = urlParams.get("review-sort");

  if (productName) {
    listingsRef = listingsRef.where("name", "==", productName);
    pageName.innerText = productName;
  }

  if (searchFarmer) {
    listingsRef = listingsRef.where("userID", "==", searchFarmer);
    db.collection("users")
      .doc(searchFarmer)
      .get()
      .then((doc) => doc.data().name)
      .then((farmerName) => (pageName.innerText = farmerName))
      .catch((error) => console.error("Error fetching user document:", error));
  }

  if (price) {
    listingsRef = listingsRef.where("price", "<=", parseFloat(price));
  }

  if (priceSort) {
    listingsRef = listingsRef.orderBy("price", priceSort);
  }

  if (unit) {
    listingsRef = listingsRef.where("units", "==", unit);
  }

  if (review) {
    listingsRef = listingsRef.where("averageRating", ">=", parseFloat(review));
  }

  if (reviewSort) {
    listingsRef = listingsRef.orderBy("averageRating", reviewSort);
  }

  return listingsRef;
}

function addCard(doc) {
  if (document.getElementById(doc.id)) {
    return Promise.resolve(null);
  }

  const data = doc.data();
  var name = data.name;
  var unit = data.units.slice(1);
  var price = data.price;
  var productPhoto = data.fileURL;
  var rating = data.averageRating;

  let newcard = cardTemplate.cloneNode(true);
  newcard.style.display = "";
  newcard.id = doc.id;
  newcard
    .querySelector("a")
    .setAttribute("href", `/each_product.html?id=${doc.id}`);
  newcard.querySelector(".name").innerText = name;
  newcard.querySelector(".price").innerText = `$${price}${unit}`;
  newcard.querySelector(".card-img").src = productPhoto;
  setRating(newcard, rating);

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

function setRating(card, rating) {
  if (!rating) return;

  card.querySelector(".rating").style.display = "flex";
  for (let i = 1; i <= rating; ++i) {
    card.querySelector(`.star${i}`).innerText = "star";
  }
  const nextStar = card.querySelector(`.star${Math.ceil(rating)}`);
  if (rating % 1 > 0.75) {
    nextStar.innerText = "star";
  } else if (rating % 1 > 0.25) {
    nextStar.innerText = "star_half";
  }
}
