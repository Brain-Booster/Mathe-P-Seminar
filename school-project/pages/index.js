import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mockProjects, getClientProjectsSync, getClientProjects } from '../models.js';

export default function Home() {
  const [projects, setProjects] = useState([]);
  
  // Load the latest projects from server API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // First set with sync data for immediate display
        setProjects(getClientProjectsSync());
        
        // Then fetch latest data from server
        const serverProjects = await getClientProjects();
        setProjects(serverProjects);
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

  return (
    <div className={styles.container}>
      <Head>
        <title>Effner Mathe P-Seminar</title>
        <meta name="description" content="Mathe P-Seminar von dem Joseph-Effner-Gymnasium 2025" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>
          Willkommen zum Mathe P-Seminar!
        </h1>

        <p className={styles.description}>
          Das ist eine Webseite für das Mathe P-Seminar von dem Joseph-Effner-Gymnasium 2025.
        </p>

        <h2 className={styles.sectionTitle}>
          Unsere Projekte
        </h2>
        
        <div className={styles.projectGrid}>
          {/* Display up to 5 projects from the mockProjects array */}
          {projects.slice(0, 5).map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div style={{ 
                height: '160px', 
                backgroundColor: '#1e1e1e', 
                borderRadius: '6px', 
                marginBottom: '1.2rem',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#e0e0e0' }}>
                {project.title}
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#bbb', lineHeight: '1.5' }}>
                {project.description}
              </p>
              <Link 
                href={`/projects/${project.id}`}
                style={{ color: '#0070f3', fontSize: '0.95rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}
              >
                Projekt ansehen 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/projects" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-lime))', 
            color: '#222',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0, 163, 255, 0.4)',
            transition: 'all 0.3s ease'
          }}>
            Alle Projekte ansehen
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
} 