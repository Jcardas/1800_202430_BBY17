const productContainer = document.getElementById("product-content-container");
const reviewBtn = productContainer.querySelector(".review-btn");
const messageButton = document.getElementById("message-button");

var sellerID;
var listingID;
var isReviewing = false;
retrieveProductData().then(retrieveSellerData);

function retrieveProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  listingID = urlParams.get("id");

  return db
    .collection("listings")
    .doc(listingID)
    .get()
    .then((doc) => {
      const data = doc.data();
      const name = data.name;
      const unit = data.units.slice(1);
      const price = data.price;
      const photo = data.fileURL;
      const description = data.description;
      const rating = data.averageRating;
      sellerID = data.userID;

      productContainer.querySelector("#product-photo").src = photo;
      productContainer.querySelector("#price").innerText = `\$${price}${unit}`;
      productContainer.querySelector("#product-name").innerText = name;
      productContainer.querySelector("#product-desc").innerText = description;
      setRating(rating);

      getCurrentUser().then((user) => {
        if (user.uid == sellerID) {
          productContainer.querySelector("#edit-post").style.display = "";
        } else {
          productContainer.querySelector(".review-btn").style.display = "";
        }
      });
    });
}

var currentRating;
function setRating(rating) {
  currentRating = rating;
  stars.forEach((star) => (star.style.color = ""));
  for (let i = 1; i <= rating; ++i) {
    productContainer.querySelector(`.star${i}`).innerText = "star";
  }
  const nextStar = productContainer.querySelector(`.star${Math.ceil(rating)}`);
  if (rating % 1 > 0.75) {
    nextStar.innerText = "star";
  } else if (rating % 1 > 0.25) {
    nextStar.innerText = "star_half";
  }
}

function retrieveSellerData() {
  return db
    .collection("users")
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

  getCurrentUser().then((user) => {
    addContact(user.uid, sellerID).then(() =>
      location.assign(`messages.html?to=${sellerID}`)
    );
  });
});

reviewBtn.onclick = function () {
  if (isReviewing) {
    isReviewing = false;
    reviewBtn.innerText = "Review";
    let rating = 0;
    stars.forEach((star) => {
      if (star.textContent === "star") {
        rating++;
      }
    });
    if (rating > 0) {
      postRating(rating)
        .then(getAverageRating)
        .then(postAverageRating)
        .then(setRating);
    } else {
      setRating(currentRating);
    }
  } else {
    isReviewing = true;
    reviewBtn.innerText = "Cancel";
    stars.forEach((star) => {
      star.innerText = "star_outline";
      star.style.color = "#e5e5e5";
    });
  }
};

function editPost() {
  const params = new URL(window.location.href);
  const id = params.searchParams.get("id");
  window.location.assign(`listing_info.html?edit=${id}`);
}

const stars = productContainer.querySelectorAll(".star");
stars.forEach(
  (star, index) =>
    (star.onclick = () => {
      if (!isReviewing) return;
      reviewBtn.innerText = "Submit";
      for (let i = 0; i <= index; i++) {
        stars[i].innerText = "star";
      }
      for (let i = index + 1; i < 5; i++) {
        stars[i].innerText = "star_outline";
      }
    })
);

function postRating(rating) {
  return getCurrentUser().then((user) => {
    const data = {};
    data[`ratings.${user.uid}`] = rating;
    db.collection("listings").doc(listingID).update(data);
  });
}

function getAverageRating() {
  return db
    .collection("listings")
    .doc(listingID)
    .get()
    .then((doc) => sum(Object.values(doc.data().ratings)));
}

function postAverageRating(rating) {
  return db
    .collection("listings")
    .doc(listingID)
    .update({ averageRating: rating })
    .then(() => rating);
}
