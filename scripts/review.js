var listingDocID = localStorage.getItem("listingDocID");

function getListingName(id) {
  db.collection("listings")
    .doc(id)
    .get()
    .then((thisListing) => {
      var listingName = thisListing.data().name;
      document.getElementById("listingName").innerHTML = listingName;
    });
}

getListingName(listingDocID);

const stars = document.querySelectorAll(".star");
stars.forEach((star, index) => {
  star.onmouseover = () => rate(index + 1);
  star.onclick = () => rate(index + 1);
});

function rate(rating) {
  for (let i = 1; i <= rating; i++) {
    document.getElementById(`star${i}`).textContent = "star";
  }
  for (let i = rating + 1; i <= 5; i++) {
    document.getElementById(`star${i}`).textContent = "star_outline";
  }
}

function writeReview() {
  let rating = 0;
  stars.forEach((star) => {
    if (star.textContent === "star") {
      rating++;
    }
  });

  postRating(rating)
    .then(getAverageRating)
    .then(postAverageRating)
    .then(() => {
      alert("Review has been posted");
      window.location.assign(`each_product.html?id=${listingDocID}`);
    });
}

function postRating(rating) {
  return getCurrentUser().then((user) => {
    const data = {};
    data[`ratings.${user.uid}`] = rating;
    db.collection("listings").doc(listingDocID).update(data);
  });
}

function getAverageRating() {
  return db
    .collection("listings")
    .doc(listingDocID)
    .get()
    .then((doc) => sum(Object.values(doc.data().ratings)));
}

function postAverageRating(rating) {
  return db
    .collection("listings")
    .doc(listingDocID)
    .update({ averageRating: rating });
}
