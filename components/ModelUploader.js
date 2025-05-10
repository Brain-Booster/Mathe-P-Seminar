import React, { useState } from 'react';

export default function ModelUploader({ onModelUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setError('Datei ist zu groß (max. 100MB)');
      return;
    }
    
    // Check file type
    const validTypes = ['.glb', '.gltf', '.obj', '.stl', '.fbx'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(fileExt)) {
      setError(`Ungültiger Dateityp. Unterstützte Typen: ${validTypes.join(', ')}`);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'model');
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progressPercent = Math.round((event.loaded / event.total) * 100);
          setProgress(progressPercent);
        }
      });
      
      // Handle response
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.fileUrl) {
              // Call the callback with the uploaded model path
              if (onModelUploaded) {
                onModelUploaded(response.fileUrl);
              }
              setError(null);
              setProgress(100);
              // Reset after 2 seconds
              setTimeout(() => {
                setIsUploading(false);
                setProgress(0);
              }, 2000);
            } else {
              setError('Upload fehlgeschlagen');
              setIsUploading(false);
            }
          } catch (e) {
            setError('Ungültige Serverantwort');
            setIsUploading(false);
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            setError(response.error || 'Serverfehler');
          } catch (e) {
            setError(`Serverfehler: ${xhr.status}`);
          }
          setIsUploading(false);
        }
      };
      
      xhr.onerror = () => {
        setError('Netzwerkfehler beim Hochladen');
        setIsUploading(false);
      };
      
      xhr.open('POST', '/api/uploadModel', true);
      xhr.send(formData);
      
    } catch (err) {
      setError('Fehler beim Hochladen: ' + err.message);
      setIsUploading(false);
    }
  };
  
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ 
        border: '2px dashed #666',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        {isUploading ? (
          <div>
            <p>Hochladen: {progress}%</p>
            <div style={{ 
              width: '100%', 
              height: '10px', 
              backgroundColor: '#333',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                backgroundColor: '#0070f3',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        ) : (
          <>
            <p style={{ marginTop: 0 }}>3D-Modell hochladen</p>
            <p style={{ fontSize: '0.9rem', color: '#888', margin: '10px 0' }}>
              Unterstützte Formate: GLB, GLTF, OBJ, STL, FBX (max. 100MB)
            </p>
            <label style={{
              display: 'inline-block',
              padding: '10px 15px',
              backgroundColor: 'var(--accent-blue)',
              color: 'white',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Datei auswählen
              <input 
                type="file" 
                onChange={handleUpload} 
                style={{ display: 'none' }} 
                accept=".glb,.gltf,.obj,.stl,.fbx"
              />
            </label>
          </>
        )}
      </div>
      
      {error && (
        <p style={{ color: 'red', marginTop: '10px', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}
    </div>
  );
} 