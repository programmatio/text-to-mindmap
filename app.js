// Function to parse the input text and create a tree structure
// Function to parse the input text and create a tree structure

function parseInputText(inputText) {
    const lines = inputText.split("\n").filter((line) => line.trim() !== "");
  
    const rootLevelString = lines[0].match(/^\d+(\.\d+)*/g)[0];
    const root = { name: lines[0].replace(/^\d+(\.\d+)*\s*/, ""), children: [] };
    const nodeMap = { [rootLevelString]: root };
  
    lines.slice(1).forEach((line) => {
      const match = line.match(/^\d+(\.\d+)*/g);
  
      // Check if there's a match before proceeding
      if (!match) {
        console.warn(`Line "${line}" does not match the expected pattern.`);
        return;
      }
  
      const levelString = match[0];
      const parentNodeLevelString = levelString
        .split(".")
        .slice(0, -1)
        .join(".");
      const node = { name: line.replace(/^\d+(\.\d+)*\s*/, ""), children: null };
  
      const parent = nodeMap[parentNodeLevelString];
      if (!parent) {
        console.warn(`Parent node not found for line "${line}".`);
        return;
      }
  
      if (!parent._children) {
        parent._children = [];
      }
      parent._children.push(node);
      nodeMap[levelString] = node;
    });
  
    console.log(root);
    return root;
  }
  function sortInputText(inputText) {
    const lines = inputText.split("\n").filter((line) => line.trim() !== "");
    return lines
      .sort((a, b) => {
        const aMatch = a.match(/^\d+(\.\d+)*/g);
        const bMatch = b.match(/^\d+(\.\d+)*/g);
        if (!aMatch || !bMatch) return 0;
        const aNums = aMatch[0].split(".").map((num) => parseInt(num, 10));
        const bNums = bMatch[0].split(".").map((num) => parseInt(num, 10));
        const minLength = Math.min(aNums.length, bNums.length);
        for (let i = 0; i < minLength; i++) {
          if (aNums[i] !== bNums[i]) {
            return aNums[i] - bNums[i];
          }
        }
        return aNums.length - bNums.length;
      })
      .join("\n");
  }
function toggleChildren(node) {
    if (node.children) {
      node.data._children = node.data.children;
    //   node.data.children = null;
    } else {
      node.data.children = node.data._children;
    //   node.data._children = null;
    }
  }

  function collapseSiblings(node) {
    if (!node.parent) return;
  
    node.parent.children.forEach((sibling) => {
      if (sibling !== node) {
        collapse(sibling);
      }
    });
  }
  
  function collapse(node) {
    if (node.children) {
      node._children = node.children;
      node.children = null;
      node._children.forEach(collapse);
    }
  }
// Function to create the mind map using D3.js
function createMindMap(treeData) {
    // Set up SVG and D3.js tree layout
    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "12px")
      .call(
        d3
          .zoom()
          .scaleExtent([1, 1])
          .on("zoom", (event) => {
            g.attr("transform", event.transform);
          })
      );
    const g = svg.append("g");
    const treeLayout = d3.tree().nodeSize([100, 200]);
  
    function update() {
      // Generate the tree and links
      const tree = treeLayout(d3.hierarchy(treeData));
      const links = tree.links();
  
      // Draw links
      g.selectAll(".link")
        .data(links)
        .join("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        );
  
      // Draw nodes
      const nodes = g
        .selectAll(".node")
        .data(tree.descendants(), (d) => d.data.name);
  
      const nodesEnter = nodes
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .on("click", (event, d) => {
          toggleChildren(d);
          collapseSiblings(d);
  
          // Update the transformation for center-left positioning
          const targetX = width / 4;
          const targetY = height / 2;
          const transform = d3.zoomIdentity.translate(targetX - d.y, targetY - d.x);
          g.transition().duration(750).attr("transform", transform);
  
          update(); // Update the mind map
        });
  
      // Add circles
      nodesEnter
        .append("circle")
        .attr("r", 4)
        .style("fill", (d) => (d.data._children && d.data._children.length > 0 ? "#555" : "#999"));
  
      // Add labels
      nodesEnter
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", (d) => (d.data.children || (d.data._children && d.data._children.length > 0) ? -10 : 10))
        .attr("text-anchor", (d) =>
          d.data.children || (d.data._children && d.data._children.length > 0) ? "end" : "start"
        )
        .text((d) => d.data.name);
  
      // Add a "+" sign to nodes with children
      nodesEnter
        .filter((d) => d.data._children)
        .append("text")
        .attr("class", "plus")
        .attr("dy", "0.31em")
        .attr("x", -4)
        .attr("text-anchor", "middle")
        .text("+");
  
        nodesEnter.merge(nodes).attr("transform", (d) => `translate(${d.y},${d.x})`);

        // Remove any exiting nodes
        nodes.exit().remove();
      }
    
      update();
    }

// Sample input text

fetch("mindmap.txt")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text();
  })
  .then((inputText) => {
    const sortedText = sortInputText(inputText);
    console.log(sortedText)
    const treeData = parseInputText(sortedText);
    console.log(treeData)
    createMindMap(treeData);
  })


window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  d3.select("body").select("svg").attr("width", width).attr("height", height);
});
