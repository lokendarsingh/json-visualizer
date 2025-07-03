## Agent Instructions for JSON Schema Visualizer

This project visualizes JSON schemas using D3.js.

### Key Files:
- `index.html`: Main HTML page. Contains SVG for D3 and basic styles.
- `main.js`: Core D3.js logic for fetching, transforming, and rendering the schema.
    - `transformSchema()`: This function is crucial. It converts the input JSON schema into a hierarchical structure that D3's `d3.hierarchy()` can consume. Pay close attention to how different schema types (`object`, `array`) are handled.
    - `update()`: Handles the D3 enter, update, and exit selections for nodes and links.
    - `click()`: Manages node collapsing/expanding.
- `schema.json`: The JSON schema data source.

### Development Guidelines:
1.  **Schema Transformation:**
    *   The `transformSchema` function in `main.js` is the heart of the data processing. When modifying how the schema is displayed (e.g., showing more properties, handling new schema keywords), this function will likely need updates.
    *   Ensure the transformation logic correctly creates a `name` and `children` array for each node in the hierarchy. The `path` property was added to help D3's stratify function but `d3.hierarchy` is now used directly. It's still useful for debugging.

2.  **D3 Version:**
    *   The project uses D3.js v7. Be mindful of any API changes if referencing documentation or examples from older D3 versions.

3.  **Error Handling:**
    *   Basic error handling for `schema.json` loading is in place. If adding more data sources or complex interactions, ensure robust error handling.

4.  **Styling:**
    *   CSS for the visualization is currently inline in `index.html`. For more complex styling, consider moving it to a separate CSS file.

5.  **Testing:**
    *   To test changes, modify `schema.json` with different schema structures (nested objects, arrays of objects, various data types, etc.) and ensure the visualization renders correctly.
    *   Verify that node collapsing and expanding functionality remains intact.
    *   Check the browser's developer console for any errors, especially related to D3 or data processing.

6.  **Local Server for Development:**
    *   Due to browser security restrictions (CORS) when fetching local files with `d3.json()`, it's highly recommended to use a local web server for development and testing. Simple Python HTTP server (`python -m http.server`) or Node.js based servers (like `live-server`) work well. The `README.md` mentions this.

7.  **Future Enhancements Considerations:**
    *   Displaying more schema details on nodes (e.g., type, description) on hover or click.
    *   Supporting `allOf`, `anyOf`, `oneOf`, `not` keywords.
    *   Search/highlight functionality for schema nodes.
    *   Allowing users to upload their own schema file.

When making changes, clearly document the purpose and impact, especially if modifying the `transformSchema` function or core D3 rendering logic.
