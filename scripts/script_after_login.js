determineFarmerStatus();

setupSearchButtons();

getExistingProductNames()
  .then(populateSearchSuggestions)
  .then(setupSearchForms);

function setupSearchButtons() {
  for (const searchButton of document.querySelectorAll(".search-icon")) {
    searchButton.onclick = function () {
      const input = searchButton.parentElement.querySelector("input");
      search(input);
    };
  }
}

function determineFarmerStatus() {
  firebase.auth().onAuthStateChanged((user) => {
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (!doc.exists) return;

        if (doc.data().isFarmer) {
          // there may be multiple "make a post" buttons,
          // loop through all of them
          for (const button of document.querySelectorAll(".make-a-post")) {
            button.style.display = "";
          }
        }
      });
  });
}
