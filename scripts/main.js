let cardTemplate = document.getElementById("productCardTemplate");
const pageName = document.getElementById("page-name");

displayPosts();

function displayPosts() {
  let listingsRef = db.collection("listings");
  const urlParams = new URLSearchParams(window.location.search);
  const searchProduct = urlParams.get("product-name")?.trim();
  if (searchProduct) {
    listingsRef = listingsRef.where("name", "==", searchProduct);
    pageName.innerText = searchProduct;
  }

  // Searches based on farmer ID
  const searchFarmer = urlParams.get("farmer-id")?.trim();

  if (searchFarmer) {
    // Reference the "users" collection
    const farmersRef = db.collection("users");

    // Fetch the document for the given user ID
    farmersRef
      .doc(searchFarmer)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          // Retrieve the "name" field from the user document
          const userName = docSnapshot.data().name;

          // Update the pageName with the user's name
          pageName.innerText = userName;
        }
      })
      .catch((error) => {
        console.error("Error fetching user document:", error);
        pageName.innerText = "Error retrieving user data";
      });
    listingsRef = listingsRef.where("userID", "==", searchFarmer);
  }

  listingsRef.onSnapshot((docs) => {
    const promises = [];
    docs.forEach((doc) => promises.push(addCard(doc)));
    Promise.all(promises)
      .then(hideLoadingWheel)
      .catch((error) => console.error("Error getting user data:", error));
  });
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
