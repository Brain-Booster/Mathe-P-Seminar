import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Import the ModelViewer component with dynamic loading to prevent SSR issues
const ModelViewer = dynamic(() => import('../../components/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '400px', 
      width: '100%', 
      backgroundColor: '#1e1e1e', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#777'
    }}>
      Loading 3D model...
    </div>
  )
});

// Mock data for projects - this would typically come from an API or database
const projects = [
  {
    id: 1,
    title: 'Projekt Eins',
    description: 'Eine detaillierte Beschreibung des ersten Projekts und seiner Ziele. Dies erklärt, was das Projekt erreichen soll.',
    image: '/project1.jpg',
    technologies: ['React', 'Next.js', 'CSS'],
    category: 'Web-Entwicklung',
    completed: true,
    longDescription: 'Dies ist eine ausführliche Beschreibung des Projekts Eins. Hier würden wir detailliert auf die Funktionen, Ziele und die Implementierung des Projekts eingehen. Dieser Abschnitt gibt dem Besucher ein tieferes Verständnis davon, was das Projekt erreichen soll und wie es umgesetzt wurde.'
  },
  {
    id: 2,
    title: 'Projekt Zwei',
    description: 'Beschreibung des zweiten Projekts, die seine einzigartigen Funktionen und Implementierungsdetails hervorhebt.',
    image: '/project2.jpg',
    technologies: ['Python', 'TensorFlow', 'Data Science'],
    category: 'Maschinelles Lernen',
    completed: false,
    longDescription: 'Dies ist eine ausführliche Beschreibung des Projekts Zwei. Hier würden wir detailliert auf die Funktionen, Ziele und die Implementierung des Projekts eingehen. Dieser Abschnitt gibt dem Besucher ein tieferes Verständnis davon, was das Projekt erreichen soll und wie es umgesetzt wurde.'
  },
  {
    id: 3,
    title: 'Projekt Drei',
    description: 'Überblick über das dritte Projekt, das zeigt, wie es reale Probleme durch innovative Lösungen löst.',
    image: '/project3.jpg',
    technologies: ['Unity', 'C#', '3D-Modellierung'],
    category: 'Spieleentwicklung',
    completed: true,
    longDescription: 'Dies ist eine ausführliche Beschreibung des Projekts Drei. Hier würden wir detailliert auf die Funktionen, Ziele und die Implementierung des Projekts eingehen. Dieser Abschnitt gibt dem Besucher ein tieferes Verständnis davon, was das Projekt erreichen soll und wie es umgesetzt wurde.'
  },
  {
    id: 4,
    title: 'Projekt Vier',
    description: 'Erklärung des vierten Projekts und wie es moderne Technologie nutzt, um Benutzererfahrungen zu verbessern.',
    image: '/project4.jpg',
    technologies: ['Arduino', 'IoT', 'Embedded Systems'],
    category: 'Hardware',
    completed: false,
    longDescription: 'Dies ist eine ausführliche Beschreibung des Projekts Vier. Hier würden wir detailliert auf die Funktionen, Ziele und die Implementierung des Projekts eingehen. Dieser Abschnitt gibt dem Besucher ein tieferes Verständnis davon, was das Projekt erreichen soll und wie es umgesetzt wurde.'
  },
  {
    id: 5,
    title: 'Projekt Fünf',
    description: 'Details zum fünften Projekt, das seine technischen Herausforderungen und deren Überwindung zeigt.',
    image: '/project5.jpg',
    technologies: ['Mobile', 'React Native', 'Firebase'],
    category: 'Mobile-Entwicklung',
    completed: true,
    longDescription: 'Dies ist eine ausführliche Beschreibung des Projekts Fünf. Hier würden wir detailliert auf die Funktionen, Ziele und die Implementierung des Projekts eingehen. Dieser Abschnitt gibt dem Besucher ein tieferes Verständnis davon, was das Projekt erreichen soll und wie es umgesetzt wurde.'
  },
];

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const [project, setProject] = useState(null);

  useEffect(() => {
    // Find the project by ID when component mounts or ID changes
    if (id) {
      const projectId = parseInt(id);
      const foundProject = projects.find(p => p.id === projectId);
      setProject(foundProject);
    }
  }, [id]);

  if (!project) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1>Loading...</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{project.title} | Schulprojekt</title>
        <meta name="description" content={project.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <div style={{ maxWidth: '960px', width: '100%', padding: '0 1rem' }}>
          <Link 
            href="/projects"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              color: 'var(--text-color)',
              marginBottom: '1rem',
              fontSize: '0.95rem'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Zurück zu Projekten
          </Link>

          <h1 className={styles.title}>{project.title}</h1>

          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            flexWrap: 'wrap', 
            marginBottom: '2rem',
            marginTop: '0.75rem'
          }}>
            <span style={{ 
              fontSize: '0.85rem', 
              padding: '0.25rem 0.75rem', 
              backgroundColor: project.completed ? 'var(--accent-lime)' : 'var(--accent-yellow)', 
              color: '#222', 
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              {project.completed ? 'Abgeschlossen' : 'In Bearbeitung'}
            </span>
            
            <span style={{ 
              fontSize: '0.85rem', 
              padding: '0.25rem 0.75rem', 
              backgroundColor: 'var(--card-bg)', 
              color: 'var(--text-light)',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              fontWeight: '500'
            }}>
              {project.category}
            </span>
          </div>

          <div className={styles.projectDetailSection}>
            <h2>Projektbeschreibung</h2>
            <p>{project.longDescription}</p>
          </div>

          <div className={styles.projectDetailSection}>
            <h2>Verwendete Technologien</h2>
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap', 
              marginTop: '1rem'
            }}>
              {project.technologies.map((tech, index) => (
                <span key={index} style={{ 
                  fontSize: '0.85rem', 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: 'rgba(var(--accent-blue-rgb, 0, 163, 255), 0.15)', 
                  color: 'var(--accent-blue)',
                  borderRadius: '4px',
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {project.id === 1 && (
            <div className={styles.projectDetailSection}>
              <h2>3D-Modell</h2>
              <ModelViewer modelPath="/models/chair.glb" />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                Drehen Sie das Modell, indem Sie darauf klicken und ziehen.
              </p>
            </div>
          )}

          <div className={styles.projectDetailSection}>
            <h2>Weitere Informationen</h2>
            <p>Für weitere Informationen zu diesem Projekt kontaktieren Sie uns bitte über das Kontaktformular.</p>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .${styles.projectDetailSection} {
          margin-bottom: 2.5rem;
        }
        
        .${styles.projectDetailSection} h2 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: var(--heading-color);
        }
        
        .${styles.projectDetailSection} p {
          line-height: 1.6;
          color: var(--text-color);
        }
      `}</style>
    </div>
  );
}
