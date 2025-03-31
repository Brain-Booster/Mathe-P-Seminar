import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

// Set bodyParser to false to allow for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure directory exists
const ensureDir = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  // CORS headers to allow requests from any origin during development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS method (preflight requests)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Ensure the directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'team');
    ensureDir(uploadDir);

    // Configure form parser
    const form = new formidable.IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    // Parse the form
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        res.status(500).json({ error: 'Upload failed', details: err.message });
        return;
      }

      // Extract the uploaded file
      const file = files.file;
      
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      try {
        // Generate a unique filename
        const timestamp = Date.now();
        const originalFilename = file.originalFilename || 'upload.jpg';
        const ext = path.extname(originalFilename);
        const filename = `team-member-${timestamp}${ext}`;
        
        // Get the temporary file path
        const oldPath = file.filepath;
        
        // Define the new file path
        const newPath = path.join(uploadDir, filename);
        
        // Rename the file (move from temp location to final destination)
        fs.renameSync(oldPath, newPath);
        
        // Return the URL to the uploaded file
        const fileUrl = `/team/${filename}`;
        
        res.status(200).json({
          url: fileUrl,
          filename: filename,
        });
      } catch (error) {
        console.error('Error processing uploaded file:', error);
        res.status(500).json({ error: 'File processing failed', details: error.message });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
} 