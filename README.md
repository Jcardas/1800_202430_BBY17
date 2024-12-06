# Farmer's Marketplace

<https://project-2d9ac.web.app/>.

## 1. Project Description

We are developing an online marketplace for farmers to sell excess seeds and crops, and community members to buy fresh produce straight from the farm.

Anyone can buy, but only verified farmers can post. Buyers can search for products by name, and filter/sort by price or review. They can contact sellers via our built-in messenger. Sellers can post and edit/delete their posts.

## 2. Names of Contributors

* Hi, my name is Armaan Brar! I am excited to get this project started.
* Hi, my name is Felix, and I like pistachios!
* Hello, my name is Justin. I am passionate about UI / UX Design and I am excited to empower farmers and their communities.

## 3. Technologies and Resources Used

* HTML, CSS, JavaScript
* Bootstrap (frontend framework)
* Google Material Icon (icon library)
* Firebase:
  * Firestore (NoSQL database)
  * Cloud Storage (image storage)
  * Firebase Hosting (website hosting)

## 4. Complete setup/installion/usage

For user testing, the website is hosted at <https://project-2d9ac.web.app>.

For development, clone this repo and run it using VSCode Live Server. You must also contact our team to be given the Firebase API key, because it's not committed.

You must sign up for an account before being able to do anything. Afterwards, basic features are outlined in [Project Description](#1-project-description).

## 5. Known Bugs and Limitations

There aren't any known bugs, but there are some issues and limitations:

* Horribly inefficient Firestore querying, because we prioritized rapid development over algorithm efficiency. The number of Firestore queries can probably be reduced to 1/5 after optimization.
* Similarly, very inefficient usage of Cloud Storage. Specifically,
  * There should be -- but isn't -- a cache. So we're re-requesting the same images every time the user changes page.
  * There should be -- but isn't -- a limit on user-uploaded file size. So we're paying for it if users upload 4K images.
  * *We're already paying for it. The bill comes to about $1. 🥲*
* Unable to filter by price and review at the same time; you must choose one.
This restriction is from Firebase itself, there's nothing we can do other than moving to a different database.
* In hindsight, there's no reason that users must sign up for an account to be able to view posts. We didn't think of in the early phase of the development; when we realized it, it's already too hard to refactor.

## 6. Features for Future

* When you click on the listing instead of going to a new page blur the background and have the listing pop up as a card.
* Create more options for different seed types and maybe misc items (e.g. honey, jam, wool).
* A system to automatically keep track of inventory, and automatically archive (hidden in the UI but kept in the database) sold out listings.
* Hosting the server on nodejs and running our own SQL database. This would solve issue #2.

## 7. Contents of Folder

```text
 Top level of project folder: 
├── assets              # All selfmade images, online images, and icons
├── scripts             # Folder for all javascript
├── skeleton            # Folder for header and footer
└── styles              # Folder for css

It has the following subfolders and files:                 
├── assets                   # Folder for images
    /corn.jpg                
    /leaf.svg
    /favicon.ico             # Favi icon for website
    /...
├── scripts                  # Folder for scripts
    /account.js              # js files
    /firebase.js
    /header.js
    /...
├── skeleton                 # Folder for header and footer
    /footer.html
    /header_after_login.html
    /header_before_login.html
├── styles                   # Folder for styles
    /dark_mode.css           # Styling for darkmode
    /style.css               # Regular styling
├── .gitignore
└── *.html                   # All html pages on the website
```
