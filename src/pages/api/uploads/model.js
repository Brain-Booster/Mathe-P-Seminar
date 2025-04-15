import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the incoming form
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          res.status(500).json({ error: 'Error uploading file' });
          return resolve();
        }

        const modelFile = files.model;
        if (!modelFile) {
          res.status(400).json({ error: 'No model file provided' });
          return resolve();
        }

        const file = Array.isArray(modelFile) ? modelFile[0] : modelFile;
        
        // Check file type
        const validTypes = ['.glb', '.gltf', '.obj', '.stl', '.fbx'];
        const ext = path.extname(file.originalFilename).toLowerCase();
        
        if (!validTypes.includes(ext)) {
          res.status(400).json({ 
            error: `Invalid file type. Supported types: ${validTypes.join(', ')}` 
          });
          return resolve();
        }

        // Create a unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.originalFilename.replace(/\s+/g, '-')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'models');
        const filepath = path.join(uploadDir, filename);

        try {
          // Ensure upload directory exists
          await fs.mkdir(uploadDir, { recursive: true });

          // Move the file to the destination
          const data = await fs.readFile(file.filepath);
          await fs.writeFile(filepath, data);
          
          // Remove the temp file
          await fs.unlink(file.filepath);
          
          // Return success
          res.status(200).json({ 
            success: true, 
            filename,
            modelPath: `/models/${filename}`
          });
          return resolve();
        } catch (error) {
          console.error('File operation error:', error);
          res.status(500).json({ error: 'Error saving file' });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
} 