import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Mock project data for dropdown - would come from an API in a real app
const projects = [
  { id: 1, title: '3D Stuhl-Modellierung' },
  { id: 2, title: 'Projekt Zwei' },
  { id: 3, title: 'Projekt Drei' },
  { id: 4, title: 'Projekt Vier' },
  { id: 5, title: 'Projekt Fünf' },
];

// Mock existing images - would come from an API in a real app
const initialImages = [
  { id: 1, name: 'project1.jpg', projectId: 1, uploadDate: '2023-03-15', size: '420 KB' },
  { id: 2, name: 'project2.jpg', projectId: 2, uploadDate: '2023-03-10', size: '384 KB' },
  { id: 3, name: 'project3.jpg', projectId: 3, uploadDate: '2023-02-28', size: '512 KB' },
  { id: 4, name: 'project4.jpg', projectId: 4, uploadDate: '2023-03-05', size: '468 KB' },
  { id: 5, name: 'project5.jpg', projectId: 5, uploadDate: '2023-03-12', size: '396 KB' },
];

export default function AdminImages() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [images, setImages] = useState(initialImages);
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImages, setUploadingImages] = useState([]);
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (!e.target.files.length || !selectedProject) return;
    
    // Convert FileList to Array and prepare for upload
    const files = Array.from(e.target.files);
    const newUploads = files.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      file,
      name: file.name,
      projectId: parseInt(selectedProject),
      progress: 0,
      status: 'uploading',
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${Math.round(file.size / 1024)} KB`,
    }));

    setUploadingImages([...uploadingImages, ...newUploads]);
    
    // Simulate upload progress for each file
    newUploads.forEach(upload => {
      simulateUpload(upload.id);
    });
  };
  
  // Simulate file upload with progress
  const simulateUpload = (uploadId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Find the uploaded file and mark as complete
        setUploadingImages(prev => {
          const updated = prev.map(item => {
            if (item.id === uploadId) {
              return { ...item, progress: 100, status: 'complete' };
            }
            return item;
          });
          
          // After a delay, move completed uploads to images list
          setTimeout(() => {
            setUploadingImages(prev => prev.filter(item => item.id !== uploadId));
            setImages(prev => {
              const completedItem = updated.find(item => item.id === uploadId);
              if (completedItem) {
                // Convert temp id to a sequential id for the permanent list
                const newId = Math.max(...prev.map(img => img.id), 0) + 1;
                return [...prev, { ...completedItem, id: newId }];
              }
              return prev;
            });
          }, 1000);
          
          return updated;
        });
      } else {
        setUploadingImages(prev => {
          return prev.map(item => {
            if (item.id === uploadId) {
              return { ...item, progress };
            }
            return item;
          });
        });
      }
    }, 300);
  };
  
  // Trigger file selection dialog
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle image deletion
  const handleDeleteImage = (id) => {
    setImages(prev => prev.filter(image => image.id !== id));
  };
  
  // Filter images based on search term
  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Bilder verwalten | Admin</title>
        <meta name="description" content="Admin-Bereich für die Verwaltung von Projektbildern" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header with navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <Link 
                href="/contact"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  color: 'var(--text-light)',
                  fontSize: '0.95rem',
                  marginBottom: '0.75rem'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Zurück zum Dashboard
              </Link>
              <h1 style={{ 
                fontSize: '2.5rem', 
                margin: '0', 
                color: 'var(--title-color)',
                fontWeight: 700
              }}>
                Bilder verwalten
              </h1>
            </div>
          </div>
          
          {/* Upload section */}
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              fontSize: '1.2rem', 
              marginTop: 0,
              marginBottom: '1.5rem', 
              color: 'var(--heading-color)' 
            }}>
              Bilder hochladen
            </h2>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              alignItems: 'flex-end',
              marginBottom: '1.5rem' 
            }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label 
                  htmlFor="project-select" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.9rem',
                    color: 'var(--text-color)' 
                  }}
                >
                  Projekt auswählen
                </label>
                <select 
                  id="project-select"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.6rem', 
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-color)'
                  }}
                >
                  <option value="">-- Projekt wählen --</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <button 
                  onClick={handleUploadClick} 
                  disabled={!selectedProject}
                  style={{ 
                    padding: '0.6rem 1.2rem', 
                    backgroundColor: selectedProject ? 'var(--accent-blue)' : 'var(--disabled-bg)', 
                    color: selectedProject ? 'white' : 'var(--disabled-text)', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: selectedProject ? 'pointer' : 'not-allowed',
                    fontWeight: '500'
                  }}
                >
                  Bilder auswählen
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  multiple 
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            
            {/* Upload progress indicators */}
            {uploadingImages.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  marginTop: 0,
                  marginBottom: '0.8rem', 
                  color: 'var(--text-color)' 
                }}>
                  Upload-Fortschritt
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {uploadingImages.map(img => (
                    <div key={img.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ flex: '1', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                        {img.name}
                      </span>
                      <div style={{ 
                        flex: '2',
                        height: '8px', 
                        backgroundColor: 'var(--bg-lighter)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${img.progress}%`, 
                            backgroundColor: 'var(--accent-blue)',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                      <span style={{ 
                        width: '40px', 
                        fontSize: '0.85rem', 
                        color: 'var(--text-light)',
                        textAlign: 'right'
                      }}>
                        {img.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Image management section */}
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '8px' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.2rem', 
                margin: 0, 
                color: 'var(--heading-color)' 
              }}>
                Vorhandene Bilder
              </h2>
              
              <div style={{ width: '250px' }}>
                <input 
                  type="text" 
                  placeholder="Bilder suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.6rem', 
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-color)'
                  }}
                />
              </div>
            </div>
            
            {/* Image list */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {filteredImages.map(image => (
                <div 
                  key={image.id} 
                  style={{ 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-lighter)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ 
                    height: '150px', 
                    backgroundColor: '#1e1e1e',
                    backgroundImage: `url(/project${image.projectId}.jpg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: '0.8rem' }}>
                    <h3 style={{ 
                      margin: '0 0 0.4rem', 
                      fontSize: '0.95rem', 
                      color: 'var(--heading-color)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {image.name}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-light)'
                    }}>
                      <span>{projects.find(p => p.id === image.projectId)?.title}</span>
                      <span>{image.size}</span>
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem',
                      color: 'var(--text-light)',
                      marginTop: '0.2rem'
                    }}>
                      {image.uploadDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredImages.length === 0 && (
              <div style={{ 
                padding: '2rem 0', 
                textAlign: 'center', 
                color: 'var(--text-light)' 
              }}>
                Keine Bilder gefunden.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 