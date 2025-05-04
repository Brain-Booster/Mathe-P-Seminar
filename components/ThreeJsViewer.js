import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function ThreeJsViewer({ modelPath, width = '100%', height = '100%' }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const frameIdRef = useRef(null);
  const modelRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial setup
  useEffect(() => {
    console.log('ThreeJsViewer: Initial setup');
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    try {
      renderer.outputEncoding = THREE.SRGBColorSpace;
    } catch (err) {
      console.warn('ThreeJsViewer: Issue setting output encoding:', err);
    }
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controlsRef.current = controls;

    // Handle resize
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      console.log('ThreeJsViewer: Cleanup');
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current = null;
      }
    };
  }, []);

  // Load model when path changes
  useEffect(() => {
    console.log('ThreeJsViewer: Model path changed:', modelPath);
    
    if (!modelPath || !sceneRef.current) {
      if (!modelPath) console.warn('ThreeJsViewer: No model path provided');
      if (!sceneRef.current) console.warn('ThreeJsViewer: Scene not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    // Remove previous model if exists
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    // Show loading indicator by changing background color
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(0x222222);
    }

    // Create loading manager
    const manager = new THREE.LoadingManager();
    
    manager.onProgress = (url, loaded, total) => {
      console.log(`Loading model: ${Math.floor((loaded / total) * 100)}%`);
    };

    manager.onError = (url) => {
      const errorMsg = `Error loading ${url}`;
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(0x661111); // Red background on error
      }
    };
    
    manager.onLoad = () => {
      console.log('ThreeJsViewer: Loading complete');
      setLoading(false);
    };

    // Load model
    const loader = new GLTFLoader(manager);
    
    console.log('ThreeJsViewer: Starting to load model from:', modelPath);
    
    loader.load(
      modelPath,
      (gltf) => {
        console.log('ThreeJsViewer: Model loaded successfully');
        const model = gltf.scene;
        
        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current.fov * (Math.PI / 180);
        let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        
        // Set camera position
        cameraRef.current.position.copy(center);
        cameraRef.current.position.z += cameraDistance * 1.5;
        cameraRef.current.lookAt(center);
        
        // Update controls
        if (controlsRef.current) {
          controlsRef.current.target.copy(center);
          controlsRef.current.update();
        }
        
        // Set back the original background color
        if (sceneRef.current) {
          sceneRef.current.background = new THREE.Color(0x111111);
        }
        
        // Add model to scene
        sceneRef.current.add(model);
        modelRef.current = model;
      },
      (xhr) => {
        // Progress
        const percentage = (xhr.loaded / xhr.total) * 100;
        console.log(`${Math.round(percentage)}% loaded`);
      },
      (error) => {
        // Error
        const errorMsg = `Error loading model: ${error.message || error}`;
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        
        if (sceneRef.current) {
          sceneRef.current.background = new THREE.Color(0x661111); // Red background on error
        }
      }
    );
  }, [modelPath]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: width, 
        height: height, 
        position: 'relative',
        backgroundColor: '#111',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          zIndex: 10
        }}>
          Modell wird geladen...
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(200,50,50,0.9)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          zIndex: 10,
          textAlign: 'center'
        }}>
          <div>Fehler beim Laden des 3D-Modells</div>
          <div style={{fontSize: '12px', marginTop: '5px'}}>{error}</div>
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        pointerEvents: 'none'
      }}>
        Klicken und ziehen zum Drehen • Scrollen zum Zoomen
      </div>
    </div>
  );
} 