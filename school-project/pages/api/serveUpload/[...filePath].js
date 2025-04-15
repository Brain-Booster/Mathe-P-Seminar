import fs from 'fs';
import path from 'path';
import mime from 'mime-types'; // We'll need this package

export default async function handler(req, res) {
  // Extract the file path segments from the URL
  const { filePath } = req.query;

  if (!filePath || !Array.isArray(filePath) || filePath.length === 0) {
    return res.status(400).send('Invalid file path');
  }

  // Construct the full path to the requested file within the 'uploads' directory
  // IMPORTANT: Use path.join to prevent directory traversal vulnerabilities
  const requestedPath = path.join(process.cwd(), 'uploads', ...filePath);

  // Security check: Ensure the resolved path is still within the 'uploads' directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!requestedPath.startsWith(uploadsDir)) {
    return res.status(403).send('Forbidden');
  }

  try {
    // Check if the file exists and is accessible
    await fs.promises.access(requestedPath, fs.constants.R_OK);

    // Get file stats (optional, but good for setting headers like Content-Length)
    const stats = await fs.promises.stat(requestedPath);

    // Determine the content type based on the file extension
    const contentType = mime.lookup(requestedPath) || 'application/octet-stream';

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    // Optional: Add caching headers if desired
    // res.setHeader('Cache-Control', 'public, max-age=3600'); 

    // Stream the file content to the response
    const readStream = fs.createReadStream(requestedPath);
    readStream.pipe(res);

    // Handle stream errors
    readStream.on('error', (err) => {
      console.error('Error reading file stream:', err);
      // Important: Don't try to send another response if headers already sent
      if (!res.headersSent) {
        res.status(500).send('Error serving file');
      } else {
        res.end(); // End the response if headers were already sent
      }
    });

  } catch (error) {
    // Handle errors like file not found (ENOENT) or permission denied (EACCES)
    if (error.code === 'ENOENT') {
      res.status(404).send('File not found');
    } else if (error.code === 'EACCES') {
      res.status(403).send('Forbidden');
    } else {
      console.error('Error accessing file:', error);
      res.status(500).send('Internal server error');
    }
  }
} 