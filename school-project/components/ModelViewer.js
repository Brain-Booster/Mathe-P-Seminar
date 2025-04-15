import React, { useEffect, useRef } from 'react';

// The Model Viewer component will load dynamically on the client side
export default function ModelViewer({ modelPath, poster, alt }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // The model-viewer script is already loaded via _document.js
    // No need to import it here which causes build errors
  }, []);
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {/* The model-viewer web component will be defined after the effect runs */}
      <model-viewer
        src={modelPath}
        poster={poster || null}
        alt={alt || "3D Model"}
        shadow-intensity="1"
        camera-controls
        auto-rotate
        ar
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#1e1e1e', 
          borderRadius: '10px',
          display: 'block'
        }}
      >
        <div className="progress-bar" slot="progress-bar"></div>
        <button slot="ar-button" style={{ 
          backgroundColor: 'white', 
          borderRadius: '4px', 
          border: 'none', 
          position: 'absolute', 
          bottom: '16px', 
          right: '16px',
          padding: '8px 12px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          👁️ Ansehen in AR
        </button>
      </model-viewer>
    </div>
  );
} 