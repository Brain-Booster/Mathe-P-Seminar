import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

// Disable the default body parser to handle file uploads
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
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create models directory if it doesn't exist
    const modelsDir = path.join(process.cwd(), 'public/models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    // Parse the incoming form data
    const form = new IncomingForm({
      uploadDir: fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true }),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      // Check if file exists
      if (!files.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = files.file;
      const fileType = fields.fileType; // 'image' or 'model'
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.originalFilename}`;
      
      let targetPath;
      let fileUrl;
      
      // Determine target path based on file type
      if (fileType === 'model') {
        targetPath = path.join(modelsDir, fileName);
        fileUrl = `/models/${fileName}`;
      } else {
        // Default to image
        targetPath = path.join(uploadDir, fileName);
        fileUrl = `/uploads/${fileName}`;
      }

      // Copy the file to the target path
      const data = fs.readFileSync(file.filepath);
      fs.writeFileSync(targetPath, data);
      
      // Delete temporary file
      fs.unlinkSync(file.filepath);

      // Return the file URL
      return res.status(200).json({ 
        fileUrl,
        message: 'File uploaded successfully' 
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Server error during upload' });
  }
} 