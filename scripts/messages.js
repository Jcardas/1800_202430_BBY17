var currentUser;
var senderAvatar;
var recipientAvatar;
var messagePage = document.querySelector(".msg-page");
var messageBottom = document.querySelector(".msg-bottom");

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

var chatDoc;
const recipientForm = document.querySelector("form.username");
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
      data = doc.data();

      // Set recipient profile pic
      if (data.avatar) {
        recipientPfp.src = recipientAvatar = data.avatar;
      }

      // Set recipient user name
      const recipientName = document.createElement("p");
      recipientName.innerText = data.name;
      recipientInput.replaceWith(recipientName);

      // Populate with existing messages (if exist)
      // the chatID might be "<our ID>+<their ID> or <their ID>+<our ID>"
      // (depending on who initiated the chat first)
      // so try both ids to see what work
      messagePage.innerHTML = "";
      chatDoc = db
        .collection("messages")
        .doc(`${recipientID}+${currentUser.uid}`);
      chatDoc.get().then((doc) => {
        if (!doc.exists) {
          chatDoc = db
            .collection("messages")
            .doc(`${currentUser.uid}+${recipientID}`);
          chatDoc.get().then((doc) => {
            if (!doc.exists) {
              return;
            }
            data = doc.data();
            data.messages.map(addMessage);
          });
          return;
        }
        data = doc.data();
        data.messages.map(addMessage);
      });

      // Unhide the text input
      messageBottom.style.display = "";
    });
});

// Select input and send button
const messageInput = document.querySelector(".message-input");
const sendButton = document.querySelector(".send-button");

function sendMessage() {
  const messageText = messageInput.value.trim();
  if (!messageText) return;

  const message = {
    from: currentUser.uid,
    text: messageText,
    timestamp: Date.now(), // not used for now
  };
  chatDoc
    .set(
      {
        messages: firebase.firestore.FieldValue.arrayUnion(message),
      },
      { merge: true }
    )
    .then(() => addMessage(message))
    .catch(console.error);
  messageInput.value = "";
}

function addMessage(message) {
  let type;
  let avatar;
  if (message.from == currentUser.uid) {
    type = "outgoing-message";
    avatar = senderAvatar;
  } else {
    type = "incoming-message";
    avatar = recipientAvatar;
  }
  if (!avatar) {
    avatar = "./assets/profile_photo.png";
  }

  document.querySelector(".msg-page").insertAdjacentHTML(
    "beforeend",
    `
    <div class=${type}>
      <p>${message.text}</p>
      <img
        class="m_userprofile"
        src=${avatar}
        alt="profile-photo"
      />
    </div>`
  );
}

//Functionality for the send button.
sendButton.addEventListener("click", sendMessage);

//Functionality for pressing enter to send a message.
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
