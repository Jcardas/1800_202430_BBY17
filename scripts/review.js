var listingDocID = localStorage.getItem("listingDocID");
console.log("Retrieved listing ID:", listingDocID);

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

const stars = document.querySelectorAll('.star');


stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        for (let i = 0; i <= index; i++) {
            document.getElementById(`star${i + 1}`).textContent = 'star';
        }
    });
});

function writeReview() {
    console.log("inside write review");
    let listingTitle = document.getElementById("review-title").value;
    let listingDescription = document.getElementById("review-description").value;
    let fresh = document.querySelector('input[name="fresh"]:checked').value;

    const stars = document.querySelectorAll('.star');
    let listingRating = 0;
    stars.forEach((star) => {
        if (star.textContent === 'star') {
            listingRating++;
        }
    });

    console.log(listingTitle, listingDescription, fresh, listingRating);

    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        db.collection("reviews").add({
            listingDocID: listingDocID,
            userID: userID,
            title: listingTitle,
            description: listingDescription,
            fresh: fresh,
            rating: listingRating,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            window.location.href = "thanks.html";
        });
    } else {
        console.log("No user is signed in");
        window.location.href = 'review.html';
    }
}