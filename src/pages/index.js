import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Schulprojekt</title>
        <meta name="description" content="Mein tolles Schulprojekt" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>
          Willkommen zu meinem Schulprojekt!
        </h1>

        <p className={styles.description}>
          Dies ist eine Website für mein Schulprojekt, erstellt mit Next.js
        </p>

        <h2 className={styles.sectionTitle}>
          Unsere Projekte
        </h2>
        
        <div className={styles.projectGrid}>
          {/* Project 1 */}
          <div className={styles.projectCard}>
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
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#e0e0e0' }}>3D Stuhl-Modellierung</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#bbb', lineHeight: '1.5' }}>Ein mathematischer Stuhl, modelliert in Blender mit Subdivision Surface Technik</p>
            <a href="/projects/1" style={{ color: '#0070f3', fontSize: '0.95rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}>
              Projekt ansehen 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
          
          {/* Project 2 */}
          <div className={styles.projectCard}>
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
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#e0e0e0' }}>Projekt 2</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#bbb', lineHeight: '1.5' }}>Kurzbeschreibung von Projekt 2</p>
            <a href="/projects/2" style={{ color: '#0070f3', fontSize: '0.95rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}>
              Projekt ansehen 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
          
          {/* Project 3 */}
          <div className={styles.projectCard}>
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#e0e0e0' }}>Projekt 3</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#bbb', lineHeight: '1.5' }}>Kurzbeschreibung von Projekt 3</p>
            <a href="/projects/3" style={{ color: '#0070f3', fontSize: '0.95rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}>
              Projekt ansehen 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
          
          {/* Project 4 */}
          <div className={styles.projectCard}>
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
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#e0e0e0' }}>Projekt 4</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#bbb', lineHeight: '1.5' }}>Kurzbeschreibung von Projekt 4</p>
            <a href="/projects/4" style={{ color: '#0070f3', fontSize: '0.95rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}>
              Projekt ansehen 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
          
          {/* Project 5 */}
          <div className={styles.projectCard}>
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#e0e0e0' }}>Projekt 5</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#bbb', lineHeight: '1.5' }}>Kurzbeschreibung von Projekt 5</p>
            <a href="/projects/5" style={{ color: '#0070f3', fontSize: '0.95rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}>
              Projekt ansehen 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
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