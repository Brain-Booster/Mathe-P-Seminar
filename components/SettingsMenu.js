import { useTheme } from '../src/contexts/ThemeContext';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function SettingsMenu() {
  const { theme, toggleTheme, isSettingsOpen, closeSettings, customColors, updateCustomColors, resetCustomColors } = useTheme();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeSettings();
      }
    }
    
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen, closeSettings]);

  const handleColorChange = (colorKey, value) => {
    updateCustomColors({
      ...customColors,
      [colorKey]: value
    });
  };

  if (!isSettingsOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      <div 
        ref={menuRef}
        style={{
          backgroundColor: '#121212',
          borderRadius: '10px',
          padding: '20px',
          width: '300px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#e0e0e0' }}>Settings</h3>
          <button 
            onClick={closeSettings}
            aria-label="Close settings"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: '#aaa',
              display: 'flex',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ padding: '10px 0' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#e0e0e0', fontSize: '16px' }}>Application Settings</h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: '#0070f3' }}>
                {theme === 'dark' ? (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </>
                )}
              </svg>
              <span style={{ color: '#e0e0e0', fontWeight: '500' }}>Dark Mode</span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
              <input 
                type="checkbox" 
                checked={theme === 'dark'} 
                onChange={toggleTheme} 
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span 
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: theme === 'dark' ? '#0070f3' : '#ccc',
                  transition: '.3s',
                  borderRadius: '24px',
                  boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                }}
              >
                <span 
                  style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: theme === 'dark' ? 'calc(100% - 21px)' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '.3s',
                    borderRadius: '50%',
                    boxShadow: '0 0 3px rgba(0,0,0,0.5)',
                  }}
                />
              </span>
            </label>
          </div>
          
          {/* Color Theme Customization */}
          <h4 style={{ margin: '20px 0 15px 0', color: '#e0e0e0', fontSize: '16px' }}>Color Theme</h4>
          
          {/* Color Preview */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            justifyContent: 'center'
          }}>
            <div style={{ 
              width: '30px', 
              height: '30px', 
              backgroundColor: customColors.color1,
              borderRadius: '4px',
              transform: 'rotate(45deg)'
            }} />
            <div style={{ 
              width: '30px', 
              height: '30px', 
              backgroundColor: customColors.color2,
              borderRadius: '4px'
            }} />
            <div style={{ 
              width: '30px', 
              height: '30px', 
              backgroundColor: customColors.color3,
              borderRadius: '4px',
              transform: 'rotate(45deg)'
            }} />
          </div>

          {/* Color Pickers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                color: '#e0e0e0',
                fontSize: '14px'
              }}>
                Color 1 (Yellow)
              </label>
              <input 
                type="color" 
                value={customColors.color1}
                onChange={(e) => handleColorChange('color1', e.target.value)}
                style={{
                  width: '100%',
                  height: '30px',
                  padding: '2px',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  backgroundColor: '#2a2a2a'
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                color: '#e0e0e0',
                fontSize: '14px'
              }}>
                Color 2 (Green)
              </label>
              <input 
                type="color" 
                value={customColors.color2}
                onChange={(e) => handleColorChange('color2', e.target.value)}
                style={{
                  width: '100%',
                  height: '30px',
                  padding: '2px',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  backgroundColor: '#2a2a2a'
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                color: '#e0e0e0',
                fontSize: '14px'
              }}>
                Color 3 (Blue)
              </label>
              <input 
                type="color" 
                value={customColors.color3}
                onChange={(e) => handleColorChange('color3', e.target.value)}
                style={{
                  width: '100%',
                  height: '30px',
                  padding: '2px',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  backgroundColor: '#2a2a2a'
                }}
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetCustomColors}
            style={{
              marginTop: '15px',
              padding: '8px 12px',
              backgroundColor: '#222',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
          >
            Reset Colors
          </button>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {}, // will be passed to the page component as props
  }
}