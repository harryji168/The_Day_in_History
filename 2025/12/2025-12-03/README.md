# Interactive 3D Daily Digest

This is an interactive 3D website featuring a daily digest scene with a Moon, a Card, and floating text.

## How to Run

Due to browser security restrictions (CORS), you cannot simply double-click `index.html` to view the 3D scene (textures and modules won't load). You need to run a local web server.

### Options:

1.  **VS Code Live Server**:
    - Install the "Live Server" extension in VS Code.
    - Right-click `index.html` and select "Open with Live Server".

2.  **Python (if installed)**:
    - Open a terminal in this folder.
    - Run: `python -m http.server`
    - Open `http://localhost:8000` in your browser.

3.  **Node.js (if installed)**:
    - Run: `npx http-server .`
    - Open the provided URL.

## Controls
- **Left Click + Drag**: Rotate the camera.
- **Scroll**: Zoom in/out.
- **Click Objects**: View details (Moon, Text).
