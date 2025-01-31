import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

// Enhanced handling to display projects
document.addEventListener('DOMContentLoaded', async () => {
    const projectsContainer = document.querySelector('.projects');

    if (projectsContainer) {
        const projects = await fetchJSON('../lib/projects.json');
        // Get the latest 3 projects
        const latestProjects = projects.slice(0, 3);
        // Render using h2 as the heading level
        renderProjects(latestProjects, projectsContainer, 'h2');
    }
});

// Enhanced handling to display GitHub data
// document.addEventListener("DOMContentLoaded", async () => {
//     const username = "hgnzheng";
//     const profileStats = document.querySelector("#profile-stats");

//     if (profileStats) {
//         const githubData = await fetchGitHubData(username);
//         if (githubData) {
//             profileStats.innerHTML = `
//             <h2>GitHub Profile Stats</h2>
//             <dl class="profile-grid">
//                 <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
//                 <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
//                 <dt>Followers:</dt><dd>${githubData.followers}</dd>
//                 <dt>Following:</dt><dd>${githubData.following}</dd>
//             </dl>
//             `;
//         } else {
//             profileStats.innerHTML = `<p>Failed to load GitHub data.</p>`;
//         }
//     }
// });

// Modified version my custom style.
document.addEventListener("DOMContentLoaded", async () => {
    const username = "hgnzheng";
    const githubData = await fetchGitHubData(username);

    if (githubData) {
        document.getElementById("followers").textContent = githubData.followers;
        document.getElementById("following").textContent = githubData.following;
        document.getElementById("public-repos").textContent = githubData.public_repos;
        document.getElementById("public-gists").textContent = githubData.public_gists;
    }
});


