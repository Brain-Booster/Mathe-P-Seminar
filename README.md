# School Project with 3D Model Viewer

This Next.js application includes a 3D model viewer integration that allows you to display 3D models in your projects, similar to Sketchfab.

## Features

- **3D Model Viewer**: Display interactive 3D models in project details
- **Model Upload Interface**: Admin interface to upload and manage 3D models
- **Project Assignment**: Assign models to specific projects
- **AR Viewing**: View models in Augmented Reality on supported devices

## Setting Up the 3D Model Feature

### Requirements

To use the 3D model viewer functionality, you'll need:

1. Install dependencies:
   ```
   npm install @google/model-viewer formidable@2.1.2
   ```

2. Enable file uploads:
   - Create a `/public/models` directory for storing uploaded models
   - Ensure proper file permissions

### Supported 3D Model Formats

The viewer supports the following formats:
- GLB (recommended)
- GLTF
- OBJ
- STL
- FBX

GLB format is recommended for best performance and compatibility.

## Using the 3D Model Feature

### Viewing Models

Models assigned to projects will automatically display in the project details page. Users can:
- Rotate the model by dragging
- Zoom with mouse wheel or pinch gestures
- View in AR (on supported devices)

### Adding Models to Projects

1. Go to the admin models page (`/admin/models`)
2. Upload a 3D model file using the uploader
3. Select a project to assign the model to
4. Click "Assign"

## Converting Models for Use

If you have models in other formats (like Blender files):

1. Open your model in Blender
2. Go to File > Export > glTF 2.0 (.glb/.gltf)
3. Choose GLB format for a single file export
4. Set appropriate export options (scene, animations, etc.)
5. Upload the exported GLB file

## Implementation Notes

- 3D models are loaded dynamically on the client side
- The viewer is rendered inside a dedicated container
- Models are displayed with environment lighting and shadows
- The AR feature requires HTTPS and is only available on compatible devices

## Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
```