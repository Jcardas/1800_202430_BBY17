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
  if (authResult.additionalUserInfo.isNewUser) {
    sessionStorage.setItem("isNewUser", true);
    window.location.assign("account.html");
  } else {
    window.location.assign("main.html");
  }
}
