insertNameFromFirestore();

function insertNameFromFirestore() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log(`${user.uid} is logged in.`);
      currentUser = db.collection("users").doc(user.uid);
      currentUser.get().then((userDoc) => {
        if (!userDoc.exists) return;
        let userName = userDoc.data().name;
        console.log(userName);
        document.getElementById("name-goes-here").innerText = userName;
      });
    } else {
      console.log("No user is logged in.");
    }
  });
}
