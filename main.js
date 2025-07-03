document.addEventListener('DOMContentLoaded', () => {
    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const g = svg.append("g").attr("transform", "translate(40,0)"); // Adjusted margin for root node visibility

    const treeLayout = d3.tree().size([height, width - 200]); // Adjusted width for node labels

    const fileInput = document.getElementById('schemaFile');
    const messageArea = document.getElementById('messageArea');

    let rootNodeGlobal; // To keep track of the current root for collapsing/expanding all
    let nodeIdCounter = 0; // To ensure unique IDs for nodes

    // Initial message
    displayMessage("Please upload a JSON schema file to begin.", "info");

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const schemaData = JSON.parse(e.target.result);
                    clearVisualization();
                    displayMessage("Schema loaded successfully. Processing...", "success");
                    const hierarchyData = transformSchema(schemaData);
                    if (!hierarchyData || (hierarchyData.children && hierarchyData.children.length === 0 && !hierarchyData.name)) {
                        displayMessage("The provided JSON does not seem to be a valid schema or is empty after transformation. Please check the file.", "error");
                        return;
                    }
                    rootNodeGlobal = d3.hierarchy(hierarchyData);
                    rootNodeGlobal.x0 = height / 2;
                    rootNodeGlobal.y0 = 0;

                    // Collapse after the second level
                    rootNodeGlobal.descendants().forEach((d, i) => {
                        d.id = i; // Assign a unique ID based on traversal order
                        if (d.depth > 1) { // Collapse nodes deeper than 1
                           if (d.children) {
                                d._children = d.children;
                                d.children = null;
                           }
                        }
                    });
                    update(rootNodeGlobal);
                    displayMessage("Visualization complete. Click nodes to expand/collapse.", "success");

                } catch (error) {
                    console.error("Error parsing JSON schema:", error);
                    clearVisualization();
                    displayMessage(`Error parsing JSON file: ${error.message}. Please ensure it's a valid JSON.`, "error");
                    rootNodeGlobal = null;
                }
            };
            reader.onerror = function(e) {
                console.error("Error reading file:", e);
                clearVisualization();
                displayMessage("Error reading file. Please try again.", "error");
                rootNodeGlobal = null;
            };
            reader.readAsText(file);
        }
    });

    function transformSchema(schema, name = 'root') {
        nodeIdCounter = 0; // Reset for each new schema
        function _transform(currentSchema, currentName, path) {
            const node = { name: currentName, path: path, id: `node-${nodeIdCounter++}`, children: [] };
            // Include type and description if available
            if (currentSchema.type) node.type = currentSchema.type;
            if (currentSchema.description) node.description = currentSchema.description;
            if (currentSchema.title) node.title = currentSchema.title; // Use title for name if present and more descriptive

            if (currentSchema.type === 'object' && currentSchema.properties) {
                for (const key in currentSchema.properties) {
                    node.children.push(_transform(currentSchema.properties[key], key, `${path}.${key}`));
                }
            } else if (currentSchema.type === 'array' && currentSchema.items) {
                const itemName = currentSchema.items.title || (currentSchema.items.type ? `item (${currentSchema.items.type})` : 'item');
                node.children.push(_transform(currentSchema.items, itemName, `${path}.items`));
            }
            // If no children were added but it's an object/array, it might be an empty one.
            // For other types, they are leaf nodes.
            if (node.children.length === 0) delete node.children; // D3 handles nodes without children as leaves

            return node;
        }
        return _transform(schema, schema.title || name, name);
    }

    function clearVisualization() {
        g.selectAll("*").remove();
    }

    function displayMessage(message, type = "error") {
        messageArea.textContent = message;
        messageArea.style.color = type === "error" ? "red" : (type === "success" ? "green" : "black");
    }

    function update(source) {
        const duration = 250;

        const treeData = treeLayout(rootNodeGlobal);
        let nodes = treeData.descendants();
        let links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(d => { d.y = d.depth * 180;}); // Adjust spacing based on depth

        const node = g.selectAll("g.node")
            .data(nodes, d => d.id); // Use the pre-assigned unique ID

        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", `translate(${source.y0 || rootNodeGlobal.y0},${source.x0 || rootNodeGlobal.x0})`)
            .on("click", (event, d) => click(d))
            .on("mouseover", (event, d) => { // Show tooltip
                const tooltip = g.append("text")
                    .attr("id", "tooltip")
                    .attr("x", d.y + 15)
                    .attr("y", d.x - 10)
                    .attr("text-anchor", "start")
                    .attr("font-size", "10px")
                    .attr("fill", "black")
                    .style("pointer-events", "none"); // Make tooltip non-interactive

                tooltip.append("tspan")
                    .attr("x", d.y + 15)
                    .attr("dy", "0em")
                    .text(`Name: ${d.data.name}`);
                if (d.data.type) {
                    tooltip.append("tspan")
                       .attr("x", d.y + 15)
                       .attr("dy", "1.2em")
                       .text(`Type: ${d.data.type}`);
                }
                if (d.data.description) {
                     tooltip.append("tspan")
                       .attr("x", d.y + 15)
                       .attr("dy", "1.2em")
                       .text(`Desc: ${d.data.description.substring(0,50)}${d.data.description.length > 50 ? '...' : '' }`);
                }
             })
            .on("mouseout", () => { // Remove tooltip
                g.select("#tooltip").remove();
            });


        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", d => d._children ? "lightsteelblue" : "#fff");

        nodeEnter.append("text")
            .attr("x", d => d.children || d._children ? -13 : 13)
            .attr("dy", ".35em")
            .attr("text-anchor", d => d.children || d._children ? "end" : "start")
            .text(d => d.data.name)
            .style("fill-opacity", 1e-6);

        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", d => `translate(${d.y},${d.x})`);

        nodeUpdate.select("circle")
            .attr("r", 10)
            .style("fill", d => d._children ? "lightsteelblue" : (d.children ? "#fff" : "#999")) // Grey for leaves
            .style("stroke", d => d.children || d._children ? "steelblue" : "#555");


        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        const nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", `translate(${source.y},${source.x})`)
            .remove();

        nodeExit.select("circle").attr("r", 1e-6);
        nodeExit.select("text").style("fill-opacity", 1e-6);

        const link = g.selectAll("path.link")
            .data(links, d => d.id); // Use target ID for links as well for consistency

        const linkEnter = link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", () => {
                const o = { x: source.x0 || rootNodeGlobal.x0, y: source.y0 || rootNodeGlobal.y0 };
                return diagonal({ source: o, target: o });
            });

        linkEnter.merge(link).transition()
            .duration(duration)
            .attr("d", d => diagonal({ source: d.parent, target: d }));

        link.exit().transition()
            .duration(duration)
            .attr("d", () => {
                const o = { x: source.x, y: source.y }; // Use the source's current position
                return diagonal({ source: o, target: o });
            })
            .remove();

        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    function click(d) {
        if (d.children) { // If children are visible, collapse them
            d._children = d.children;
            d.children = null;
        } else if (d._children) { // If children are collapsed, expand them
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

    function diagonal(s) { // s is an object with source and target properties
        return `M ${s.source.y} ${s.source.x}
                C ${(s.source.y + s.target.y) / 2} ${s.source.x},
                  ${(s.source.y + s.target.y) / 2} ${s.target.x},
                  ${s.target.y} ${s.target.x}`;
    }
});
