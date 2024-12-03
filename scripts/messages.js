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
  initializeMessages().then(hideLoadingWheel).then(openCurrentChat);
});

var readMessages = [];
if (localStorage.getItem("read-messages")) {
  readMessages = JSON.parse(localStorage.getItem("read-messages"));
}
var chats = {};

function initializeMessages() {
  return db
    .collection("users")
    .doc(currentUser.uid)
    .get()
    .then((doc) => {
      if (!doc.exists) return;

      const contacts = doc.data().contacts || [];

      const promises = [];
      for (const contactID of contacts) {
        promises.push(
          db
            .collection("users")
            .doc(contactID)
            .get()
            .then((doc) => doc.data()?.avatar || "/assets/profile_photo.png")
            .then((avatarURL) => {
              const notification = document.createElement("span");
              const contactImg = document.createElement("img");
              const contactDiv = document.createElement("div");

              notification.className = "notification";
              contactImg.className = "contact-photo";
              contactImg.src = avatarURL;
              contactDiv.id = contactID;
              contactDiv.className = "contact";
              contactDiv.onclick = function () {
                openChat(contactID);
              };

              contactDiv.appendChild(contactImg);
              contactDiv.appendChild(notification);
              contactsContainer.appendChild(contactDiv);

              return getChat(contactID);
            })
        );
      }

      return Promise.all(promises);
    });
}

function openCurrentChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentRecipientID = urlParams.get("to");
  if (currentRecipientID) {
    openChat(currentRecipientID);
  }
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
  document
    .getElementById(recipientID)
    .querySelector(".notification").innerText = "";

  getChat(recipientID).then((chat) => {
    for (const msg of chat.messages) {
      readMessages.push(msg.timestamp);
    }
    localStorage.setItem("read-messages", JSON.stringify(readMessages));

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
    chat.page.scrollTop = chat.page.scrollHeight;
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
  chat.contact = document.getElementById(recipientID);

  chat.send = function () {
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    messageInput.value = "";

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
        this.messages.push(message);
        // do not call chat.render(), it's called by chat.onSnapshot() when the server updates
      })
      .catch(() => {
        alert("There's an error sending your message.");
        messageInput.value = messageText;
      });
  };

  chat.render = function (message) {
    if (this.page.querySelector(`#T${message.timestamp}`)) return;

    let messageType;
    if (message.from == currentUser.uid) {
      messageType = "outgoing-message";
    } else {
      messageType = "incoming-message";
    }

    // notification
    if (messageType == "incoming-message") {
      if (chat.contact.hasAttribute("selected")) {
        readMessages.push(message.timestamp);
        localStorage.setItem("read-messages", JSON.stringify(readMessages));
      } else if (!readMessages.includes(parseInt(message.timestamp))) {
        const notification = chat.contact.querySelector(".notification");
        if (notification.innerText.length == 0) {
          notification.innerText = 1;
        } else {
          notification.innerText = 1 + parseInt(notification.innerText);
        }
        // move contact to first
        chat.contact.remove();
        contactsContainer.prepend(chat.contact);
      }
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
