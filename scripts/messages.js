const chatHeader = document.getElementById("chat-header");
const contactsContainer = document.getElementById("contacts-go-here");
const messageBar = document.getElementById("message-bar");
const messageInput = messageBar.querySelector("input");
const sendButton = messageBar.querySelector("button");

var currentUser;
firebase.auth().onAuthStateChanged((user) => {
  // no need to check if user exists,
  // it's impossible for a non-user to access this page in the first place
  currentUser = user;
  initializeMessages();
});
var chats = {};

function initializeMessages() {
  return db
    .collection("users")
    .doc(currentUser.uid)
    .get()
    .then((doc) => {
      if (!doc.exists) return;

      const urlParams = new URLSearchParams(window.location.search);
      const currentRecipientID = urlParams.get("to");
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

            if (currentRecipientID) {
              openChat(currentRecipientID);
              if (contactID == currentRecipientID) {
                contactDiv.setAttribute("selected", true);
              }
            }
          });
      }
    });
}

function openChat(recipientID) {
  db.collection("users")
    .doc(recipientID)
    .get()
    .then((doc) => (chatHeader.innerText = doc.data().name));

  for (const contact of contactsContainer.querySelectorAll(".contact")) {
    contact.removeAttribute("selected");
  }
  document.getElementById(recipientID)?.setAttribute("selected", true);

  getChat(recipientID).then((chat) => {
    document.querySelector(".messages-container").replaceWith(chat.page);
    messageInput.onkeydown = function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        chat.send();
      }
    };
    sendButton.onclick = function () {
      chat.send();
    };
    messageBar.style.display = "";
  });
}

function getChat(recipientID) {
  if (Object.hasOwn(chats, recipientID)) {
    return Promise.resolve(chats[recipientID]);
  }

  var chat;
  if (recipientID < currentUser.uid) {
    chat = db.collection("messages").doc(`${recipientID}+${currentUser.uid}`);
  } else {
    chat = db.collection("messages").doc(`${currentUser.uid}+${recipientID}`);
  }
  chats[recipientID] = chat;

  chat.page = document.querySelector(".messages-container").cloneNode();

  chat.send = function () {
    const messageText = messageInput.value.trim();
    if (!messageText) return;

    const message = {
      from: currentUser.uid,
      text: messageText,
      timestamp: Date.now(), // not displayed in the UI (yet)
      // but is used as id for the message element
    };

    db.collection("users")
      .doc(recipientID)
      .update({
        contacts: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
      });

    this.set(
      { messages: firebase.firestore.FieldValue.arrayUnion(message) },
      { merge: true }
    )
      .then(() => {
        messageInput.value = "";
        this.messages.push(message);
        // do not call chat.render()
        // it's called by chat.onSnapshot() when the server updates
      })
      .catch(console.error);
  };

  chat.render = function (message) {
    if (this.page.querySelector(`#T${message.timestamp}`)) return;

    let messageType;
    if (message.from == currentUser.uid) {
      messageType = "outgoing-message";
    } else {
      messageType = "incoming-message";
    }

    this.page.insertAdjacentHTML(
      "beforeend",
      `
      <div id="T${message.timestamp}" class=${messageType}>
        ${message.text}
      </div>`
    );
    // Scroll to end
    this.page.scrollTop = this.page.scrollHeight;
  };

  return chat.get().then((doc) => {
    chat.messages = doc.data()?.messages || [];
    chat.messages.forEach((message) => chat.render(message));
    chat.onSnapshot((doc) => {
      if (!doc.exists) return;
      const messages = doc.data().messages;
      const lastMessage = messages[messages.length - 1];
      chat.render(lastMessage);
    });
    return chat;
  });
}
