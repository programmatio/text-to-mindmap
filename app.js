// Function to parse the input text and create a tree structure
function parseInputText(inputText) {
    const lines = inputText.split("\n");
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
    const width = 800;
    const height = 600;
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    const g = svg.append("g");
    const treeLayout = d3.tree().size([width, height]);

    // Generate the tree and links
    const tree = treeLayout(d3.hierarchy(treeData));
    const links = tree.links();

    // Draw links
    g.selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Draw nodes
    g.selectAll(".node")
        .data(tree.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .append("circle")
        .attr("r", 4);

    // Add labels
    g.selectAll(".node")
        .append("text")
        .attr("x", d => d.children ? -10 : 10)
        .attr("y", 3)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);
}

// Sample input text
const inputText = `Software Engineering Principles
1.1. Clear Software Architecture
1.1.1. Modular Design
1.1.2. Separation of Concerns
1.1.3. Maintainability`;

const treeData = parseInputText(inputText);
createMindMap(treeData);

// Update the mind map with more text
const moreText = `1.1.1. Clear Software Architecture
1.1.1.1. Definition
1.1.1.1.1. A well-defined, organized structure of software components
1.1.1.1.2. A blueprint for designing, building, and maintaining software systems

1.1.1.2. Benefits
1.1.1.2.1. Improved maintainability
1.1.1.2.2. Enhanced scalability
1.1.1.2.3. Easier understanding and communication
1.1.1.2.4. Streamlined development process`;

// Function to update the mind map with more text
function updateMindMap(inputText) {
// Remove the existing mind map
d3.select("body").select("svg").remove();
// Create a new mind map with the updated input text
const treeData = parseInputText(inputText);
createMindMap(treeData);
}

// Update the mind map with the new text
const updatedText = inputText + "\n" + moreText;
updateMindMap(updatedText);