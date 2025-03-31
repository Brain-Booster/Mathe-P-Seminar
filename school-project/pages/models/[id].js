import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { mockModels } from '../../models.js';

// Import ThreeJsViewer with SSR disabled
const ThreeJsViewer = dynamic(() => import('../../components/ThreeJsViewer'), { ssr: false });

export default function ModelView() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const router = useRouter();
  const { id } = router.query;
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    // In a real app, fetch the model data from an API
    // For now, we'll use mock data
    setLoading(true);
    
    // Find the model in our mock data
    setTimeout(() => {
      const foundModel = mockModels.find(m => m.id.toString() === id.toString());
      
      if (foundModel) {
        setModel({
          ...foundModel,
          description: 'Ein 3D-Modell eines mathematischen Stuhls, modelliert mit präziser Geometrie und optimiert für Web-Darstellung.'
        });
      } else {
        setError('Modell nicht gefunden');
      }
      setLoading(false);
    }, 500);
  }, [id]);

  return (
    <div className={styles.container}>
      <Head>
        <title>{model ? `${model.name} | 3D-Modell Ansicht` : 'Modell Ansicht'}</title>
        <meta name="description" content="3D-Modell Anzeige und Interaktion" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main} style={{ padding: '2rem 0' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Navigation */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Link 
              href="/contact/models"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                transition: 'background-color 0.2s',
                backdropFilter: 'blur(10px)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Zurück zur Übersicht
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  animation: 'rotate 2s linear infinite',
                  margin: '0 auto 1rem'
                }}
              >
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              <p>Modell wird geladen...</p>
            </div>
          ) : error ? (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              backgroundColor: 'var(--card-bg)',
              borderRadius: '8px'
            }}>
              <p style={{ color: 'var(--accent-red)' }}>{error}</p>
              <p>Bitte versuchen Sie es später erneut oder wählen Sie ein anderes Modell.</p>
            </div>
          ) : model && (
            <>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h1 style={{ 
                  fontSize: '2rem', 
                  margin: 0,
                  color: 'var(--title-color)'
                }}>
                  {model.name}
                </h1>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  Hochgeladen am: {model.dateUploaded}
                </div>
              </div>

              {/* Model viewer - full height for immersive experience */}
              <div style={{ 
                height: 'calc(100vh - 300px)', 
                minHeight: '500px',
                backgroundColor: 'var(--bg-darker)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '2rem'
              }}>
                <ThreeJsViewer
                  modelPath={model.path}
                  width="100%"
                  height="100%"
                />
              </div>

              {/* Model info */}
              <div style={{ 
                backgroundColor: 'var(--card-bg)',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h2 style={{ 
                  fontSize: '1.25rem',
                  marginTop: 0,
                  marginBottom: '1rem'
                }}>
                  Über dieses Modell
                </h2>
                <p style={{ margin: 0 }}>
                  {model.description}
                </p>
                
                <div style={{ 
                  marginTop: '1.5rem',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)',
                    color: 'var(--accent-blue)',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    3D-Modell
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(var(--accent-green-rgb), 0.1)',
                    color: 'var(--accent-green)',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    {model.path.split('.').pop().toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                <p>
                  <strong>Bedienung:</strong> Verwenden Sie die Maus zum Drehen und Zoomen. Klicken und ziehen Sie, um das Modell zu drehen,
                  scrollen Sie, um zu zoomen, und halten Sie die Umschalttaste gedrückt, während Sie ziehen, um das Modell zu verschieben.
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 