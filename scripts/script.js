$("#footer-container").load("./skeleton/footer.html");

firebase.auth().onAuthStateChanged((user) => {
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
        if (["/", "/index.html"].includes(window.location.pathname)) {
          gotoURL("/main.html");
        }
        setProfilePic(user);
      }
    );
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
