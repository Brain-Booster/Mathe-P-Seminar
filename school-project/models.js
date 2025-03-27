// Default mock data for projects - only used if server request fails
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
  },
  {
    id: 3,
    title: 'KI-gesteuerter Roboter',
    description: 'Ein autonomer Roboter, der durch maschinelles Lernen gesteuert wird.',
    longDescription: 'Unser Team hat einen autonomen Roboter entwickelt, der durch Algorithmen des maschinellen Lernens gesteuert wird. Der Roboter kann seine Umgebung wahrnehmen, Hindernisse erkennen und selbstständig navigieren. Durch Reinforcement Learning verbessert er kontinuierlich seine Fähigkeiten.',
    image: '/project3.jpg',
    technologies: ['Python', 'TensorFlow', 'Robotik', 'Reinforcement Learning'],
    category: 'Künstliche Intelligenz',
    completed: false,
    modelPath: '',
    team: ['Max Mustermann', 'Anna Weber', 'Tim Meier'],
    timeline: 'September 2023 - laufend',
    github: 'https://github.com/example/ai-robot'
  },
  {
    id: 4,
    title: '3D-Gebäudemodell',
    description: 'Detailliertes 3D-Modell eines historischen Gebäudes.',
    longDescription: 'Dieses Projekt umfasst die Erstellung eines detaillierten 3D-Modells eines historischen Gebäudes aus unserer Stadt. Mit Photogrammetrie und manueller Modellierung haben wir eine präzise digitale Repräsentation erstellt, die für Bildungszwecke und virtuelle Touren verwendet werden kann.',
    image: '/project4.jpg',
    technologies: ['Blender', 'Photogrammetrie', '3D-Modellierung', 'Texturierung'],
    category: '3D-Design',
    completed: true,
    modelPath: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/BoxInterleaved/glTF-Binary/BoxInterleaved.glb',
    team: ['Sarah Klein', 'Markus Becker'],
    timeline: 'Mai 2023 - August 2023',
    github: 'https://github.com/example/historic-building-3d'
  },
  {
    id: 5,
    title: 'Mobile App für Nachhaltigkeit',
    description: 'Eine App, die hilft, den persönlichen CO2-Fußabdruck zu reduzieren.',
    longDescription: 'Unsere mobile Anwendung hilft Benutzern, ihren täglichen CO2-Fußabdruck zu verfolgen und zu reduzieren. Mit personalisierten Tipps, Herausforderungen und einem Belohnungssystem motiviert die App zu umweltbewusstem Verhalten im Alltag.',
    image: '/project5.jpg',
    technologies: ['React Native', 'Firebase', 'UI/UX Design'],
    category: 'Mobile Entwicklung',
    completed: true,
    modelPath: '',
    team: ['Laura Schulz', 'David Kim'],
    timeline: 'Februar 2023 - Juli 2023',
    github: 'https://github.com/example/eco-footprint-app'
  },
  {
    id: 6,
    title: 'Datenbankgestütztes Schulverwaltungssystem',
    description: 'Ein System zur effizienten Verwaltung von Schulressourcen und -prozessen.',
    longDescription: 'Dieses Projekt umfasst die Entwicklung eines umfassenden Schulverwaltungssystems. Es ermöglicht die effiziente Verwaltung von Schülerdaten, Stundenplanung, Ressourcenzuweisung und Kommunikation zwischen Lehrern, Schülern und Eltern durch eine benutzerfreundliche Weboberfläche.',
    image: '/project6.jpg',
    technologies: ['MySQL', 'PHP', 'Laravel', 'Bootstrap'],
    category: 'Web-Entwicklung',
    completed: false,
    modelPath: '',
    team: ['Jonas Weber', 'Emma Schmidt', 'Felix Müller'],
    timeline: 'Oktober 2023 - laufend',
    github: 'https://github.com/example/school-management-system'
  }
];

// Cache for server projects
let projectsCache = null;
let lastFetchTime = 0;
const CACHE_EXPIRATION = 10000; // 10 seconds in milliseconds

// Export initial projects - will be updated after fetching from server
export let mockProjects = defaultProjects;

// Fetch projects from the server
const fetchProjects = async () => {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    const data = await response.json();
    projectsCache = data;
    lastFetchTime = Date.now();
    mockProjects = data; // Update the exported mockProjects variable
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return projectsCache || defaultProjects;
  }
};

// Initialize client-side projects after mount
if (typeof window !== 'undefined') {
  // Use an IIFE to avoid top-level code execution during SSR
  (function initClientSideProjects() {
    fetchProjects().catch(console.error);
  })();
}

// Function to get projects from the server - used by all project listing pages
export const getClientProjects = async () => {
  if (typeof window !== 'undefined') {
    // If the cache is fresh, return it
    if (projectsCache && Date.now() - lastFetchTime < CACHE_EXPIRATION) {
      return projectsCache;
    }
    
    // Otherwise fetch fresh data
    return await fetchProjects();
  }
  return defaultProjects;
};

// Synchronous version that returns immediate data (for use in components)
export const getClientProjectsSync = () => {
  if (typeof window !== 'undefined') {
    // If we have cached data, use it
    if (projectsCache) {
      return projectsCache;
    }
    // Otherwise use defaults and trigger an async fetch
    fetchProjects().catch(console.error);
    return defaultProjects;
  }
  return defaultProjects;
};

// Function to update projects and save to the server - used by admin page
export const updateMockProjects = async (projects) => {
  if (typeof window !== 'undefined') {
    try {
      // Update the cache immediately for responsive UI
      projectsCache = projects;
      mockProjects = projects;
      
      // Then send to the server
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projects),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update projects on server');
      }
      
      console.log('Projects updated successfully on server:', projects.length, 'projects saved');
      return projects;
    } catch (error) {
      console.error('Error updating projects on server:', error);
      return projects;
    }
  }
  return projects;
};

// Mock data for 3D models
export const mockModels = [
  { 
    id: 1, 
    name: 'Duck Model',
    description: 'A simple duck model for testing',
    path: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Duck/glTF-Binary/Duck.glb',
    thumbnail: '/model-thumbnails/duck.png',
    dateUploaded: '2023-05-15',
    fileType: 'glb'
  },
  { 
    id: 2, 
    name: 'Box Model',
    description: 'Simple interleaved box for testing',
    path: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/BoxInterleaved/glTF-Binary/BoxInterleaved.glb',
    thumbnail: '/model-thumbnails/box.png',
    dateUploaded: '2023-08-23',
    fileType: 'glb'
  },
  {
    id: 3,
    name: 'Damaged Helmet',
    description: 'Damaged Helmet model with PBR materials',
    path: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '/model-thumbnails/helmet.png',
    dateUploaded: '2023-09-10',
    fileType: 'glb'
  }
]; 