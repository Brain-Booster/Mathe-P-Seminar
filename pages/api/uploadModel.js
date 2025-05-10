import formidable from 'formidable';
import { FileHandler } from '../../src/lib/fileHandler';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm({
      multiples: false,
      maxFileSize: 100 * 1024 * 1024 // 100MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const fileHandler = new FileHandler();
    const result = await fileHandler.uploadFile(files.file, 'models', fields.subPath || '');

    res.status(200).json({
      success: true,
      fileUrl: result.url,
      filePath: result.path
    });
  } catch (error) {
    console.error('Model upload error:', error);
    res.status(500).json({ error: error.message });
  }
}