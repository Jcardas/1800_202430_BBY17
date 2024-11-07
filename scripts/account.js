const userProfile = document.getElementById("user-profile");
const profilePic = document.getElementById("profile-pic");
const profilePicInput = document.getElementById("profile-pic-input");
const profileText = document.getElementById("profile-pic-prompt");

populateSettings();

userProfile.addEventListener("submit", saveProfile);

profilePic.addEventListener("click", () => profilePicInput.click());
profileText.addEventListener("click", () => profilePicInput.click())

profilePicInput.addEventListener("change", () => {
  const imageURL = URL.createObjectURL(profilePicInput.files[0]);
  profilePic.src = imageURL;
});

function populateSettings() {
  firebase.auth().onAuthStateChanged((user) => {
    document.getElementById("inputName").value = user.displayName;
    document.getElementById("inputEmail").value = user.email;

    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        document.getElementById("inputAddress").value = data.address;
        document.getElementById("inputAddress2").value = data.address2;
        document.getElementById("inputCity").value = data.city;
        document.getElementById("inputZip").value = data.zip;

        if (data.avatar) {
          profilePic.src = data.avatar;
        }
      });
  });
}

function saveProfile(e) {
  e.preventDefault();
  firebase.auth().onAuthStateChanged((user) => {
    const name = document.getElementById("inputName").value;
    const email = document.getElementById("inputEmail").value;
    const address = document.getElementById("inputAddress").value;
    const address2 = document.getElementById("inputAddress2").value;
    const city = document.getElementById("inputCity").value;
    const zip = document.getElementById("inputZip").value;

    /* keep track of promises, so that
     * this page is closed only when all promises have been fullfilled
     */
    const promises = [];

    if (profilePicInput.files.length > 0) {
      const storageref = storage.ref(`profile-pic/${user.uid}.jpg`);
      promises.push(
        storageref
          .put(profilePicInput.files[0])
          .then(() => storageref.getDownloadURL())
          .then((url) =>
            db
              .collection("users")
              .doc(user.uid)
              .set({ avatar: url }, { merge: true })
          )
      );
    }

    promises.push(user.updateEmail(email));

    promises.push(
      db.collection("users").doc(user.uid).set(
        {
          name: name,
          email: email,
          address: address,
          address2: address2,
          city: city,
          zip: zip,
        },
        { merge: true }
      )
    );

    Promise.all(promises).then(closeSettings);
  });
}

function closeSettings() {
  let previousURL = sessionStorage.getItem("previousURL") ?? "/";
  sessionStorage.removeItem("previousURL");

  window.location.assign(previousURL);
}
