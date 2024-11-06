$("#footer-container").load("./skeleton/footer.html");

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    $("#header-container").load("./skeleton/header_after_login.html");
    if (window.location.pathname == "/index.html") {
      gotoURL("/main.html");
    }
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
