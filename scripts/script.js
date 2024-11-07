$("#footer-container").load("./skeleton/footer.html");

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    $("#header-container").load("./skeleton/header_after_login.html");
    if (["/", "/index.html"].includes(window.location.pathname)) {
      gotoURL("/main.html");
    }
    setProfilePic(user);
  } else {
    $("#header-container").load("./skeleton/header_before_login.html");
    if (window.location.pathname != "/login.html") {
      gotoURL("/index.html");
    }
  }
});

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("logging out user");
    })
    .catch((error) => {});
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

function showBookmarks()
{
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

// Inserts the user's name from firestore
function insertNameFromFirestore() {
  // Check if the user is logged in:
  firebase.auth().onAuthStateChanged(user => {
      if (user) {
          console.log(user.uid); // Let's know who the logged-in user is by logging their UID
          currentUser = db.collection("users").doc(user.uid); // Go to the Firestore document of the user
          currentUser.get().then(userDoc => {
              // Get the user name
              let userName = userDoc.data().name;
              console.log(userName);
              //$("#name-goes-here").text(userName); // jQuery
              document.getElementById("name-goes-here").innerText = userName;
          })
      } else {
          console.log("No user is logged in."); // Log a message when no user is logged in
      }
  })
}
insertNameFromFirestore();

