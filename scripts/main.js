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

displayCardsDynamically("products"); //input param is the name of the collection

function displayCardsDynamically(collection) {
  let cardTemplate = document.getElementById("productCardTemplate"); // Retrieve the HTML element with the ID "productCardTemplate" and store it in the cardTemplate variable.

  db.collection(collection)
    .get() //the collection called "products"
    .then((allProducts) => {
      //var i = 1;  //Optional: if you want to have a unique ID for each product
      allProducts.forEach((doc) => {
        //iterate through each doc
        var productType = doc.data().product_type; // get value of the "product_type" key
        var price = doc.data().price; // get the price.
        var pricePerUnit = doc.data().unit; // get value of the "unit" key
        var productPhoto = doc.data().product_photo;
        var productFarmerName = doc.data().farmer;

        var productProfileIcon = doc.data().productPhoto; // TEMPORARY --------------

        let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.
        // var docID = doc.id;

        //update title and text and image
        newcard.querySelector(".card-title").innerHTML =
          "$" + price + " | " + productType;
        newcard.querySelector(".card-text").innerHTML = pricePerUnit;
        newcard.querySelector(".product-profile-icon").innerHTML =
          productProfileIcon;
        newcard.querySelector(".product-farmer-name").innerHTML =
          productFarmerName;
        newcard.querySelector(".card-img").src = productPhoto;
        // newcard.querySelector("a").href = "eachProduct.html?docID=" + docID;

        document.getElementById(collection + "-go-here").appendChild(newcard);
      });
    });
}

// Temporary function to write 10 listings to the firebase
function writeProducts() {
  //define a variable for the collection you want to create in Firestore to populate data
  var productsRef = db.collection("products");

  productsRef.add({
    farmer: "Farmer Joe",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo",
    product_type: "Carrots",
    price: 10,
    unit: "$ / lbs",
    description: "This is the description for the carrots!",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "Farmer Jane",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo2",
    product_type: "Tomatoes",
    price: 8,
    unit: "$ / lbs",
    description: "Fresh and ripe tomatoes straight from the farm!",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "Old MacDonald",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo3",
    product_type: "Apples",
    price: 5,
    unit: "$ / lbs",
    description: "Crisp and sweet apples perfect for snacking or baking.",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "Farmer Lily",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo4",
    product_type: "Potatoes",
    price: 3,
    unit: "$ / lbs",
    description: "Organic potatoes, ideal for mashed potatoes and fries.",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "Greenfield Farms",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo5",
    product_type: "Lettuce",
    price: 2,
    unit: "$ / Unit",
    description: "Fresh, crunchy lettuce, perfect for salads and sandwiches.",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "Sunny Meadows",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo6",
    product_type: "Blueberries",
    price: 12,
    unit: "$ / pint",
    description: "Juicy and sweet blueberries for your breakfast or dessert.",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "Farmer Bob",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo7",
    product_type: "Sweet Corn",
    price: 1.5,
    unit: "$ / ear",
    description: "Golden sweet corn, perfect for grilling or boiling.",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "Harvest Hill",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo8",
    product_type: "Pumpkins",
    price: 15,
    unit: "$ / Unit",
    description: "Large pumpkins, perfect for pies or Halloween carving.",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "The Berry Patch",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo9",
    product_type: "Strawberries",
    price: 7,
    unit: "$ / basket",
    description: "Freshly picked, juicy strawberries ready for your table.",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });

  productsRef.add({
    farmer: "Farmer Bill",
    listing_type: "produce",
    product_photo: "https://urlname.website/location_of_photo10",
    product_type: "Zucchini",
    price: 4,
    unit: "$ / lbs",
    description: "Homegrown zucchini, great for grilling or adding to recipes.",
    time_posted: firebase.firestore.FieldValue.serverTimestamp(),
  });
}
