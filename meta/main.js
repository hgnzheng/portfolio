// Global variables to store our data and commit summary.
let data = [];
let commits = [];
let xScale, yScale;
let brushSelection = null;

// Load data from loc.csv and convert raw values as needed.
async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: +row.line,                                        // convert 'line' to a number
        depth: +row.depth,                                      // convert 'depth' to a number
        length: +row.length,                                    // convert 'length' to a number
        date: new Date(row.date + 'T00:00' + row.timezone),     // convert 'date' to a Date object
        datetime: new Date(row.datetime),
    }));

    // Uncomment this line during development to inspect the loaded data
    // console.log(data);
    // processCommits();
    // console.log(commits);
    displayStats();
    createScatterplot();
}

function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            // Each 'lines' array contains all lines modified in this commit
            // All lines in a commit have the same author, date, etc.
            // So we can get this information from the first line
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;

            // Create an object with the commit summary
            let ret = {
                id: commit,
                url: 'https://github.com/hgnzheng/portfolio/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                // Calculate fractional hour
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                // Total number of lines modified in this commit
                totalLines: lines.length,
            };
            
            Object.defineProperty(ret, 'lines', {
                value: lines,
                writable: false,
                // Prevents the lines property from showing up in console.log
                enumerable: false,
                configurable: false,
            });

            return ret;
        });
    // Uncomment to check the processed commits data
    // console.log(commits);
}

function displayStats() {
    // Process commits first
    processCommits();

    // Clear existing content before appending new elements
    const statsContainer = d3.select("#stats");
    statsContainer.html(""); // Reset container

    // Create a container for statistics
    const container = statsContainer.append("div")
        .attr("class", "stats-container");

    // Define the statistics to display
    const stats = [
        { label: "COMMITS", value: commits.length },
        { label: "FILES", value: d3.group(data, d => d.file).size },
        { label: "TOTAL LOC", value: data.length },
        { label: "MAX DEPTH", value: d3.max(data, d => d.depth) || 0 },
        { label: "LONGEST LINE", value: d3.max(data, d => d.length) || 0 },
        { label: "MAX LINES", value: d3.max(data, d => d.line) || 0 },
    ];

    // Append each stat dynamically
    container.selectAll(".stat")
        .data(stats)
        .enter()
        .append("div")
        .attr("class", "stat")
        .html(d => `
            <div class="stat-title">${d.label}</div>
            <div class="stat-value">${d.value}</div>
        `);
}

function createScatterplot() {
    const width = 1000;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    // Define usable area inside SVG
    const usableWidth = width - margin.left - margin.right;
    const usableHeight = height - margin.top - margin.bottom;

    // Append an SVG element inside #chart
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales (global variables)
    xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, usableWidth])
        .nice();

    yScale = d3
        .scaleLinear()
        .domain([0, 24])
        .range([usableHeight, 0]);

    // Create a square root scale for the radius
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
        .scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]);

    // Add gridlines before adding the dots
    svg.append("g")
        .attr("class", "gridlines")
        .call(
            d3.axisLeft(yScale)
                .tickSize(-usableWidth)
                .tickFormat("")
        )
        .selectAll("line")
        .attr("stroke", "#ddd")
        .attr("stroke-opacity", 0.5);

    // Color function based on time of day
    function getColor(hour) {
        return hour < 6 || hour >= 18 ? "steelblue" : "orange";
    }

    // Sort commits by total lines in descending order (larger dots first)
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    // Append a group for the dots
    const dotsGroup = svg.append("g").attr("class", "dots");

    // Select and bind data
    const dots = dotsGroup
        .selectAll("circle")
        .data(sortedCommits)
        .join("circle");

    // Apply attributes to the dots
    dots
        .attr("cx", (d) => xScale(d.datetime))
        .attr("cy", (d) => yScale(d.hourFrac))
        .attr("r", (d) => rScale(d.totalLines))
        .attr("fill", (d) => getColor(d.hourFrac))
        .style("fill-opacity", 0.7)
        .classed("commit-dot", true);

    // Add interactivity to dots
    dots
        .on("mouseenter", function (event, d) {
            d3.select(event.currentTarget).style("fill-opacity", 1);
            updateTooltipContent(d);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on("mouseleave", function () {
            d3.select(event.currentTarget).style("fill-opacity", 0.7);
            updateTooltipVisibility(false);
        })
        .on("mousemove", (event) => {
            updateTooltipPosition(event);
        });

    // Add X axis
    const xAxis = d3.axisBottom(xScale).ticks(d3.timeDay.every(2)).tickFormat(d3.timeFormat("%b %d"));
    svg.append("g")
        .attr("transform", `translate(0, ${usableHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle");

    // Add Y axis with properly formatted times
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${String(d % 24).padStart(2, "0")}:00`);
    svg.append("g").call(yAxis);

    // Add brushing functionality
    svg.append("g")
    .attr("class", "brush")
    .call(
        d3.brush()
            .extent([[0, 0], [usableWidth, usableHeight]])
            .on("brush end", brushed)
    );

    // Bring the dots (and any other elements) above the brush overlay.
    dotsGroup.raise();
}

function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}

function isCommitSelected(commit) {
    if (!brushSelection) return false;
    // Destructure the brush selection bounds.
    const [x0, y0] = brushSelection[0];
    const [x1, y1] = brushSelection[1];

    // Map commit data to x and y coordinates.
    const commitX = xScale(commit.datetime);
    const commitY = yScale(commit.hourFrac);

    // Return true if the commit's coordinates are inside the selection rectangle.
    return commitX >= x0 && commitX <= x1 && commitY >= y0 && commitY <= y1;
}

function updateSelection() {
    d3.selectAll("circle")
        .classed("selected", (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];

    const countElement = document.getElementById("selection-count");
    countElement.textContent = `${
        selectedCommits.length || "No"
    } commits selected`;

    return selectedCommits;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];

    const container = document.getElementById("language-breakdown");

    if (selectedCommits.length === 0) {
        container.innerHTML = "";
        return;
    }

    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    // Count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Update the UI
    container.innerHTML = "";
    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format(".1%")(proportion);

        container.innerHTML += `
            <div class="stat-item">
                <dt>${language.toLowerCase()}</dt>
                <dd>${count} lines</dd>
                <dd class="percentage">(${formatted})</dd>
            </div>
        `;
    }
}

// Function to update the tooltip content
function updateTooltipContent(commit) {
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
    const time = document.getElementById("commit-time");
    const author = document.getElementById("commit-author");
    const lines = document.getElementById("commit-lines");

    if (Object.keys(commit).length === 0) {
        link.textContent = "";
        date.textContent = "";
        time.textContent = "";
        author.textContent = "";
        lines.textContent = "";
        return;
    }

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleDateString('en', { dateStyle: 'full' });
    time.textContent = commit.datetime?.toLocaleTimeString('en', { timeStyle: 'short' });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

// Function to update tooltip visibility
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.hidden = !isVisible;
}

// Function to update tooltip position
function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});