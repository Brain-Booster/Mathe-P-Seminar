/**
 * Database utility functions for working with JSON files
 */
import fs from 'fs';
import path from 'path';

// Data directory path
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Ensure the data directory exists
 */
export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Read data from a JSON file
 * @param {string} filename - Name of the JSON file without extension
 * @param {any} defaultData - Default data to return if file doesn't exist
 * @returns {any} Parsed data from the file or default data
 */
export function readData(filename, defaultData = []) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  try {
    if (!fs.existsSync(filePath)) {
      // Initialize with default data if file doesn't exist
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error(`Error reading ${filename} file:`, error);
    return defaultData;
  }
}

/**
 * Write data to a JSON file
 * @param {string} filename - Name of the JSON file without extension 
 * @param {any} data - Data to write to the file
 * @returns {boolean} True if successful, false otherwise
 */
export function writeData(filename, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving ${filename} file:`, error);
    return false;
  }
}

/**
 * Get a new ID for an item
 * @param {Array} items - Array of items with id properties
 * @returns {number|string} New ID
 */
export function getNewId(items) {
  if (items.length === 0) {
    return 1;
  }
  
  if (typeof items[0].id === 'number') {
    // For numeric IDs
    return Math.max(...items.map(item => item.id)) + 1;
  } else {
    // For string IDs, use a timestamp
    return Date.now().toString();
  }
} 