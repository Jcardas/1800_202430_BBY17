const listingForm = document.querySelector(".lisiting-form-info");
const listingFile = document.getElementById("photo-video-input");
const productType  = document.getElementById("productType");
const listingPrice  = document.getElementById("price");
const listingUnits  = document.getElementById("unit");
const listingDescription  = document.getElementById("description");
const submit = document.querySelector("submit");

submit.addEventlistener("click" , (e) => {
    e.preventDefault();
    db.collection('listing-form').doc().set({
        listingFile: listingFile.value,
        productType: productType.value,
        listingPrice: listingPrice.value,
        listingUnits: listingUnits.value,
        listingDescription: listingDescription.value,   
    }).then(() => {
        listingForm.reset();
    })
})
