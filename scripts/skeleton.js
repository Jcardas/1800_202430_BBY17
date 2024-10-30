$("#footer-container").load("./skeleton/footer.html");

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    $("#header-container").load("./skeleton/header_after_login.html");
  } else {
    $("#header-container").load("./skeleton/header_before_login.html");
  }
});
