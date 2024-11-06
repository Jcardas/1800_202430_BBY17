const userProfile = document.getElementById("user-profile");
const profilePicInput = document.getElementById("profile-pic-input");

populateSettings();

userProfile.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("inputName").value;
  const email = document.getElementById("inputEmail").value;
  const address = document.getElementById("inputAddress").value;
  const address2 = document.getElementById("inputAddress2").value;
  const city = document.getElementById("inputCity").value;
  const zip = document.getElementById("inputZip").value;
  const user = firebase.auth().currentUser;

  user.updateEmail(email);
  db.collection("users")
    .doc(user.uid)
    .set({
      name: name,
      email: email,
      address: address,
      address2: address2,
      city: city,
      zip: zip,
    })
    .then(closeSettings);
});

userProfile
  .getElementsByClassName("profile-pic")[0]
  .addEventListener("click", () => profilePicInput.click());

profilePicInput.addEventListener("change", (e) => {
  const image = profilePicInput.files[0];
  const fileReader = new FileReader();
  fileReader.readAsDataURL(image);
  fileReader.onload = (e) => {
    for (profilePic of document.getElementsByClassName("profile-pic")) {
      profilePic.src = e.target.result;
    }
  };
});

function populateSettings() {
  firebase.auth().onAuthStateChanged((user) => {
    document.getElementById("inputName").value = user.displayName;
    document.getElementById("inputEmail").value = user.email;

    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        const data = doc.data();
        document.getElementById("inputAddress").value = data.address;
        document.getElementById("inputAddress2").value = data.address2;
        document.getElementById("inputCity").value = data.city;
        document.getElementById("inputZip").value = data.zip;
      });
  });
}

function closeSettings() {
  let previousURL = sessionStorage.getItem("previousURL") ?? "/";
  sessionStorage.removeItem("previousURL");

  window.location.assign(previousURL);
}
