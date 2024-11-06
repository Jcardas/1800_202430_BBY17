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

function setProfilePic(user) {
  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => doc.data())
    .then((data) => {
      if (data.avatar) {
        document.getElementById("avatar").src = data.avatar;
      } else {
        document.getElementById("avatar").src = "./assets/farmer.jpg";
      }
    });
}
