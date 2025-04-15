import { useState, useEffect } from 'react';

const ModelViewer = ({ modelPath }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [modelStatus, setModelStatus] = useState('loading');
  
  useEffect(() => {
    console.log("ModelViewer mounted, loading model:", modelPath);
    
    // Function to load the model-viewer script
    const loadModelViewerScript = () => {
      return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined') {
          // Check if <model-viewer> is already defined
          if (customElements.get('model-viewer')) {
            console.log("model-viewer element already defined");
            resolve(true);
            return;
          }
          
          // Check if script already exists
          if (!document.querySelector('script[src*="model-viewer"]')) {
            console.log("Loading model-viewer script");
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
            script.type = 'module';
            
            script.onload = () => {
              console.log('model-viewer script loaded successfully');
              // Wait a moment for the custom element to be defined
              setTimeout(() => {
                if (customElements.get('model-viewer')) {
                  console.log('model-viewer custom element is defined');
                  resolve(true);
                } else {
                  console.error('model-viewer custom element was not defined');
                  reject(new Error('model-viewer custom element was not defined'));
                }
              }, 500);
            };
            
            script.onerror = (e) => {
              console.error('Error loading model-viewer script:', e);
              reject(e);
            };
            
            document.body.appendChild(script);
          } else {
            console.log("model-viewer script already exists");
            resolve(true);
          }
        }
      });
    };
    
    loadModelViewerScript()
      .then(() => {
        console.log("Setting scriptLoaded to true");
        setScriptLoaded(true);
      })
      .catch(error => {
        console.error("Failed to load model-viewer script:", error);
        setModelStatus('error');
      });
  }, [modelPath]);

  // Handle model events
  const handleModelLoad = () => {
    console.log('Model loaded successfully');
    setModelStatus('loaded');
  };

  const handleModelError = (error) => {
    console.error('Error loading model:', error.target.error);
    setModelStatus('error');
  };

  return (
    <div style={{ 
      height: '400px', 
      width: '100%', 
      backgroundColor: '#1e1e1e', 
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {scriptLoaded ? (
        <>
          <div 
            dangerouslySetInnerHTML={{
              __html: `
                <model-viewer
                  src="${modelPath}"
                  alt="3D model for project"
                  camera-controls
                  shadow-intensity="1"
                  auto-rotate
                  style="width: 100%; height: 100%;"
                  loading="eager"
                  reveal="auto"
                ></model-viewer>
              `
            }} 
            style={{ width: '100%', height: '100%' }}
          />
          
          {modelStatus === 'loading' && (
            <div style={{ 
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              zIndex: 2
            }}>
              Loading 3D model...
            </div>
          )}
          
          {modelStatus === 'error' && (
            <div style={{ 
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              zIndex: 2
            }}>
              Failed to load 3D model. Please try again later.
            </div>
          )}
        </>
      ) : (
        <div style={{ color: '#777' }}>Initializing 3D viewer...</div>
      )}
    </div>
  );
};

export default ModelViewer; 