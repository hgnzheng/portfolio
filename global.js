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
  { url: 'https://github.com/hgnzheng', title: 'Profile' } // External link
];

// Determine the root path dynamically
const ROOT_PATH = location.hostname === 'hgnzheng.github.io' ? '/portfolio/' : '/';

// Adjust URLs for internal links
pages = pages.map(page => {
  if (page.url && !page.url.startsWith('http') && !page.url.startsWith(ROOT_PATH)) {
    // Prepend ROOT_PATH only if not already included
    return { ...page, url: `${ROOT_PATH}${page.url}` };
  }
  return page; // Leave external links and already-adjusted links unchanged
});

// Create the navigation menu
const nav = document.createElement('nav');
document.body.prepend(nav);

// Add links to the navigation menu
pages.forEach(page => {
  const a = document.createElement('a');
  a.href = page.url;
  a.textContent = page.title;

  // Highlight the current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  if (page.url.startsWith('http')) {
    a.target = '_blank';
  }

  // Add the link to the navigation menu
  nav.append(a);
});


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