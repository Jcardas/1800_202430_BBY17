const contactsContainer = document.getElementById("contacts-go-here");
const messageBar = document.getElementById("message-bar");

var currentUser;
firebase.auth().onAuthStateChanged((user) => {
  // no need to check if user exists,
  // it's impossible for a non-user to access this page in the first place
  currentUser = user;
  populateContactsList(user);
});

function populateContactsList(currentUser) {
  db.collection("user")
    .doc(currentUser.uid)
    .get()
    .then(async (doc) => {
      if (!doc.exist) return;

      const contacts = doc.data().contacts || [];
      for (const contactID of contacts) {
        const avatarURL = await db
          .collection("user")
          .doc(contactID)
          .get()
          .then((doc) => {
            /**
             * @return undefined if user does not exist,
             *         null if user exists and does not have an avatar,
             *         a url if user exists and has an avatar
             */
            if (!doc.exist) return;
            return doc.data().avatar;
          });

        if (avatarURL == undefined) continue;
        avatarURL ||= "/assets/profile_photo.png";

        const contactDiv = document.createElement("div");
        const contactImg = document.createElement("img");

        contactDiv.id = contactID;
        contactDiv.className = "contact";
        contactImg.className = "contact-photo";
        contactImg.src = avatarURL;

        contactDiv.appendChild(contactImg);
        contactsContainer.appendChild(contactDiv);
      }
    });
}
