import fs from 'fs';
import path from 'path';

// fs is used for file operations

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'projects.json');

// Make sure the data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Default projects that will be used if no data file exists
const defaultProjects = [
  {
    id: 1,
    title: '3D Stuhl-Modellierung',
    description: 'Ein mathematischer Stuhl, modelliert in Blender.',
    longDescription: 'Dieses Projekt zeigt die Modellierung eines mathematischen Stuhls in Blender mit Fokus auf geometrische Präzision und ästhetisches Design. Der Stuhl wurde mit Subdivision Surface-Techniken erstellt, um eine glatte und realistische Darstellung zu erreichen.',
    image: '/project1.jpg',
    technologies: ['Blender', '3D-Modellierung', 'Subdivision Surface'],
    category: '3D-Design',
    completed: true,
    modelPath: '/models/chair.glb',
    team: ['Jano Offermann'],
    timeline: 'Januar 2023 - März 2023',
    github: 'https://github.com/example/blender-chair-model'
  },
  {
    id: 2,
    title: 'Interaktive Webseite',
    description: 'Eine responsive Webseite mit modernen Web-Technologien.',
    longDescription: 'Dieses Projekt demonstriert die Entwicklung einer modernen, responsiven Webseite unter Verwendung von HTML5, CSS3 und JavaScript. Die Seite enthält interaktive Elemente, Animationen und folgt den neuesten Best Practices für Web-Design und Benutzerfreundlichkeit.',
    image: '/project2.jpg',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    category: 'Web-Entwicklung',
    completed: true,
    modelPath: '',
    team: ['Jano Offermann', 'Lisa Schmidt'],
    timeline: 'April 2023 - Juni 2023',
    github: 'https://github.com/example/interactive-website'
  }
];

// Get projects from server file
function getProjects() {
  ensureDataDir();
  
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      // Initialize with default data if file doesn't exist
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(defaultProjects, null, 2));
      return defaultProjects;
    }
    
    const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading projects file:', error);
    return defaultProjects;
  }
}

// Save projects to server file
function saveProjects(projects) {
  ensureDataDir();
  
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(projects, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving projects file:', error);
    return false;
  }
}

// Record project activity
async function recordActivity(actionType, projectTitle) {
  try {
    let actionText;
    switch (actionType) {
      case 'add':
        actionText = `Neues Projekt '${projectTitle}' erstellt`;
        break;
      case 'edit':
        actionText = `Projekt '${projectTitle}' bearbeitet`;
        break;
      case 'delete':
        actionText = `Projekt '${projectTitle}' gelöscht`;
        break;
      default:
        actionText = `Projekt '${projectTitle}' aktualisiert`;
    }
    
    // Use internal API call instead of fetch for server-side
    const { default: handler } = await import('./activities');
    
    // Create a mock request and response
    const req = {
      method: 'POST',
      body: {
        type: 'project',
        action: actionType,
        text: actionText
      }
    };
    
    const res = {
      status: () => ({
        json: () => {}
      }),
      setHeader: () => {}
    };
    
    // Call the activities handler directly
    await handler(req, res);
  } catch (error) {
    console.error('Error recording project activity:', error);
  }
}

export default function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // Return all projects
      res.status(200).json(getProjects());
      break;
      
    case 'POST':
      // Update all projects
      try {
        const projects = req.body;
        
        if (!Array.isArray(projects)) {
          return res.status(400).json({ error: 'Invalid data format. Expected an array of projects.' });
        }

        const oldProjects = getProjects();
        const success = saveProjects(projects);
        
        if (success) {
          // Record activities for project changes
          const oldIds = oldProjects.map(p => p.id);
          const newIds = projects.map(p => p.id);
          
          // Find added projects
          const addedProjects = projects.filter(p => !oldIds.includes(p.id));
          addedProjects.forEach(project => {
            recordActivity('add', project.title);
          });
          
          // Find updated projects (excluding newly added ones)
          const updatedProjects = projects.filter(p => 
            oldIds.includes(p.id) && 
            JSON.stringify(p) !== JSON.stringify(oldProjects.find(op => op.id === p.id))
          );
          updatedProjects.forEach(project => {
            recordActivity('edit', project.title);
          });
          
          // Find deleted projects
          const deletedProjects = oldProjects.filter(p => !newIds.includes(p.id));
          deletedProjects.forEach(project => {
            recordActivity('delete', project.title);
          });
          
          res.status(200).json({ success: true, message: 'Projects updated successfully' });
        } else {
          res.status(500).json({ error: 'Failed to save projects' });
        }
      } catch (error) {
        console.error('Error in POST /api/projects:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 