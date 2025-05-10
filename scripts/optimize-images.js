// Script to optimize images in the public directory
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// First install the required packages if not already installed
try {
  console.log('Installing image optimization dependencies...');
  
  // Install dependencies needed for image optimization
  execSync('npm install --save-dev sharp imagemin imagemin-jpegtran imagemin-pngquant glob');
  
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Import the newly installed modules
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

// Paths
const publicDir = path.join(__dirname, '../public');
const imagesDir = path.join(publicDir, 'uploads/images');

// Create the images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Created images directory:', imagesDir);
}

console.log('Optimizing images in public directory:', publicDir);

// Get all image files using glob (works on Windows and Linux)
const getImageFiles = () => {
  const patterns = ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp'];
  let files = [];
  
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, { cwd: imagesDir, absolute: true });
    files = [...files, ...matches];
  });
  
  return files;
};

// Process images
const optimizeImages = async () => {
  try {
    const imageFiles = getImageFiles();
    
    if (imageFiles.length === 0) {
      console.log('No image files found to optimize.');
      return;
    }
    
    console.log(`Found ${imageFiles.length} image files to optimize.`);
    
    for (const file of imageFiles) {
      console.log(`Optimizing: ${path.relative(publicDir, file)}`);
      
      const fileDir = path.dirname(file);
      
      await imagemin([file], {
        destination: fileDir,
        plugins: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8]
          })
        ]
      });
    }
    
    console.log('Image optimization completed successfully.');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
};

// Run the optimization
optimizeImages().then(() => {
  console.log('Image optimization process completed.');
}); 