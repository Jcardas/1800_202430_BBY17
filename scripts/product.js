const product = document.getElementById("product-content-container");

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

db.collection("products")
  .doc(id)
  .get()
  .then((doc) => {
    const data = doc.data();
    const type = data.product_type;
    const price = data.price;
    const photo = data.product_photo;
    const farmername = data.farmer;
    const description = data.description;

    product.querySelector("#product-photo").src = photo;
    product.querySelector("#price").innerText = price;
    product.querySelector("#product-type").innerText = type;
    // product.querySelector(".product-profile-icon").src;
    product.querySelector(".product-farmer-name").innerText = farmername;
    product.querySelector("#product-desc").innerText = description;
  });
