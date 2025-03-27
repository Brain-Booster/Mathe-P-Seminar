import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { mockProjects, getClientProjectsSync, getClientProjects } from '../../models.js';

// Dynamically load the ModelViewer component with no SSR
const ModelViewer = dynamic(() => import('../../components/ModelViewer'), { ssr: false });

// Use mockProjects for server-side rendering
const serverProjects = mockProjects;

// Script loading helper to prevent duplicate script loading
const useModelViewerScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded or if model-viewer is already defined
    if (document.querySelector('script[src*="model-viewer.min.js"]') || 
        customElements.get('model-viewer')) {
      setScriptLoaded(true);
      return;
    }

    // If not loaded, create and add the script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Clean up function - not removing the script as it needs to stay loaded
    };
  }, []);

  return scriptLoaded;
};

const ModelViewerComponent = ({ modelPath }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const scriptLoaded = useModelViewerScript();

  useEffect(() => {
    if (modelPath && scriptLoaded) {
      console.log("Model path:", modelPath);
      setLoading(false);
      
      // Check if the model-viewer element is defined in the browser
      const isModelViewerDefined = typeof window !== 'undefined' && 
        customElements && 
        customElements.get && 
        customElements.get('model-viewer');
      
      if (!isModelViewerDefined) {
        console.warn("model-viewer custom element is not defined");
        setError(true);
      }
    }
  }, [modelPath, scriptLoaded]);

  if (!scriptLoaded) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-light)'
      }}>
        Lade 3D-Viewer...
      </div>
    );
  }

  if (error) {
    return <p style={{ color: 'red' }}>Fehler beim Laden des Modells.</p>;
  }

  if (loading) {
    return <p>Modell wird geladen...</p>;
  }

  if (!modelPath) {
    return <p>Kein Modell verfügbar.</p>;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <model-viewer
      src={modelPath}
      alt="3D model"
      auto-rotate
      camera-controls
        style={{ width: '100%', height: '100%', display: 'block' }}
        onError={() => {
          setError(true);
          console.error("Error loading model:", modelPath);
        }}
    ></model-viewer>
    </div>
  );
};

