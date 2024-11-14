const messagePage = document.querySelector(".msg-page");
const messageBottom = document.querySelector(".msg-bottom");
const recipientForm = document.querySelector("form.username");
const messageInput = document.querySelector(".message-input");
const sendButton = document.querySelector(".send-button");

var currentUser;
var senderAvatar;
var recipientAvatar;
var chatDoc;

firebase.auth().onAuthStateChanged((user) => {
  currentUser = user;
  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (!doc.exists) return;
      data = doc.data();
      if (data.avatar) {
        senderAvatar = data.avatar;
      }
    });
});

recipientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const recipientInput = recipientForm.querySelector("input");
  const recipientPfp = recipientForm.querySelector("img");

  const recipientID = recipientInput.value.trim();
  db.collection("users")
    .doc(recipientID)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        alert("User ID does not exist");
        return;
      }
      const userData = doc.data();

      // Set recipient profile pic
      if (userData.avatar) {
        recipientPfp.src = recipientAvatar = userData.avatar;
      }

      // Set recipient user name
      const recipientName = document.createElement("p");
      recipientName.innerText = userData.name;
      recipientInput.replaceWith(recipientName);

      // Set chat id, which is "<our ID>+<their ID>" or "<their ID>+<our ID>"
      // depending on whose id comes first lexicographically
      if (recipientID < currentUser.uid) {
        chatDoc = db
          .collection("messages")
          .doc(`${recipientID}+${currentUser.uid}`);
      } else {
        chatDoc = db
          .collection("messages")
          .doc(`${currentUser.uid}+${recipientID}`);
      }

      // Populate existing messages
      chatDoc.get().then((doc) => {
        if (!doc.exists) return;
        const chatData = doc.data();
        chatData.messages.map(addMessageToPage);
      });

      // Listen to the database for changes and add the last message to page
      chatDoc.onSnapshot((doc) => {
        if (!doc.exists) return;

        const chatData = doc.data();
        const latestMessage = chatData.messages[chatData.messages.length - 1];
        addMessageToPage(latestMessage);
      });

      // Unhide the text input
      messageBottom.style.display = "";
    });
});

// Send button
sendButton.addEventListener("click", sendMessage);

// To send by pressing enter
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const messageText = messageInput.value.trim();
  if (!messageText) return;

  const message = {
    from: currentUser.uid,
    text: messageText,
    timestamp: Date.now(), // not displayed in the UI (yet)
    // but is used as id for the message element
  };
  chatDoc
    .set(
      { messages: firebase.firestore.FieldValue.arrayUnion(message) },
      { merge: true }
    )
    .catch(console.error);
  // no need to call addMessageToPage
  // it's called by chatDoc.onSnapshot() when the server updates
  messageInput.value = "";
}

function addMessageToPage(message) {
  // the message timestamp serves as the div's id
  if (document.getElementById(message.timestamp)) return;

  let messageType;
  let avatar;
  if (message.from == currentUser.uid) {
    messageType = "outgoing-message";
    avatar = senderAvatar;
  } else {
    messageType = "incoming-message";
    avatar = recipientAvatar;
  }
  if (!avatar) {
    avatar = "./assets/profile_photo.png";
  }

  document.querySelector(".msg-page").insertAdjacentHTML(
    "beforeend",
    `
    <div id=${message.timestamp} class=${messageType}>
      <p>${message.text}</p>
      <img
        class="m_userprofile"
        src=${avatar}
        alt="profile-photo"
      />
    </div>`
  );
  // Scroll to end
  messagePage.scrollTop = messagePage.scrollHeight;
}
