displayCardsDynamically();
determineFarmerStatus();

function displayCardsDynamically() {
  let cardTemplate = document.getElementById("productCardTemplate");

  db.collection("listings")
    .get()
    .then((allProducts) => {
      allProducts.forEach((doc) => {
        const data = doc.data();
        var type = data.type;
        var unit = data.units;
        var price = data.price;
        var productPhoto = data.fileURL;

        let newcard = cardTemplate.content.cloneNode(true);
        newcard
          .querySelector("a")
          .setAttribute("href", `/each_product.html?id=${doc.id}`);
        newcard.querySelector(".card-title").innerText = `\$${price} | ${type}`;
        newcard.querySelector(".card-text").innerText = unit;
        newcard.querySelector(".card-img").src = productPhoto;

        db.collection("users")
          .doc(data.userID)
          .get()
          .then((doc) => {
            const data = doc.data();
            const avatar = data.avatar || "/assets/profile_photo.png";
            const name = data.name;
            newcard.querySelector(".product-profile-icon").src = avatar;
            newcard.querySelector(".product-farmer-name").innerText = name;
            document.getElementById("products-go-here").appendChild(newcard);
          });
      });
    });
}

function determineFarmerStatus() {
  firebase.auth().onAuthStateChanged((user) => {
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (!doc.exists) return;

        if (doc.data().isFarmer) {
          // currently there is only one "make-a-post" button,
          // but loop through all in case we add more in the future
          // (e.g. one floating in the cards, one in the navbar)
          for (const button of document.querySelectorAll(".make-a-post")) {
            button.style.display = "";
          }
        }
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
