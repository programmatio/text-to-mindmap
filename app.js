// Function to parse the input text and create a tree structure
// Function to parse the input text and create a tree structure
function parseInputText(inputText) {
    const lines = inputText.split("\n").filter(line => line.trim() !== "");
    const root = { name: lines[0], children: [] };
    const stack = [root];

    lines.slice(1).forEach(line => {
        const level = line.match(/^\d+(\.\d+)*/g)[0].split(".").length;
        const node = { name: line.replace(/^\d+(\.\d+)*\s*/, ""), children: [] };

        while (stack.length > level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];
        parent.children.push(node);
        stack.push(node);
    });

    return root;
}

// Function to create the mind map using D3.js
function createMindMap(treeData) {
    // Set up SVG and D3.js tree layout
    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "12px")
        .call(d3.zoom().scaleExtent([1, 1]).on("zoom", (event) => {
            g.attr("transform", event.transform);
        }))
        .append("g");
    const g = svg.append("g").attr("transform", "translate(80,40)");
    const treeLayout = d3.tree().nodeSize([100, 200]);


    // Generate the tree and links
    const tree = treeLayout(d3.hierarchy(treeData));
    const links = tree.links();

    // Draw links
    g.selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Draw nodes
    const nodes = g.selectAll(".node")
        .data(tree.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    // Add circles
    nodes.append("circle")
        .attr("r", 4)
        .style("fill", "#999");

    // Add labels
    nodes.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -10 : 10)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);
}

// Sample input text




fetch('mindmap.txt')
.then(response => response.text())
.then(inputText => {
    const treeData = parseInputText(inputText);
    createMindMap(treeData);
})
.catch(error => {
    console.error('Error fetching mindmap.txt:', error);
});





window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    d3.select("body").select("svg")
        .attr("width", width)
        .attr("height", height);
});