import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import Link from 'next/link';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { mockModels } from '../../models.js';

// Import ThreeJsViewer with SSR disabled
const ThreeJsViewer = dynamic(() => import('../../components/ThreeJsViewer'), { ssr: false });

export default function ModelsAdmin() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [projectId, setProjectId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // We'll use the mock data from models.js
  useEffect(() => {
    setModels(mockModels);
  }, []);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'model');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      // Add the new model to the list
      const fileName = file.name;
      const newModel = {
        id: models.length > 0 ? Math.max(...models.map(m => m.id)) + 1 : 1,
        name: fileName,
        path: data.fileUrl,
        dateUploaded: new Date().toISOString().split('T')[0]
      };
      
      setModels([...models, newModel]);
      setSelectedModel(newModel);
      setSuccessMessage('Model erfolgreich hochgeladen!');
      setFile(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error uploading model:', error);
      alert('Fehler beim Hochladen des 3D-Modells. Bitte versuchen Sie es erneut.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleAssignToProject = () => {
    if (!selectedModel || !projectId) {
      return;
    }
    
    // In a real app, this would make an API call to associate the model with the project
    alert(`Model "${selectedModel.name}" wurde dem Projekt ${projectId} zugewiesen.`);
    
    // Reset form
    setProjectId('');
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>3D-Modelle verwalten | Schulprojekt</title>
        <meta name="description" content="Hochladen und Verwalten von 3D-Modellen für Projekte" />
        <link rel="icon" href="/favicon.ico" />
        <Script 
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js" 
          type="module"
          strategy="beforeInteractive"
        />
      </Head>

      <Header />

      <main className={styles.main}>
        <div style={{ width: '100%', marginBottom: '2rem' }}>
          <Link 
            href="/admin"
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
            Zurück zum Admin-Bereich
          </Link>
        </div>

        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 1.5rem', 
          color: 'var(--title-color)',
          fontWeight: 700
        }}>
          3D-Modelle verwalten
        </h1>
        
        {successMessage && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(0, 200, 0, 0.1)',
            border: '1px solid rgba(0, 200, 0, 0.3)',
            borderRadius: '5px',
            marginBottom: '20px',
            color: '#00c000'
          }}>
            {successMessage}
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', width: '100%' }}>
          {/* Left column - Upload and model list */}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Neues Modell hochladen</h2>
            
            {/* Model uploader */}
            <div style={{ 
              border: '2px dashed #666',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <p style={{ marginTop: 0 }}>3D-Modell hochladen</p>
              <p style={{ fontSize: '0.9rem', color: '#888', margin: '10px 0' }}>
                Unterstützte Formate: GLB, GLTF, OBJ, STL, FBX (max. 100MB)
              </p>
              
              <form onSubmit={handleUpload}>
                <label style={{
                  display: 'inline-block',
                  padding: '10px 15px',
                  backgroundColor: 'var(--accent-blue)',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginBottom: '15px'
                }}>
                  Datei auswählen
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    accept=".glb,.gltf,.obj,.stl,.fbx"
                  />
                </label>
                
                {file && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    marginBottom: '15px'
                  }}>
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={!file || isUploading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: file ? 'var(--accent-green)' : '#555',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: file ? 'pointer' : 'not-allowed',
                    opacity: file ? 1 : 0.7
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Hochladen'}
                </button>
              </form>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Hochgeladene Modelle</h2>
            {models.length === 0 ? (
              <p>Keine Modelle vorhanden</p>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '10px' 
              }}>
                {models.map(model => (
                  <div 
                    key={model.id}
                    style={{ 
                      padding: '15px',
                      backgroundColor: selectedModel?.id === model.id 
                        ? 'rgba(var(--accent-blue-rgb), 0.1)' 
                        : 'var(--card-bg)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedModel?.id === model.id 
                        ? '1px solid var(--accent-blue)' 
                        : '1px solid transparent'
                    }}
                    onClick={() => setSelectedModel(model)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px', fontSize: '1.1rem' }}>{model.name}</h3>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                          Hochgeladen am: {model.dateUploaded}
                        </p>
                      </div>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right column - Preview and assign */}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Modell-Vorschau</h2>
            {selectedModel ? (
              <>
                <div style={{ 
                  height: '300px', 
                  borderRadius: '8px', 
                  marginBottom: '1.5rem',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-darker)'
                }}>
                  <ThreeJsViewer
                    modelPath={selectedModel.path}
                    width="100%"
                    height="100%"
                  />
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1.5rem'
                }}>
                  <Link
                    href={`/models/${selectedModel.id}`}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--accent-green)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Im Vollbildmodus anzeigen
                  </Link>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Einem Projekt zuweisen</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    value={projectId} 
                    onChange={(e) => setProjectId(e.target.value)}
                    style={{
                      padding: '10px',
                      borderRadius: '5px',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      border: '1px solid #555',
                      flex: 1
                    }}
                  >
                    <option value="">Projekt auswählen</option>
                    <option value="1">3D Stuhl-Modellierung</option>
                    <option value="2">Projekt Zwei</option>
                    <option value="3">Projekt Drei</option>
                    <option value="4">Projekt Vier</option>
                    <option value="5">Projekt Fünf</option>
                  </select>
                  
                  <button
                    onClick={handleAssignToProject}
                    disabled={!projectId}
                    style={{
                      padding: '10px 15px',
                      backgroundColor: 'var(--accent-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: projectId ? 'pointer' : 'not-allowed',
                      opacity: projectId ? 1 : 0.5
                    }}
                  >
                    Zuweisen
                  </button>
                </div>
              </>
            ) : (
              <div style={{ 
                height: '300px', 
                borderRadius: '8px', 
                backgroundColor: 'var(--card-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '20px',
                textAlign: 'center'
              }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginBottom: '15px', color: 'var(--text-light)' }}
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                <p>Wählen Sie ein Modell aus der Liste aus, um die Vorschau anzuzeigen</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 