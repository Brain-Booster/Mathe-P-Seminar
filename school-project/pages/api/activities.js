import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'activities.json');

// Make sure the data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Default activities that will be used if no data file exists
const defaultActivities = [
  {
    id: 1,
    type: 'project',
    action: 'update',
    text: '3D Stuhl-Modellierung Projekt aktualisiert',
    timestamp: new Date('2023-10-15T15:45:00').toISOString()
  },
  {
    id: 2,
    type: 'project',
    action: 'upload',
    text: 'Neues Modell hochgeladen: chair.glb',
    timestamp: new Date('2023-10-14T10:23:00').toISOString()
  },
  {
    id: 3,
    type: 'project',
    action: 'edit',
    text: "Projekt 'Projekt Zwei' bearbeitet",
    timestamp: new Date('2023-03-19T11:30:00').toISOString()
  }
];

// Get activities from server file
function getActivities() {
  ensureDataDir();
  
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      // Initialize with default data if file doesn't exist
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(defaultActivities, null, 2));
      return defaultActivities;
    }
    
    const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading activities file:', error);
    return defaultActivities;
  }
}

// Save activities to server file
function saveActivities(activities) {
  ensureDataDir();
  
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(activities, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving activities file:', error);
    return false;
  }
}

// Add a new activity
function addActivity(type, action, text) {
  const activities = getActivities();
  
  const newActivity = {
    id: Date.now(), // Use timestamp as ID
    type,
    action,
    text,
    timestamp: new Date().toISOString()
  };
  
  // Filter out any existing activities with the same text (remove duplicates)
  const filteredActivities = activities.filter(activity => activity.text !== text);
  
  // Add the new activity at the beginning
  filteredActivities.unshift(newActivity);
  
  // Keep only the most recent 50 activities
  const trimmedActivities = filteredActivities.slice(0, 50);
  
  saveActivities(trimmedActivities);
  return newActivity;
}

export default function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // Return all activities
      res.status(200).json(getActivities());
      break;
      
    case 'POST':
      // Add new activity
      try {
        const { type, action, text } = req.body;
        
        if (!type || !action || !text) {
          return res.status(400).json({ 
            error: 'Invalid data. Required fields: type, action, text' 
          });
        }
        
        const newActivity = addActivity(type, action, text);
        res.status(201).json(newActivity);
      } catch (error) {
        console.error('Error in POST /api/activities:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 