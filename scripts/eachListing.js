// This code is non-funcational so far.

function displayCardsDynamically(collection) {
  let cardTemplate = document.getElementById("productCardTemplate"); // Retrieve the HTML element with the ID "productCardTemplate" and store it in the cardTemplate variable.

  db.collection(collection)
    .get() //the collection called "products"
    .then((allProducts) => {
      //var i = 1;  //Optional: if you want to have a unique ID for each product
      allProducts.forEach((doc) => {
        //iterate through each doc
        var title = doc.data().name; // get value of the "name" key
        var details = doc.data().details; // get value of the "details" key
        var productCode = doc.data().code; //get unique ID to each Product to be used for fetching right image
        var productLength = doc.data().length; //gets the length field
        let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.
        var docID = doc.id;

        //update title and text and image
        newcard.querySelector(".card-title").innerHTML = title;
        newcard.querySelector(".card-length").innerHTML = productLength + "km";
        newcard.querySelector(".card-text").innerHTML = details;
        newcard.querySelector(".card-image").src =
          `./images/${productCode}.jpg`; //Example: NV01.jpg
        newcard.querySelector("a").href = "eachProduct.html?docID=" + docID;

        document.getElementById(collection + "-go-here").appendChild(newcard);
      });
    });
}

displayCardsDynamically("products"); //input param is the name of the collection