export default function ProjectDetails({ projectId }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const router = useRouter();
  const { id } = router.query;
  const [enableModelViewer, setEnableModelViewer] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Default layout sections if none are defined in the project
  const defaultLayoutSections = [
    { id: 'header', type: 'header', title: 'Header', active: true },
    { id: 'description', type: 'text', title: 'Beschreibung', active: true },
    { id: 'technologies', type: 'tags', title: 'Technologien', active: true },
    { id: 'details', type: 'details', title: 'Details', active: true }
  ];
  
  // UseEffect to get the latest project data when component mounts or visibility changes
  useEffect(() => {
    const loadProject = async () => {
      const parsedId = projectId || (id ? parseInt(id) : null);
      if (parsedId) {
        // First set with sync data for immediate display
        if (typeof window !== 'undefined') {
          const initialProjects = getClientProjectsSync();
          const initialProject = initialProjects.find(p => p.id === parsedId);
          
          if (initialProject) {
            setProject(initialProject);
          } else {
            // Show a "project not found" message
            setProject(null);
          }
          
          // Then fetch fresh data from server
          try {
            const serverProjects = await getClientProjects();
            const serverProject = serverProjects.find(p => p.id === parsedId);
            
            if (serverProject) {
              setProject(serverProject);
            } else {
              // Project not found - this could happen if it was deleted
              console.warn(`Project with ID ${parsedId} not found in server data`);
              // Show a "project not found" message
              setProject(null);
            }
          } catch (error) {
            console.error('Error loading project from server:', error);
          }
        } else {
          // Server-side rendering - use server projects
          const serverProject = serverProjects.find(p => p.id === parsedId);
          setProject(serverProject || null);
        }
      }
      setLoading(false);
    };

    // Load project data initially
    loadProject();

    // Set up polling to periodically check for updates
    const intervalId = setInterval(async () => {
      try {
        const parsedId = projectId || (id ? parseInt(id) : null);
        if (parsedId) {
          const serverProjects = await getClientProjects();
          const serverProject = serverProjects.find(p => p.id === parsedId);
          
          // Only update if we found a project and it's different from the current one
          if (serverProject && JSON.stringify(serverProject) !== JSON.stringify(project)) {
            setProject(serverProject);
          }
        }
      } catch (error) {
        console.error('Error polling project data:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Refresh project data when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProject();
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Clean up
    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [projectId, id, router, project]);
  
  // UseEffect to safely enable model viewer after client-side hydration
  useEffect(() => {
    // Only enable model viewer on client-side
    if (typeof window !== 'undefined') {
      setEnableModelViewer(true);
    }
  }, []);
  
  // Helper function to render sections based on their type
  const renderSection = (section) => {
    if (!section.active) return null;
    
    switch (section.type) {
      case 'header':
        return (
          <div key={section.id} className="header-section" style={{ 
            width: '100%', 
            borderRadius: '8px', 
            overflow: 'hidden',
            marginBottom: '2rem',
            position: 'relative',
            height: '300px',
            backgroundColor: 'var(--bg-darker)',
            border: '1px solid var(--border-color)'
          }}>
            {project.image ? (
              <div style={{
                backgroundImage: `url(${project.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
                width: '100%'
              }} />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: 'var(--bg-darker)',
                color: 'var(--text-light)'
              }}>
                Kein Bild ausgewählt
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '1.5rem'
            }}>
              <h1 style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: '2rem',
                fontWeight: 'bold' 
              }}>
                {project.title}
              </h1>
              <p style={{ color: '#ddd', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                {project.description}
              </p>
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              color: 'var(--text-color)'
            }}>
              {section.content || project.longDescription || 'Keine Beschreibung verfügbar.'}
            </div>
          </div>
        );
        
      case 'tags':
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {project.technologies && project.technologies.length > 0 ? (
                project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)',
                      color: 'var(--accent-blue)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-light)' }}>
                  Keine Technologien angegeben
                </span>
              )}
            </div>
          </div>
        );
        
      case '3d-model':
        const modelPath = section.content || project.modelPath;
        if (!modelPath) return null;
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ 
              height: '400px', 
              backgroundColor: 'var(--bg-darker)', 
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {enableModelViewer ? (
                <ModelViewerComponent modelPath={modelPath} />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--bg-darker)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-light)'
                }}>
                  3D-Modell wird geladen...
                </div>
              )}
            </div>
            {section.description && (
              <div style={{ 
                marginTop: '1rem',
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                lineHeight: '1.6'
              }}>
                {section.description}
              </div>
            )}
          </div>
        );
        
      case 'details':
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Teammitglieder</h3>
                {project.team && project.team.length > 0 ? (
                  <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                    {project.team.map((member, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{member}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: 'var(--text-light)' }}>
                    Keine Teammitglieder angegeben
                  </span>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Zeitraum</h3>
                <p style={{ margin: 0 }}>
                  {project.timeline || 'Kein Zeitraum angegeben'}
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'image':
        if (!section.content) return null;
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ 
              borderRadius: '8px',
              overflow: 'visible',
              backgroundColor: 'var(--bg-darker)'
            }}>
              <img 
                src={section.content} 
                alt={section.title}
                style={{
                  width: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </div>
            {section.description && (
              <div style={{ 
                marginTop: '1rem',
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                lineHeight: '1.6'
              }}>
                {section.description}
              </div>
            )}
          </div>
        );
        
      case 'gallery':
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ 
              padding: '2rem',
              backgroundColor: 'var(--bg-darker)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-light)',
              minHeight: '200px'
            }}>
              {section.content ? (
                <div style={{ width: '100%', overflow: 'visible' }}>
                  <img 
                    src={section.content} 
                    alt={section.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: '100%',
                      display: 'block'
                    }}
                  />
                </div>
              ) : (
                "Galerie-Inhalt"
              )}
            </div>
          </div>
        );
        
      case 'pdf':
        if (!section.content) return null;
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ 
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-darker)',
              height: '500px'
            }}>
              <object
                data={section.content}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ borderRadius: '8px' }}
              >
                <div style={{ 
                  padding: '2rem',
                  backgroundColor: 'var(--bg-darker)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'var(--text-light)',
                  height: '100%'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <p>Ihr Browser kann dieses PDF nicht anzeigen.</p>
                  <a 
                    href={section.content} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--accent-blue)',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      marginTop: '1rem'
                    }}
                  >
                    PDF öffnen
                  </a>
                </div>
              </object>
            </div>
            {section.description && (
              <div style={{ 
                marginTop: '1rem',
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                lineHeight: '1.6'
              }}>
                {section.description}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Return loading state if the router isn't ready or project isn't found
  if (!router.isReady || loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main} style={{ height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>Projektdetails werden geladen...</h2>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main} style={{ height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>Projekt wurde nicht gefunden</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ backgroundColor: 'var(--bg-color)' }}>
      <Head>
        <title>{project.title} | Schulprojekt</title>
        <meta name="description" content={project.description} />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          :root {
            --bg-darker: #121212;
            --disabled-bg: rgba(255, 255, 255, 0.1);
            --disabled-text: rgba(255, 255, 255, 0.3);
            --text-light-rgb: 150, 150, 150;
            --accent-red: #ff4757;
            --accent-red-rgb: 255, 71, 87;
            --accent-yellow: #FFDD00;
            --accent-yellow-rgb: 255, 221, 0;
          }
          .card-section {
            background-color: var(--card-bg);
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border: 1px solid var(--border-color);
          }
          main h2 {
            margin-top: 0;
            margin-bottom: 1rem;
          }
        `}</style>
      </Head>

      <Header />

      <main className={styles.main} style={{ maxWidth: '1000px' }}>
        {/* Back Button */}
        <div style={{ width: '100%', marginBottom: '2rem' }}>
          <Link 
            href="/projects"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              color: 'var(--text-light)',
              fontSize: '0.95rem',
              transition: 'color 0.2s ease'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Zurück zu Projekten
          </Link>
        </div>
        
        <div style={{ width: '100%' }}>
          {/* Render sections according to layout configuration */}
          {(project.layoutSections || defaultLayoutSections)
            .filter(section => section.active)
            .map(section => renderSection(section))
          }
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  
  // Validate that id is a number
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    return {
      notFound: true, // This will return a 404 page
    };
  }

  // Return the parsed ID as a prop
  return {
    props: {
      projectId,
    },
  };
} 