import Head from 'next/head';
import styles from '../styles/Projects.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { mockProjects, getClientProjectsSync, getClientProjects } from '../models.js';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Alle');

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
          overflow: 'visible',
          width: '100%'
        }}>
          {filteredProjects.map(project => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <div className={styles.projectCard}>
                <div className={styles.projectImageContainer}>
                  <div className={styles.projectImage}>
                    {/* Project image placeholder */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  {project.completed && (
                    <div className={styles.completedBadge}>
                      Abgeschlossen
                    </div>
                  )}
                </div>
                <div className={styles.projectContent}>
                  <h2 className={styles.projectTitle}>{project.title}</h2>
                  <p className={styles.projectDescription}>{project.description}</p>
                  <div className={styles.projectMeta}>
                    <div className={styles.projectCategory}>{project.category}</div>
                    {project.team && project.team.length > 0 && (
                      <div className={styles.projectTeam}>
                        Team: {project.team.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
} 