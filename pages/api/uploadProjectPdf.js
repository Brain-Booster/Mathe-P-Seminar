import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import mime from 'mime-types';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_PDF_TYPE = 'application/pdf';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for project PDFs

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    // Save directly to Next.js public folder for static serving
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs');
    ensureDir(uploadDir);

    const form = new formidable.IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
             return res.status(413).json({ error: 'File too large', details: `Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` });
        }
        return res.status(500).json({ error: 'Upload failed', details: err.message });
      }

      const file = files.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (file.mimetype !== ALLOWED_PDF_TYPE) {
          fs.unlinkSync(file.filepath);
          return res.status(415).json({ error: 'Invalid file type', details: 'Only PDF files are allowed.' });
      }

      try {
        const timestamp = Date.now();
        // Force .pdf extension regardless of original filename
        const filename = `project-pdf-${timestamp}.pdf`;
        
        const oldPath = file.filepath;
        
        const newPath = path.join(uploadDir, filename);
        
        fs.renameSync(oldPath, newPath);
        
        // Return the public path so browser serves inline
        const fileUrl = `/uploads/pdfs/${filename}`;
        
        res.status(200).json({
          fileUrl: fileUrl,
          filename: filename,
        });

      } catch (error) {
         try {
            fs.unlinkSync(newPath);
         } catch (unlinkErr) {
            console.error('Error deleting file after rename error:', unlinkErr);
         }
         console.error('Error processing uploaded file:', error);
         res.status(500).json({ error: 'File processing failed', details: error.message });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
} 