var currentUser;
const newMessages = {};
const notification = document.querySelector("#messages .notification");

getCurrentUser()
  .then((user) => (currentUser = user))
  .then(() => {
    if (window.location.pathname != "/messages.html") {
      initializeNotification();
    }
    if (userIsFarmer()) {
      allowMakingPosts();
    }
  });

setupSearchButtons();

getExistingProductNames()
  .then(populateSearchSuggestions)
  .then(setupSearchForms);

function setupSearchButtons() {
  for (const searchButton of document.querySelectorAll(".search-icon")) {
    searchButton.onclick = function () {
      const input = searchButton.parentElement.querySelector("input");
      search(input);
    };
  }
}

function userIsFarmer() {
  return db
    .collection("users")
    .doc(currentUser?.uid)
    .get()
    .then((doc) => doc?.data()?.isFarmer);
}

function allowMakingPosts() {
  // there may be multiple "make a post" buttons, loop through all of them
  for (const button of document.querySelectorAll(".make-a-post")) {
    button.style.display = "";
  }
}

function addContact(userId, contactId) {
  const user = db.collection("users").doc(userId);

  return user.get().then((doc) => {
    if (!doc.data().contacts?.[contactId]) {
      const update = {};
      update[`contacts.${contactId}`] = 1;
      return user.update(update);
    }
  });
}

function initializeNotification() {
  const userDoc = db.collection("users").doc(currentUser.uid);
  return userDoc
    .get()
    .then((doc) => updateContactsList(doc.data()?.contacts ?? {}))
    .then(() => {
      userDoc.onSnapshot((doc) =>
        updateContactsList(doc.data()?.contacts ?? {})
      );
    });
}

function updateContactsList(contacts) {
  const promises = [];
  for (const contactId in contacts) {
    promises.push(initializeChat(contactId));
  }
  return Promise.all(promises);
}

function getChatID(recipientID) {
  if (recipientID < currentUser.uid) {
    return `${recipientID}+${currentUser.uid}`;
  } else {
    return `${currentUser.uid}+${recipientID}`;
  }
}

function getLastReadMessage(from) {
  return db
    .collection("users")
    .doc(currentUser.uid)
    .get()
    .then((doc) => doc.data().contacts[from]);
}

function initializeChat(contactId) {
  if (Object.hasOwn(newMessages, contactId)) {
    return Promise.resolve(null);
  }

  function updateNewMessages(messages) {
    newMessages[contactId] = 0;
    messages.forEach((message) => {
      if (message.from != currentUser.uid && message.timestamp > lastRead) {
        newMessages[contactId] += 1;
      }
    });
    const total = sum(Object.values(newMessages));
    notification.innerText = total > 0 ? total : "";
  }

  let lastRead;
  return getLastReadMessage(contactId)
    .then((res) => (lastRead = res))
    .then(() => {
      const chat = db.collection("messages").doc(getChatID(contactId));
      return chat.get().then((doc) => {
        updateNewMessages(doc.data()?.messages ?? []);
        chat.onSnapshot((doc) => {
          updateNewMessages(doc.data()?.messages ?? []);
        });
      });
    });
}
