import fs from 'fs';
import path from 'path';

// Default team members for initialization
const defaultTeamMembers = [
  {
    id: '1',
    name: 'Max',
    nachname: 'Mustermann',
    projekt: '3D-Modellierung',
    projektId: '1',
    profileImage: '/team/default-avatar.png',
    specializations: ['Mathematik', 'Entwicklung']
  },
  {
    id: '2',
    name: 'Anna',
    nachname: 'Beispiel',
    projekt: 'Interaktive Webseite',
    projektId: '2',
    profileImage: '/team/default-avatar.png',
    specializations: ['Web-Design', 'UI/UX']
  },
  {
    id: '3',
    name: 'Lisa',
    nachname: 'Musterfrau',
    projekt: 'KI-gesteuerter Roboter',
    projektId: '3',
    profileImage: '/team/default-avatar.png',
    specializations: ['Künstliche Intelligenz', 'Datenanalyse']
  }
];

const dataDir = path.join(process.cwd(), 'data');
const teamFilePath = path.join(dataDir, 'team.json');

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load team members from file or initialize with defaults
const loadTeamMembers = () => {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }
    
    // Check if the team members file exists
    if (fs.existsSync(teamFilePath)) {
      const fileData = fs.readFileSync(teamFilePath, 'utf8');
      const data = JSON.parse(fileData);
      
      // Ensure all team members have the required fields
      return data.map(member => ({
        ...member,
        projektId: member.projektId || '', // Set empty string if projektId does not exist
        specializations: member.specializations || [] // Set empty array if specializations does not exist
      }));
    }
    
    // If file doesn't exist, create it with default data
    fs.writeFileSync(teamFilePath, JSON.stringify(defaultTeamMembers, null, 2));
    return defaultTeamMembers;
  } catch (error) {
    console.error('Error loading team members:', error);
    return defaultTeamMembers;
  }
};

// Save team members to file
const saveTeamMembers = (teamMembers) => {
  try {
    fs.writeFileSync(teamFilePath, JSON.stringify(teamMembers, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving team members data:', error);
    return false;
  }
};

// Record team member activity
const recordActivity = async (actionType, member) => {
  try {
    let actionText;
    const fullName = `${member.name} ${member.nachname}`;
    
    switch (actionType) {
      case 'add':
        actionText = `Neues Teammitglied '${fullName}' hinzugefügt`;
        break;
      case 'edit':
        actionText = `Teammitglied '${fullName}' bearbeitet`;
        break;
      case 'delete':
        actionText = `Teammitglied '${fullName}' entfernt`;
        break;
      default:
        actionText = `Teammitglied '${fullName}' aktualisiert`;
    }
    
    // Use internal API call instead of fetch for server-side
    const { default: handler } = await import('./activities');
    
    // Create a mock request and response
    const req = {
      method: 'POST',
      body: {
        type: 'team',
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
    console.error('Error recording team activity:', error);
  }
};

export default function handler(req, res) {
  // CORS headers to allow requests from any origin during development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS method (preflight requests)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: Retrieve team members
  if (req.method === 'GET') {
    const teamMembers = loadTeamMembers();
    res.status(200).json(teamMembers);
    return;
  }

  // POST: Update team members
  if (req.method === 'POST') {
    try {
      // Validate input data
      const teamMembers = req.body;
      if (!Array.isArray(teamMembers)) {
        res.status(400).json({ error: 'Invalid data format. Expected an array of team members.' });
        return;
      }
      
      // Validate each team member has required fields
      for (const member of teamMembers) {
        if (!member.id || !member.name || !member.nachname) {
          res.status(400).json({ error: 'Each team member must have id, name, and nachname fields.' });
          return;
        }
        
        // Ensure projektId exists (can be empty string)
        if (member.projektId === undefined) {
          member.projektId = '';
        }
      }
      
      // Get current team members to detect changes
      const currentTeamMembers = loadTeamMembers();
      
      // Save team members
      saveTeamMembers(teamMembers);
      
      // Record activities for team changes
      const currentIds = currentTeamMembers.map(m => m.id);
      const newIds = teamMembers.map(m => m.id);
      
      // Find added members
      const addedMembers = teamMembers.filter(m => !currentIds.includes(m.id));
      addedMembers.forEach(member => {
        recordActivity('add', member);
      });
      
      // Find updated members (excluding newly added ones)
      const updatedMembers = teamMembers.filter(m => 
        currentIds.includes(m.id) && 
        JSON.stringify(m) !== JSON.stringify(currentTeamMembers.find(cm => cm.id === m.id))
      );
      updatedMembers.forEach(member => {
        recordActivity('edit', member);
      });
      
      // Find deleted members
      const deletedMembers = currentTeamMembers.filter(m => !newIds.includes(m.id));
      deletedMembers.forEach(member => {
        recordActivity('delete', member);
      });
      
      res.status(200).json({ message: 'Team members updated successfully', count: teamMembers.length });
    } catch (error) {
      console.error('Error updating team members:', error);
      res.status(500).json({ error: 'Failed to update team members', details: error.message });
    }
    return;
  }

  // If we get here, the method is not supported
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 