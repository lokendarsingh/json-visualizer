# JSON Schema Visualizer

This project uses D3.js to visualize a JSON schema, uploaded by the user, as a collapsible interactive tree. The application is served via a simple Python HTTP server and can be run inside a Docker container.

## Features

*   Upload a JSON schema file directly in the browser.
*   View the schema as an interactive, collapsible tree.
*   Nodes display schema information (name, type, description) on hover.
*   Nodes beyond the first level are initially collapsed for better readability of large schemas.

## How to Run (Docker Recommended)

### Using Docker (Recommended)

1.  **Ensure Docker is installed** on your system.
2.  **Build the Docker image:**
    Open a terminal in the project's root directory (where the `Dockerfile` is located) and run:
    ```bash
    docker build -t json-schema-visualizer .
    ```
3.  **Run the Docker container:**
    ```bash
    docker run -p 8000:8000 json-schema-visualizer
    ```
4.  **Open in browser:**
    Navigate to `http://localhost:8000/index.html` in your web browser.

### Running Locally (Without Docker)

1.  **Ensure Python 3 is installed.**
2.  **Navigate to the project directory** in your terminal.
3.  **Run the Python HTTP server:**
    ```bash
    python app.py
    ```
4.  **Open in browser:**
    Navigate to `http://localhost:8000/index.html` in your web browser.

## How to Use

1.  Once the application is running and open in your browser, you will see an "Upload your JSON schema file" section.
2.  Click the "Choose File" or "Browse" button and select a `.json` file containing your JSON schema.
3.  The visualization will automatically render below the upload control.
4.  Click on nodes in the tree to expand or collapse them.
5.  Hover over nodes to see details like type and description.

## Project Structure

*   `index.html`: The main HTML file that hosts the D3 visualization and file upload control.
*   `main.js`: Contains the JavaScript code using D3.js to handle file uploads, parse the schema, and render the interactive tree.
*   `app.py`: A simple Python script using the `http.server` module to serve the static files.
*   `Dockerfile`: Defines the Docker container for packaging and running the application.
*   `README.md`: This file.
*   `AGENTS.md`: Instructions for AI agents working on this codebase.
*   ~~`schema.json`~~ (Removed): This file is no longer used as schemas are now uploaded by the user.

## Customization

*   **Styling:** Modify the CSS within the `<style>` tags in `index.html` to change the appearance of the nodes, links, text, and layout.
*   **Functionality:** The D3.js code in `main.js` can be extended to add more features or change the transformation and rendering logic. For example, you could add support for more JSON schema keywords or enhance the information displayed in tooltips.

## D3.js Version

This project uses D3.js v7.
