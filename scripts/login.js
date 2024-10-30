var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: getUserProfile,
    uiShown: function () {
      document.getElementById("loader").style.display = "none";
    },
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  signInSuccessUrl: "main.html",
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
};

ui.start("#firebaseui-auth-container", uiConfig);

function getUserProfile(authResult) {
  if (!authResult.additionalUserInfo.isNewUser) {
    window.location.assign("main.html");
    return;
  }

  const userProfile = document.getElementById("user-profile");
  userProfile.style.display = "";

  userProfile.addEventListener("submit", () => {
    const address = document.getElementById("inputAddress").value;
    const address2 = document.getElementById("inputAddress2").value;
    const city = document.getElementById("inputCity").value;
    const zip = document.getElementById("inputZip").value;
    const user = authResult.user;

    db.collection("users")
      .doc(user.uid)
      .set({
        name: user.displayName,
        email: user.email,
        address: address,
        address2: address2,
        city: city,
        zip: zip,
      })
      .then(() => window.location.assign("main.html"));
  });
}
