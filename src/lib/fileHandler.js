import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

export class FileHandler {
  constructor() {
    // Write to the public folder of the running server (cwd)
    const publicDir = path.join(process.cwd(), 'public');
    this.imageDir = path.join(publicDir, 'uploads', 'images');
    this.pdfDir = path.join(publicDir, 'uploads', 'pdfs');
    this.modelDir = path.join(publicDir, 'uploads', 'models');
    [this.imageDir, this.pdfDir, this.modelDir].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Security measures
    this.allowedFileTypes = {
      images: ['jpg', 'jpeg', 'png', 'webp'],
      pdfs: ['pdf'],
      models: ['glb', 'gltf', 'obj', 'stl', 'fbx']
    };
    this.maxFileSize = {
      images: 10 * 1024 * 1024, // 10MB
      pdfs: 50 * 1024 * 1024,  // 50MB
      models: 100 * 1024 * 1024 // 100MB
    };
  }

  async uploadFile(file, fileType, subPath = '') {
    try {
      // Validate input
      if (!file || !fileType) {
        throw new Error('File and fileType are required');
      }

      // Normalize fileType to match allowedFileTypes keys
      let typeKey = fileType;
      if (!this.allowedFileTypes[typeKey] && this.allowedFileTypes[`${typeKey}s`]) {
        typeKey = `${typeKey}s`;
      }

      // Validate file type
      const originalName = file.originalFilename || path.basename(file.filepath);
      const extension = path.extname(originalName).toLowerCase().slice(1);
      if (!this.allowedFileTypes[typeKey]?.includes(extension)) {
        throw new Error(`Invalid file type. Expected: ${this.allowedFileTypes[typeKey]?.join(', ') || 'unknown type'}`);
      }

      // Validate file size
      if (!this.maxFileSize[typeKey]) {
        throw new Error('File type not supported');
      }
      if (file.size > this.maxFileSize[typeKey]) {
        throw new Error(`File too large. Max size: ${this.maxFileSize[typeKey]/1024/1024}MB`);
      }

      // Generate unique filename, preserving original extension
      const timestamp = Date.now();
      const ext = path.extname(originalName).toLowerCase();
      const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${timestamp}-${nameWithoutExt}${ext}`;

      // Get target path
      const filePath = this.getFilePath(typeKey, subPath);
      const fullPath = path.join(filePath, fileName);
      console.log('FileHandler: saving file to', fullPath);

      // Ensure directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save file
      await fsPromises.rename(file.filepath, fullPath);

      // Validate file after saving
      if (!fs.existsSync(fullPath)) {
        throw new Error('File failed to save');
      }

      // Return relative path
      const relativePath = path.relative(process.cwd(), fullPath);
      return {
        path: relativePath,
        url: this.getFileUrl(typeKey, fileName),
        size: file.size,
        type: file.mimetype
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  getFilePath(fileType, subPath = '') {
    let baseDir;
    if (fileType === 'images') baseDir = this.imageDir;
    else if (fileType === 'pdfs') baseDir = this.pdfDir;
    else if (fileType === 'models') baseDir = this.modelDir;
    else throw new Error('Unsupported file type');
    const fullDir = subPath ? path.join(baseDir, subPath) : baseDir;
    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
    return fullDir;
  }

  getFileUrl(fileType, fileName) {
    // Serve via API route
    return `/api/serveUpload/${fileType}/${fileName}`;
  }

  async serveFile(filePath, res) {
    try {
      // Prevent directory traversal
      if (filePath.includes('..')) {
        res.status(403).json({ error: 'Invalid path' });
        return;
      }

      // Get absolute path
      const fullPath = path.join(process.cwd(), filePath);

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      // Get file type
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';

      // Set appropriate content type
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.glb') {
        contentType = 'model/gltf-binary';
      } else if (ext === '.gltf') {
        contentType = 'model/gltf+json';
      } else if (ext === '.obj') {
        contentType = 'model/obj';
      } else if (ext === '.stl') {
        contentType = 'model/stl';
      } else if (ext === '.fbx') {
        contentType = 'model/fbx';
      }

      // Set headers
      res.setHeader('Content-Type', contentType);
      
      // Set caching headers based on environment
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        // Different cache durations based on file type
        const cacheDuration = {
          image: 'public, max-age=31536000', // 1 year
          pdf: 'public, max-age=604800',    // 1 week
          model: 'public, max-age=2592000'  // 30 days
        };
        
        // Determine file type
        const fileType = Object.keys(this.allowedFileTypes).find(type => 
          this.allowedFileTypes[type].includes(ext.slice(1))
        );
        
        res.setHeader('Cache-Control', cacheDuration[fileType] || 'public, max-age=31536000');
      }

      // Set security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Stream the file
      const readStream = fs.createReadStream(fullPath);
      readStream.pipe(res);

      // Handle errors
      readStream.on('error', (err) => {
        console.error('Error reading file:', err);
        res.status(500).json({ error: 'Error reading file' });
      });

      // Handle cleanup
      res.on('close', () => {
        readStream.destroy();
      });
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
