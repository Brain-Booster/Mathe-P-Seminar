import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';
import Link from 'next/link';

// Mock data for projects - this would typically come from an API or database
const projects = [
  {
    id: 1,
    title: 'Projekt Eins',
    description: 'Eine detaillierte Beschreibung des ersten Projekts und seiner Ziele. Dies erklärt, was das Projekt erreichen soll.',
    image: '/project1.jpg',
    technologies: ['React', 'Next.js', 'CSS'],
    category: 'Web-Entwicklung',
    completed: true
  },
  {
    id: 2,
    title: 'Projekt Zwei',
    description: 'Beschreibung des zweiten Projekts, die seine einzigartigen Funktionen und Implementierungsdetails hervorhebt.',
    image: '/project2.jpg',
    technologies: ['Python', 'TensorFlow', 'Data Science'],
    category: 'Maschinelles Lernen',
    completed: false
  },
  {
    id: 3,
    title: 'Projekt Drei',
    description: 'Überblick über das dritte Projekt, das zeigt, wie es reale Probleme durch innovative Lösungen löst.',
    image: '/project3.jpg',
    technologies: ['Unity', 'C#', '3D-Modellierung'],
    category: 'Spieleentwicklung',
    completed: true
  },
  {
    id: 4,
    title: 'Projekt Vier',
    description: 'Erklärung des vierten Projekts und wie es moderne Technologie nutzt, um Benutzererfahrungen zu verbessern.',
    image: '/project4.jpg',
    technologies: ['Arduino', 'IoT', 'Embedded Systems'],
    category: 'Hardware',
    completed: false
  },
  {
    id: 5,
    title: 'Projekt Fünf',
    description: 'Details zum fünften Projekt, das seine technischen Herausforderungen und deren Überwindung zeigt.',
    image: '/project5.jpg',
    technologies: ['Mobile', 'React Native', 'Firebase'],
    category: 'Mobile-Entwicklung',
    completed: true
  },
];

export default function Projects() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className={styles.container}>
      <Head>
        <title>Unsere Projekte | Schulprojekt</title>
        <meta name="description" content="Entdecken Sie unsere Schulprojekte" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>Unsere Projekte</h1>
        
        <p className={styles.description}>
          Entdecken Sie die verschiedenen Projekte, an denen wir arbeiten
        </p>
        
        {/* Filter/Category Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          margin: '2rem 0',
          flexWrap: 'wrap'
        }}>
          <button style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-light)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}>Alle Projekte</button>
          <button style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-light)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}>Web-Entwicklung</button>
          <button style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-light)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}>Maschinelles Lernen</button>
          <button style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-light)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}>Sonstiges</button>
        </div>

        {/* Projects Grid */}
        <div className={styles.projectGrid}>
          {projects.map((project) => (
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: '0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--heading-color)' }}>{project.title}</h3>
                <span style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.2rem 0.5rem', 
                  backgroundColor: project.completed ? 'var(--accent-lime)' : 'var(--accent-yellow)', 
                  color: '#222', 
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  {project.completed ? 'Abgeschlossen' : 'In Bearbeitung'}
                </span>
              </div>
              
              <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: '1.5' }}>
                {project.description}
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                flexWrap: 'wrap', 
                marginBottom: '1rem' 
              }}>
                {project.technologies.map((tech, index) => (
                  <span key={index} style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.15rem 0.5rem', 
                    backgroundColor: 'rgba(var(--accent-blue-rgb, 0, 163, 255), 0.15)', 
                    color: 'var(--accent-blue)',
                    borderRadius: '4px',
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
              
              <Link 
                href={`/projects/${project.id}`}
                style={{ color: 'var(--accent-blue)', fontSize: '0.95rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}
              >
                Details anzeigen 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
} 