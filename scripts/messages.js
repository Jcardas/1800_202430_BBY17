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
      const userData = doc.data();

      // Set recipient profile pic
      if (userData.avatar) {
        recipientPfp.src = recipientAvatar = userData.avatar;
      }

      // Set recipient user name
      const recipientName = document.createElement("p");
      recipientName.innerText = userData.name;
      recipientInput.replaceWith(recipientName);

      // chat id is "<our ID>+<their ID>"" or "<their ID + ourID>", in lexicographical order
      if (recipientID < currentUser.uid) {
        chatDoc = db
          .collection("messages")
          .doc(`${recipientID}+${currentUser.uid}`);
        console.log("here");
      } else {
        chatDoc = db
          .collection("messages")
          .doc(`${currentUser.uid}+${recipientID}`);
        console.log("there");
      }

      // populate existing messages
      chatDoc.get().then((doc) => {
        if (!doc.exists) return;
        const chatData = doc.data();
        chatData.messages.map(addMessageToPage);
      });

      // listen to the database for changes and add the last message to page
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

// Select input and send button
const messageInput = document.querySelector(".message-input");
const sendButton = document.querySelector(".send-button");

function sendMessage() {
  const messageText = messageInput.value.trim();
  if (!messageText) return;

  const message = {
    from: currentUser.uid,
    text: messageText,
    timestamp: Date.now(), // not displayed in the UI (yet), but is used as id for message element
  };
  chatDoc
    .set(
      {
        messages: firebase.firestore.FieldValue.arrayUnion(message),
      },
      { merge: true }
    )
    .catch(console.error);
  messageInput.value = "";
}

function addMessageToPage(message) {
  if (document.getElementById(message.timestamp)) {
    return;
  }

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
    <div id=${message.timestamp} class=${type}>
      <p>${message.text}</p>
      <img
        class="m_userprofile"
        src=${avatar}
        alt="profile-photo"
      />
    </div>`
  );

  // scroll to end
  messagePage.scrollTop = messagePage.scrollHeight;
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
