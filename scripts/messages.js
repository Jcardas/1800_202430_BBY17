const chatHeader = document.getElementById("chat-header");
const contactsContainer = document.getElementById("contacts-go-here");
const messageBar = document.getElementById("message-bar");
const messageInput = messageBar.querySelector("input");
const sendButton = messageBar.querySelector("button");

var currentUser;
const chats = {};

getCurrentUser()
  .then((user) => (currentUser = user))
  .then(initializeMessages)
  .then(hideLoadingWheel)
  .then(openCurrentChat);

function initializeMessages() {
  const userDoc = db.collection("users").doc(currentUser.uid);
  return userDoc
    .get()
    .then((doc) => updateContactsContainer(doc.data()?.contacts ?? {}))
    .then(() => {
      userDoc.onSnapshot((doc) =>
        updateContactsContainer(doc.data()?.contacts ?? {})
      );
    });
}

function updateContactsContainer(contacts) {
  const promises = [];
  for (const contactId in contacts) {
    promises.push(renderContact(contactId));
  }
  return Promise.all(promises);
}

function renderContact(contactId) {
  if (document.getElementById(contactId)) {
    return Promise.resolve(null);
  }

  return db
    .collection("users")
    .doc(contactId)
    .get()
    .then((doc) => doc.data()?.avatar || "/assets/profile_photo.png")
    .then((avatarURL) => {
      const notification = document.createElement("span");
      const contactImg = document.createElement("img");
      const contactDiv = document.createElement("div");

      notification.className = "notification";
      contactImg.className = "contact-photo";
      contactImg.src = avatarURL;
      contactDiv.id = contactId;
      contactDiv.className = "contact";
      contactDiv.onclick = function () {
        openChat(contactId);
      };

      contactDiv.appendChild(contactImg);
      contactDiv.appendChild(notification);
      contactsContainer.appendChild(contactDiv);

      return getChat(contactId);
    });
}

function openCurrentChat() {
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
    // mark the last message as read
    const incomingMessages = chat.messages.filter(
      (message) => message.from != currentUser.uid
    );
    if (incomingMessages.length > 0) {
      markMessageAsRead(incomingMessages[incomingMessages.length - 1]);
    }

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

  const chat = db.collection("messages").doc(getChatID(recipientID));
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

    // add us to their contact
    // the function has a built-in check whether we're already added
    addContact(recipientID, currentUser.uid);

    this.set(
      { messages: firebase.firestore.FieldValue.arrayUnion(message) },
      { merge: true }
    )
      .then(() => this.messages.push(message))
      .catch((error) => {
        console.log(error);
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
        markMessageAsRead(message);
      } else {
        getLastReadMessage(message.from).then((lastRead) => {
          if (message.timestamp > lastRead) {
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
        });
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

function markMessageAsRead(message) {
  const update = {};
  update[`contacts.${message.from}`] = message.timestamp;
  return db.collection("users").doc(currentUser.uid).update(update);
}
