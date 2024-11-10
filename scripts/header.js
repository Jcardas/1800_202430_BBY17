var currentPage = window.location.pathname
currentPage = currentPage.replace('/', '').replace('.html', '');

console.log(currentPage)

var selectedTab = document.getElementById(currentPage);
if (selectedTab)
{
  console.log(selectedTab)

  selectedTab.classList.add("selected-tab")
}


const f = document.getElementById('searchbar-form');
const q = document.getElementById('navbar-searchbar');
const google = 'https://www.google.com/search?q=';

function submitted(event) {
  event.preventDefault();
  const url = google + q.value;
  const win = window.open(url, '_blank');
  win.focus();
}

f.addEventListener('submit', submitted);