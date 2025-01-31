import { fetchJSON, renderProjects } from '../global.js';

// const projects = await fetchJSON('../lib/projects.json');

// const projectsContainer = document.querySelector('.projects');

// renderProjects(projects, projectsContainer, 'h2');

// Enhanced handling to display projects
document.addEventListener('DOMContentLoaded', async () => {
    const projectsContainer = document.querySelector('.projects');

    if (projectsContainer) {
        const projects = await fetchJSON("../lib/projects.json");
        renderProjects(projects, projectsContainer, 'h2');
    }
})