// Select input and send button
const messageInput = document.querySelector(".message-input");
const sendButton = document.querySelector(".send-button");

// References the database collection for messages.
const messagesRef = db.collection("messages");

function sendMessage() {
  const messageText = messageInput.value.trim();

  // if there is text in the field, append it with the timestamp to the database.
  if (messageText) {
    messagesRef
      .add({
        text: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      //Log the messsage being added in the console.
      .then(() => {
        console.log("Message '" + messageText + "' added to database");
        messageInput.value = "";
      })
      // Catch any errors.
      .catch((error) => {
        console.error("Error adding message: ", error);
      });
  }
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
