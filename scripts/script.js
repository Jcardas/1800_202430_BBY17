let userLoaded = false;
/**
 * A shortcut to get the current user.
 *
 * @author https://github.com/atishpatel
 * @link https://github.com/firebase/firebase-js-sdk/issues/462#issuecomment-425479634
 * @return a Promise that resolves to either the current user or null.
 */
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    if (userLoaded) {
      resolve(firebase.auth().currentUser);
    }
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      userLoaded = true;
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

$("#footer-container").load("./skeleton/footer.html");
getCurrentUser().then((user) => {
  if (user) {
    $("#header-container").load("./skeleton/header_after_login.html");
    ifProfileIsNotComplete(
      user,
      () => {
        if (window.location.pathname != "/account.html") {
          sessionStorage.setItem("isNewUser", true);
          gotoURL("/account.html");
        }
      },
      () => {
        if (
          ["/", "/index.html", "/login.html"].includes(window.location.pathname)
        ) {
          gotoURL("/main.html");
        }
        setProfilePic(user);
      }
    );
  } else {
    $("#header-container").load("./skeleton/header_before_login.html");
    if (
      window.location.pathname !== "/login.html" &&
      window.location.pathname !== "/about.html" &&
      window.location.pathname !== "/contact.html"
    ) {
      gotoURL("/index.html");
    }
  }
});

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      gotoURL("/index.html");
    })
    .catch((error) => console.log(error));
}

function gotoURL(url) {
  console.log(window.location.pathname);
  if (window.location.pathname != url) {
    window.location.assign(url);
  }
}

function showAccountSettings() {
  sessionStorage.setItem("previousURL", window.location.href);
  window.location.assign("./account.html");
}

function showBookmarks() {
  sessionStorage.setItem("previousURL", window.location.href);
  window.location.assign("./bookmarks.html");
}

function setProfilePic(user) {
  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (!doc.exists) return;
      data = doc.data();
      if (data.avatar) {
        document.getElementById("avatar").src = data.avatar;
      } else {
        document.getElementById("avatar").src = "./assets/farmer.jpg";
      }
    });
}

function ifProfileIsNotComplete(user, then, otherwise = (i) => i) {
  if (sessionStorage.getItem("isNewUser")) {
    return then();
  }

  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (doc.exists && doc.data().name) {
        otherwise();
      } else {
        then();
      }
    });
}

// Function to hide the loading wheels.
function hideLoadingWheel() {
  for (const loadingWheel of document.querySelectorAll(".loading-wheel")) {
    loadingWheel.style.display = "none";
  }
}

function autocorrect(input, correct_matches) {
  function compareTo(other) {
    return (
      levenshtein(other, input.value) /
      Math.max(other.length, input.value.length)
    );
  }

  input.value = input.value.trim();
  if (correct_matches.has(input.value)) return true;

  let products = [...correct_matches];
  let chosenProduct = products[0];
  let minDistance = compareTo(chosenProduct);
  for (let i = 1; i < products.length; ++i) {
    let product = products[i];
    let distance = compareTo(product);
    if (distance < minDistance) {
      chosenProduct = product;
      minDistance = distance;
    }
  }

  const MATCH_THRESHOLD = 0.5;
  const MAYBE_THRESHOLD = 0.75;

  if (minDistance <= MATCH_THRESHOLD) {
    input.value = chosenProduct;
    return true;
  }
  if (
    minDistance <= MAYBE_THRESHOLD &&
    confirm(`Did you mean ${chosenProduct}?`)
  ) {
    input.value = chosenProduct;
    return true;
  }
  alert("Invalid product name.");
}

function sum(array) {
  return array.reduce((a, b) => a + b, 0);
}
