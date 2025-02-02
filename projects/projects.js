import { fetchJSON, renderProjects } from '../global.js';

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function updatePieChart(filteredProjects) {
    // Group filtered projects by year
    let rolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);

    // Clear previous paths and legend
    d3.select("#pie-chart").selectAll("path").remove();
    d3.select(".legend").html("");

    // Append updated slices
    let svg = d3.select("#pie-chart");
    arcData.forEach((d, idx) => {
    svg.append("path")
        .attr("d", arcGenerator(d))
        .attr("fill", colors(idx));
    });

    // Update legend dynamically
    let legend = d3.select(".legend");
    data.forEach((d, idx) => {
    legend.append("li")
        .attr("style", `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
};


// document.addEventListener('DOMContentLoaded', async () => {
//     const projectsContainer = document.querySelector(".projects");
//     const searchInput = document.querySelector(".searchBar");

//     // Fetch projects
//     let projects = await fetchJSON("../lib/projects.json");
//     let query = "";

//     function setQuery(newQuery) {
//         query = newQuery.toLowerCase(); // Case-insensitive search
//         return projects.filter((project) => {
//             let values = Object.values(project).join("\n").toLowerCase();
//             return values.includes(query);
//         });
//     }

//     searchInput.addEventListener("input", (event) => {
//         let filteredProjects = setQuery(event.target.value);
//         renderProjects(filteredProjects, projectsContainer, "h2");
//         updatePieChart(filteredProjects);
//     });

//     renderProjects(projects, projectsContainer, "h2");
//     updatePieChart(projects);
// })

document.addEventListener("DOMContentLoaded", async () => {
    // Fetch projects data
    let projects = await fetchJSON("../lib/projects.json");

    // Group projects by year and count them
    let rolledData = d3.rollups(
        projects,
        (v) => v.length,
        (d) => d.year
    );

    // Convert to the format needed for the pie chart
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    // Set up D3 scales and generators
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);

    // Clear any previous content in the SVG before appending new paths
    d3.select("#pie-chart").selectAll("*").remove();

    // Append paths to the SVG
    let svg = d3.select("#pie-chart");
    arcData.forEach((d, idx) => {
    svg.append("path")
        .attr("d", arcGenerator(d))
        .attr("fill", colors(idx));
    });

    // Clear and update legend
    let legend = d3.select(".legend").html("");

    data.forEach((d, idx) => {
    legend.append("li")
        .attr("style", `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const projectsContainer = document.querySelector(".projects");
    const searchInput = document.querySelector(".searchBar");

    let projects = await fetchJSON("../lib/projects.json");
    let query = "";
    let selectedIndex = -1;

    function setQuery(newQuery) {
        query = newQuery.toLowerCase();
        return projects.filter((project) => {
            let values = Object.values(project).join("\n").toLowerCase();
            return values.includes(query);
        });
    }

    function recalculate(projectsGiven) {
        let newRolledData = d3.rollups(
            projectsGiven,
            (v) => v.length,
            (d) => d.year
        );

        return newRolledData.map(([year, count]) => {
            return { value: count, label: year };
        });
    }

    function embedArcClick(arcsGiven, projectsGiven, dataGiven) {
        const svgNS = "http://www.w3.org/2000/svg";
        d3.select("#pie-chart").selectAll("path").remove();

        for (let i = 0; i < arcsGiven.length; i++) {
            let path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", arcsGiven[i]);
            path.setAttribute("fill", colors(i));

            path.addEventListener("click", () => {
            selectedIndex = selectedIndex === i ? -1 : i;

            document.querySelectorAll("path").forEach((p, idx) => {
                if (idx === selectedIndex) {
                p.classList.add("selected");
                } else {
                p.classList.remove("selected");
                }
            });

            if (selectedIndex !== -1) {
                // retrieve the selected year
                let selectedYear = dataGiven[selectedIndex].label;
                // filter projects by the selected year
                let filteredProjects = projectsGiven.filter((p) => p.year === selectedYear);
                // render filtered projects
                renderProjects(filteredProjects, projectsContainer, "h2");
            } else {
                // render projects directly
                renderProjects(projects, projectsContainer, "h2");
            }
            // update the legend
            updateLegend(dataGiven, selectedIndex);
            });
            d3.select("#pie-chart").node().appendChild(path);
        }
    }

    function updateLegend(data, highlightedIndex) {
        // Clear the old legend
        let legend = d3.select(".legend").html("");

        if (highlightedIndex !== -1) {
          // Show only the selected legend
          let selectedData = data[highlightedIndex];
          legend.append("li")
            .attr("class", "highlighted")
            .attr("style", `--color: #d0457c; font-weight: bold;`)
            .html(`<span class="swatch"></span> ${selectedData.label} <em>(${selectedData.value})</em>`);
        } else {
            // Show all legends again when nothing is selected
            data.forEach((d, idx) => {
                legend.append("li")
                .attr("style", `--color:${colors(idx)}`)
                .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
            });
        }
    }
    
    searchInput.addEventListener("input", (event) => {
        let filteredProjects = setQuery(event.target.value);
        renderProjects(filteredProjects, projectsContainer, "h2");
        // Recalculate data
        let newData = recalculate(filteredProjects);
        let newSliceGenerator = d3.pie().value((d) => d.value);
        let newArcData = newSliceGenerator(newData);
        let newArcs = newArcData.map((d) => arcGenerator(d));

        // Update the pie chart
        embedArcClick(newArcs, filteredProjects, newData);
        updateLegend(newData, selectedIndex);
    });

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let data = recalculate(projects);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    
    embedArcClick(arcs, projects, data);
    updateLegend(data, selectedIndex);
    // Ensure all projects are displayed initially
    renderProjects(projects, projectsContainer, "h2");
});