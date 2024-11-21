const chatHeader = document.getElementById("chat-header");
const contactsContainer = document.getElementById("contacts-go-here");
const messagesContainer = document.getElementById("messages-container");
const messageBar = document.getElementById("message-bar");
const messageInput = messageBar.querySelector("input");
const sendButton = messageBar.querySelector("button");

var currentUser;
firebase.auth().onAuthStateChanged((user) => {
  // no need to check if user exists,
  // it's impossible for a non-user to access this page in the first place
  currentUser = user;

  populateContactsList();
  openCurrentChat();
});

function populateContactsList() {
  db.collection("users")
    .doc(currentUser.uid)
    .get()
    .then((doc) => {
      if (!doc.exists) return;

      const contacts = doc.data().contacts || [];
      for (const contactID of contacts) {
        db.collection("users")
          .doc(contactID)
          .get()
          .then((doc) => doc.data()?.avatar || "/assets/profile_photo.png")
          .then((avatarURL) => {
            const contactImg = document.createElement("img");
            const contactDiv = document.createElement("div");

            contactImg.className = "contact-photo";
            contactImg.src = avatarURL;
            contactDiv.id = contactID;
            contactDiv.className = "contact";
            contactDiv.onclick = function () {
              openChat(contactID);
            };

            contactDiv.appendChild(contactImg);
            contactsContainer.appendChild(contactDiv);
          });
      }
    });
}

function openCurrentChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipientID = urlParams.get("to");
  if (recipientID) {
    openChat(recipientID);
  }
}

function openChat(recipientID) {
  db.collection("users")
    .doc(recipientID)
    .get()
    .then((doc) => (chatHeader.innerText = doc.data().name));

  const chatDoc = getChat(recipientID);

  // Clear previous messages
  messagesContainer.innerHTML = "";

  // Populate existing messages
  chatDoc.get().then((doc) => {
    if (!doc.exists) return;
    doc.data().messages.forEach(renderMessage);
  });

  // Listen to new messages
  chatDoc.onSnapshot((doc) => {
    if (!doc.exists) return;
    const messages = doc.data().messages;
    const lastMessage = messages[messages.length - 1];
    renderMessage(lastMessage);
  });

  // Setup message bar
  messageInput.onkeydown = function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      chatDoc.send();
    }
  };
  sendButton.onclick = function () {
    chatDoc.send();
  };
  messageBar.style.display = "";
}

function getChat(recipientID) {
  var chatDoc;
  if (recipientID < currentUser.uid) {
    chatDoc = db
      .collection("messages")
      .doc(`${recipientID}+${currentUser.uid}`);
  } else {
    chatDoc = db
      .collection("messages")
      .doc(`${currentUser.uid}+${recipientID}`);
  }

  chatDoc.send = function () {
    const messageText = messageInput.value.trim();
    if (!messageText) return;

    const message = {
      from: currentUser.uid,
      text: messageText,
      timestamp: Date.now(), // not displayed in the UI (yet)
      // but is used as id for the message element
    };
    this.set(
      { messages: firebase.firestore.FieldValue.arrayUnion(message) },
      { merge: true }
    ).catch(console.error);
    // no need to call addMessageToPage
    // it's called by chatDoc.onSnapshot() when the server updates
    messageInput.value = "";

    db.collection("users")
      .doc(recipientID)
      .update({
        contacts: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
      });
  };

  return chatDoc;
}

function renderMessage(message) {
  // the message timestamp serves as the div's id
  if (document.getElementById(message.timestamp)) return;

  let messageType;
  if (message.from == currentUser.uid) {
    messageType = "outgoing-message";
  } else {
    messageType = "incoming-message";
  }

  messagesContainer.insertAdjacentHTML(
    "beforeend",
    `
    <div id=${message.timestamp} class=${messageType}>
      ${message.text}
    </div>`
  );
  // Scroll to end
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
