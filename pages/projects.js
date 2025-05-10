import Head from 'next/head';
import styles from '../styles/Projects.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { mockProjects, getClientProjectsSync, getClientProjects } from '../models/models';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Alle');
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Load projects from server API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // First set with sync data for immediate display
        setProjects(getClientProjectsSync());
        
        // Then fetch latest data from server
        const serverProjects = await getClientProjects();
        setProjects(serverProjects);
        console.log('Projects loaded:', serverProjects.length);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    // Load projects initially
    loadProjects();

    // Set up polling to refresh data periodically
    const intervalId = setInterval(async () => {
      try {
        const serverProjects = await getClientProjects();
        setProjects(serverProjects);
      } catch (error) {
        console.error('Error polling projects:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Set up visibility change event to refresh projects when the page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProjects();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Extract unique categories from projects
  const categories = ['Alle', ...Array.from(new Set(projects.map(p => p.category)))];

  // Filter projects based on active category
  const filteredProjects = activeCategory === 'Alle' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  // Toggle description expansion
  const toggleDescription = (projectId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Projekte | Schulprojekt</title>
        <meta name="description" content="Alle Projekte unseres Schulprojekts" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Alle Projekte</h1>
          <p className={styles.subtitle}>Entdecke unsere verschiedenen Projekte</p>
        </div>

        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button 
              key={category}
              className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.projectGrid} style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          width: '100%'
        }}>
          {filteredProjects.map(project => (
            <div className={styles.projectCard} key={project.id} style={{
              width: '250px',
              overflow: 'hidden',
              borderRadius: '12px',
              backgroundColor: 'var(--card-bg)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              border: 'none'
            }}>
              <div style={{
                height: '160px',
                backgroundColor: '#1e1e1e',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #333',
                borderRadius: '6px',
                margin: '12px 12px 0 12px'
              }}>
                {project.image ? (
                  <img 
                    src={project.image} 
                    alt={project.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                )}
              </div>
              <div style={{
                padding: '1.5rem'
              }}>
                <h3 style={{ 
                  margin: '0 0 0.5rem', 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: 'var(--heading-color)' 
                }}>{project.title}</h3>
                <p 
                  style={{ 
                    margin: '0 0 1rem', 
                    fontSize: '0.95rem', 
                    color: 'var(--text-color)', 
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: expandedDescriptions[project.id] ? 'normal' : 'nowrap',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleDescription(project.id)}
                >
                  {project.description}
                  {!expandedDescriptions[project.id] && project.description?.length > 50 && '...'}
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  flexWrap: 'wrap', 
                  marginBottom: '1rem' 
                }}>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)', 
                    color: 'var(--accent-blue)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    display: 'inline-block',
                    width: 'fit-content'
                  }}>{project.category}</div>
                </div>
                <Link 
                  href={`/projects/${project.id}`}
                  style={{ 
                    color: 'var(--accent-blue)', 
                    fontSize: '0.95rem', 
                    fontWeight: '500', 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    textDecoration: 'none'
                  }}
                >
                  Projekt ansehen
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
} 