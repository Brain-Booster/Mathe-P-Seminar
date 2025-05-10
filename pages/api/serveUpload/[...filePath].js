import fs from 'fs';
import path from 'path';
import { FileHandler } from '../../../src/lib/fileHandler';

export default async function handler(req, res) {
  try {
    // Use current working directory (in prod, .next/standalone; in dev, project root)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Get file path from query parameters
    const { filePath } = req.query;
    
    if (!filePath || !Array.isArray(filePath) || filePath.length === 0) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Join the file path parts
    const fullPath = path.join(uploadsDir, ...filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Serve the file
    // Determine headers based on file extension
    const fileName = filePath[filePath.length - 1];
    const ext = path.extname(fileName).toLowerCase();
    const mimeType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    // Always allow inline display for PDFs
    const disposition = mimeType === 'application/pdf' ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
    fs.createReadStream(fullPath).pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 