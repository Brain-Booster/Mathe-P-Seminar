import formidable from 'formidable';
import { IncomingForm } from 'formidable';
import path from 'path';
import { FileHandler } from '../../src/lib/fileHandler';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Create form parser
    const form = formidable({
      multiples: false, // We only expect one file per upload
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
    });

    // Parse the form
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    const file = files.file;

    // Get file type from form data
    const fileType = fields.fileType;
    
    if (!fileType) {
      return res.status(400).json({ error: 'File type is required' });
    }

    // Create file handler instance
    const fileHandler = new FileHandler();
    
    // Upload the file
    const fileData = await fileHandler.uploadFile(file, fileType, fields.subPath || '');
    
    // Return success response with file URL
    res.status(200).json({
      success: true,
      fileUrl: fileData.url,
      filePath: fileData.path
    });
  } catch (error) {
    console.error('Error in upload:', error);
    res.status(500).json({ error: error.message });
  }
}
