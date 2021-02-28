# Simple Remote 3D Viewer

Upload a 3D file (stl/obj) and see it in your browser.

## Usage

POST a file to /upload, and navigate to the URL returned in the Location header.

## About

Was built to allow the construction of a slack bot that looks for uploaded 3D files and sends a link to view them in-browser.    
[hubot-simple-remote-3d-viewer gist available here](https://gist.github.com/gfaugere/b94dc91a35dee4544993d7a7ebd24057)

Whole front-end is based on copy-pastes from [threejs](https://threejs.org/) examples.
