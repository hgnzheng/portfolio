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


// Detect if we are running locally or on GitHub Pages
const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const BASE_PATH = IS_LOCAL ? '' : '/portfolio'; // Use '' for local and '/portfolio' for GitHub Pages

// Handle preview vs. deployment difference
let pages = [
  { url: `${BASE_PATH}/`, title: 'Home' },
  { url: `${BASE_PATH}/projects/`, title: 'Projects' },
  { url: `${BASE_PATH}/contact/`, title: 'Contact' },
  { url: `${BASE_PATH}/cv/`, title: 'CV' },
  { url: 'https://github.com/hgnzheng', title: 'Profile' } // External link
];

// Add navigation menu
let nav = document.createElement('nav');
document.body.prepend(nav);

// Detect if we’re on the home page
const ARE_WE_HOME = location.pathname === `${BASE_PATH}/` || location.pathname === `${BASE_PATH}/index.html`;

// Add links to the navigation menu
for (let p of pages) {
  let url = p.url;

  if (!ARE_WE_HOME && !url.startsWith('http')) {
    // For non-home pages, adjust relative URLs for proper navigation
    const currentDir = location.pathname.replace(/\/[^/]*$/, ''); // Remove the last segment of the current path
    url = new URL(url, `${location.origin}${currentDir}/`).href; // Resolve the absolute URL
  }

  // Create the <a> element
  const a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;

  // Add the <a> element to <nav>
  nav.append(a);
}

// Get all nav links
let navLinks = $$("nav a");

// Find the link to the current page
let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

// Add the current class to the current page link
currentLink?.classList.add('current');

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

////////////////////////// Lab 04 //////////////////////////

// Fetch project JSON data
export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    return await response.json();


  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
      return []
  }
}


export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Check if the projects is an array and the container element exists
  if (!Array.isArray(projects) || !containerElement) return;

  // Clear existing static projects
  containerElement.innerHTML = '';


  projects.forEach((project) => {
    const article = document.createElement('article');
    // article.innerHTML = `
    //   <${headingLevel}>${project.title}</${headingLevel}>
    //   <img src="${project.image}" alt="${project.title}">
    //   <p>${project.description}</p>
    // `;

    // Fix relative path issue on the home page
    
    // Adjust image path based on current page location
    const imagePath = location.pathname.includes('/projects/') 
      ? project.image // Keep relative path for projects page
      : project.image.replace('../', ''); // Remove '../' for home page
      
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${imagePath}" alt="${project.title}">
      <p>${project.description}</p>
    `;
    containerElement.appendChild(article);
  })

  // Update project count
  const countElement = document.querySelector('.projects-title');
  if (countElement) {
      countElement.textContent = `Hargen's ${projects.length} Projects`;
  }
}

export async function fetchGitHubData(username) {
  try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
          throw new Error(`GitHub API error: ${response.statusText}`);
      }
      return await response.json();
  } catch (error) {
      console.error('Error fetching GitHub data:', error);
      return null;
  }
}
