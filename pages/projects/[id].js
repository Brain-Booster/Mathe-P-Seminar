import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getClientProjects } from '../../models/models.js';
import fs from 'fs';
import path from 'path';

// Dynamically load the ModelViewer component with no SSR
const ModelViewer = dynamic(() => import('../../components/ModelViewer'), { ssr: false });

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

// Add PdfViewer component for inline rendering
function PdfViewer({ url }) {
  const [blobUrl, setBlobUrl] = useState(null);
  useEffect(() => {
    let canceled = false;
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        if (!canceled) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(console.error);
    return () => { canceled = true; };
  }, [url]);
  if (!blobUrl) return <p>PDF wird geladen...</p>;
  return <embed src={blobUrl} type="application/pdf" width="100%" height="800px" className="pdf-viewer" />;
}

export default function ProjectDetails({ project }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const router = useRouter();
  const { id } = router.query;
  const [projectState, setProject] = useState(project);
  const [loading, setLoading] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  
  // Function to detect mobile or tablet
  useEffect(() => {
    const checkDevice = () => {
      // Function to check if device is iPad (handles new iOS versions)
      const isIPadOS = () => {
        return (
          // iPad on iOS 13+ reports as Macintosh
          navigator.platform === 'MacIntel' && 
          navigator.maxTouchPoints > 1 &&
          'ontouchend' in document
        );
      };

      const userAgent = navigator.userAgent.toLowerCase();
      // Multiple iPad detection methods combined
      const isIPad = 
        /(ipad)/i.test(userAgent) || 
        (/(macintosh)/i.test(userAgent) && 'ontouchend' in document) ||
        isIPadOS() ||
        (navigator.platform === 'iPad');
        
      const isTablet = /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
      const isMobile = /iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Set to true if any detection method finds a mobile/tablet device
      setIsMobileOrTablet(isIPad || isTablet || isMobile || window.innerWidth <= 768);
      
      // Log detection results (for debugging)
      console.log("Device detection:", { isIPad, isTablet, isMobile, width: window.innerWidth });
    };
    
    if (typeof window !== 'undefined') {
      checkDevice();
      window.addEventListener('resize', checkDevice);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkDevice);
      }
    };
  }, []);
  
  // Default layout sections if none are defined in the project
  const defaultLayoutSections = [
    { id: 'header', type: 'header', title: 'Header', active: true },
    { id: 'project-info', type: 'project-info', title: 'Projekt-Informationen', active: true },
    { id: 'description', type: 'text', title: 'Beschreibung', active: true },
    { id: 'technologies', type: 'tags', title: 'Technologien', active: true },
    { id: 'details', type: 'details', title: 'Details', active: true }
  ];
  
  // UseEffect to get the latest project data when component mounts or visibility changes
  useEffect(() => {
    const fetchProject = async () => {
      const parsedId = id ? parseInt(id) : null;
      if (!parsedId) return;
      try {
        const serverProjects = await getClientProjects();
        const found = serverProjects.find(p => p.id === parsedId);
        setProject(found || null);
      } catch (error) {
        console.error('Error loading project from server:', error);
      }
    };
    if (typeof window !== 'undefined') fetchProject();
  }, [id]);
  
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
            {projectState.image ? (
              <div style={{
                backgroundImage: `url(${projectState.image})`,
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
                {projectState.title}
              </h1>
              <p style={{ color: '#ddd', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                {projectState.description}
              </p>
            </div>
          </div>
        );
        
      case 'project-info':
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ 
              lineHeight: '1.6',
              color: 'var(--text-color)'
            }}>
              <p>
                Dieses Projekt zeigt die Modellierung eines mathematischen Stuhls in Blender mit Fokus auf geometrische Präzision und ästhetisches Design. Der Stuhl wurde mit Subdivision Surface-Techniken erstellt, um eine glatte und realistische Darstellung zu erreichen.
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
              {section.content || projectState.longDescription || 'Keine Beschreibung verfügbar.'}
            </div>
          </div>
        );
        
      case 'tags':
        return (
          <div key={section.id} className="card-section">
            <h2>{section.title}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {projectState.technologies && projectState.technologies.length > 0 ? (
                projectState.technologies.map((tech, index) => (
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
        const modelPath = section.content || projectState.modelPath;
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
              {/* Directly render viewer; it loads script and triggers render */}
              <ModelViewerComponent modelPath={modelPath} />
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
                {projectState.team && projectState.team.length > 0 ? (
                  <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                    {projectState.team.map((member, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        <Link 
                          href={`/team?member=${encodeURIComponent(member)}`}
                          style={{
                            color: 'var(--accent-blue)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {member}
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </Link>
                      </li>
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
                  {projectState.timeline || 'Kein Zeitraum angegeben'}
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
            <div className="pdf-container">
              <PdfViewer url={section.content} />
              <div className="pdf-fallback">
                <p>Ihr Browser unterstützt kein PDF. <a href={section.content} target="_blank" rel="noreferrer" className="pdf-download-button">PDF herunterladen</a></p>
              </div>
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
  
  if (!projectState) {
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
        <title>{projectState.title} | Schulprojekt</title>
        <meta name="description" content={projectState.description} />
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
          
          /* PDF Viewer Styles */
          .pdf-container {
            position: relative;
            width: 100%;
            height: auto;
            border-radius: 8px;
            overflow: hidden;
            background-color: var(--bg-darker);
            display: block;
          }
          
          .pdf-viewer {
            border-radius: 8px;
            height: auto;
            min-height: 800px;
            display: block;
          }
          
          .pdf-iframe {
            border: none !important;
            height: 800px !important;
            min-height: 800px !important;
            border-radius: 0 !important;
            overflow: scroll !important;
            -webkit-overflow-scrolling: touch !important; /* This is crucial for iPad scrolling */
          }
          
          .pdf-embed {
            height: 800px !important;
            width: 100% !important; 
            display: block !important;
            border: none !important;
          }
          
          .pdf-fallback {
            padding: 2rem;
            background-color: var(--bg-darker);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: var(--text-light);
            height: 100%;
          }
          
          .mobile-only {
            display: none;
          }
          
          .mobile-tablet-only {
            display: none;
          }
          
          .desktop-only {
            display: block;
          }
          
          .pdf-download-button {
            padding: 0.5rem 1rem;
            background-color: var(--accent-blue);
            color: white;
            border-radius: 4px;
            text-decoration: none;
            margin-top: 1rem;
            display: inline-block;
            text-align: center;
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .pdf-container {
              display: none !important;
            }
            
            .pdf-viewer, .pdf-embed {
              display: none !important;
            }
            
            .desktop-only {
              display: none !important;
            }
            
            .mobile-tablet-only {
              display: flex !important;
            }
            
            .pdf-fallback {
              display: flex !important;
              min-height: 250px;
            }
            
            .pdf-download-button {
              width: 80%;
              max-width: 300px;
              margin-top: 1rem;
              padding: 0.75rem 1rem;
              font-size: 1rem;
            }
          }
          
          /* Special iPad targeting */
          @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
            .pdf-container {
              display: none !important;
            }
            
            .pdf-viewer, .pdf-embed {
              display: none !important;
            }
            
            .pdf-fallback {
              display: flex !important;
            }
          }
          
          /* Ensure PDFs don't display on touch devices as an additional safety measure */
          @media (pointer: coarse) {
            .pdf-container {
              display: none !important;
            }
            
            .pdf-viewer, .pdf-embed {
              display: none !important;
            }
            
            .pdf-fallback {
              display: flex !important;
            }
          }
          
          @media (max-width: 480px) {
            /* On mobile, hide the PDF viewer and show only download button */
            .pdf-container {
              height: auto;
              min-height: 200px;
            }
            
            .pdf-viewer {
              display: none;
            }
            
            .pdf-fallback {
              display: flex !important;
            }
            
            .mobile-only {
              display: flex !important;
            }
            
            .pdf-download-button {
              width: 80%;
              max-width: 300px;
              margin-top: 1rem;
              padding: 0.75rem 1rem;
              font-size: 1rem;
            }
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
          {(projectState.layoutSections || defaultLayoutSections)
            .filter(section => section.active)
            .map(section => renderSection(section))
          }
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const id = parseInt(params.id);
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  let projects = [];
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    projects = JSON.parse(data);
  } catch {
    projects = [];
  }
  const project = projects.find(p => p.id === id) || null;
  if (!project) return { notFound: true };
  return { props: { project } };
}