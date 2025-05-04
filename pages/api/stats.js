import fs from 'fs';
import path from 'path';
import { getClientProjects } from '../../models/models.js';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'stats.json');

// Make sure the data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Get or initialize stats file
function getStats() {
  ensureDataDir();
  
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      // Initialize with default data if file doesn't exist
      const defaultStats = {
        visitors: [],
        lastReset: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(defaultStats, null, 2));
      return defaultStats;
    }
    
    const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading stats file:', error);
    return { visitors: [], lastReset: new Date().toISOString() };
  }
}

// Save stats to file
function saveStats(stats) {
  ensureDataDir();
  
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(stats, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving stats file:', error);
    return false;
  }
}

// Track a new visitor
function trackVisitor(ip) {
  const stats = getStats();
  
  // Check if this IP was already tracked this month
  const now = new Date();
  const lastReset = new Date(stats.lastReset);
  
  // If it's a new month, reset the visitors
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    stats.visitors = [];
    stats.lastReset = now.toISOString();
  }
  
  // Add IP if not already in the list
  if (!stats.visitors.includes(ip)) {
    stats.visitors.push(ip);
    saveStats(stats);
  }
  
  return stats;
}

// Get current stats
async function getCurrentStats() {
  // Get project count directly from the project data file
  let projectCount = 0;
  try {
    const projectsFilePath = path.join(process.cwd(), 'data', 'projects.json');
    if (fs.existsSync(projectsFilePath)) {
      const projectsData = fs.readFileSync(projectsFilePath, 'utf8');
      const projects = JSON.parse(projectsData);
      projectCount = Array.isArray(projects) ? projects.length : 0;
    } else {
      // Fall back to getClientProjects if file doesn't exist yet
      const projects = await getClientProjects();
      projectCount = projects.length;
    }
  } catch (error) {
    console.error('Error getting project count:', error);
  }
  
  // Get visitor count
  const stats = getStats();
  const visitorCount = stats.visitors.length;
  
  return {
    projectCount,
    visitorCount
  };
}

export default async function handler(req, res) {
  // Track visitor IP (simplified - in production you'd use req.headers['x-forwarded-for'] or similar)
  const visitorIp = req.headers['x-forwarded-for'] || 
                    req.socket.remoteAddress || 
                    'unknown';
  
  // Track this visitor
  trackVisitor(visitorIp);
  
  // Get current stats
  const stats = await getCurrentStats();
  
  // Return stats in the response
  res.status(200).json(stats);
} 