console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// // Array of all nav links
// let navLinks = $$("nav a");

// // Find the current link in the nav
// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );

// // Add the class 'current' to the current link with error handling
// currentLink?.classList.add('current');


// Handle preview v.s deployment difference
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'cv/', title: 'CV' },
  { url: 'https://github.com/hgnzheng', title: 'Profile' }, // External link
];

// Detect if running on GitHub Pages
const IS_GITHUB_PAGES = location.hostname === 'hgnzheng.github.io';
const BASE_PATH = IS_GITHUB_PAGES ? '/portfolio/' : '';

// Dynamically adjust URLs for internal links
pages = pages.map(page => {
  if (page.url && !page.url.startsWith('http')) {
    // Prepend BASE_PATH to all internal links, including Home
    return { ...page, url: `${BASE_PATH}${page.url}` };
  }
  return page; // Leave external links unchanged
});


// Add navigation menu
let nav = document.createElement('nav');
document.body.prepend(nav);

// Detect if we’re on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Add links to the navigation menu
for (let p of pages) {
  let url = p.url;
  if (!ARE_WE_HOME && !url.startsWith('http')) {
    // Adjust relative URLs for non-home pages
    url = '../' + url;
  }

  // Create the <a> element
  const a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;

  // Highlight the current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = '_blank';
  }

  // Add the <a> element to <nav>
  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

// Function to set the color scheme
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
}

// Get the <select> element
const select = document.querySelector('.color-scheme select');

// Check for a saved preference in localStorage
if ('colorScheme' in localStorage) {
  const savedScheme = localStorage.colorScheme;
  setColorScheme(savedScheme);
  select.value = savedScheme; // Update the dropdown
}

// Add an event listener for changes in the dropdown
select.addEventListener('input', (event) => {
  const newScheme = event.target.value;
  setColorScheme(newScheme);
  localStorage.colorScheme = newScheme; // Save the preference
});

// Update the functionality of Contact Form

// Get the form element
const form = document.querySelector('form');

// Add event listener for the submit event
form?.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent default form submission

  // Create a new FormData object
  const data = new FormData(form);

  // Start building the mailto URL
  let url = `${form.action}?`;

  // Iterate over form fields
  for (let [name, value] of data) {
    url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
    console.log(name, encodeURIComponent(value));
  }


  // Navigate to the mailto URL
  location.href = url;
});