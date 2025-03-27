import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SettingsMenu from './SettingsMenu';

export default function Header() {
  const { theme, toggleSettings } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    // Add scroll listener
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <header style={{ 
        width: '100%', 
        borderBottom: scrolled ? `1px solid ${isDarkMode ? '#333' : '#eaeaea'}` : 'none',
        backgroundColor: scrolled ? (isDarkMode ? '#121212' : 'white') : 'transparent',
        position: 'fixed',
        top: 0,
        zIndex: 10,
        boxShadow: scrolled ? `0 4px 20px rgba(0,0,0,${isDarkMode ? '0.5' : '0.08'})` : 'none',
        transition: 'all 0.3s ease',
        overflowX: 'auto'
      }}>
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.8rem 1.5rem',
          width: '100%',
          minWidth: 'max-content'
        }}>
          <div className={styles.logo} style={{ marginRight: '2rem' }}>
            <a href="/" style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              textDecoration: 'none', 
              color: '#0070f3',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '1.5rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                <span style={{ 
                  color: '#0070f3',
                  fontWeight: 'bold',
                  letterSpacing: '-0.5px'
                }}>
                  effner
                </span>
                <span style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#FFD700', /* Yellow color for the rhombus */
                  transform: 'rotate(45deg)',
                  marginLeft: '4px',
                  marginRight: '4px'
                }}></span>
                <span style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#ADD8E6', /* Light blue color for the second rhombus */
                  transform: 'rotate(45deg)',
                  marginLeft: '4px',
                  marginRight: '4px'
                }}></span>
                <span style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#90EE90', /* Light green color for the square */
                  marginLeft: '4px'
                }}></span>
              </div>
              <span style={{ 
                color: isDarkMode ? '#e0e0e0' : '#333',
                marginLeft: '8px',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Mathe P-Seminar
              </span>
            </a>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            whiteSpace: 'nowrap'
          }}>
            <ul style={{ 
              display: 'flex', 
              listStyle: 'none', 
              gap: '2.5rem', 
              margin: 0,
              padding: 0,
              whiteSpace: 'nowrap'
            }}>
              <li>
                <a href="/" style={{ 
                  textDecoration: 'none', 
                  color: isDarkMode ? '#e0e0e0' : '#333', 
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0',
                  position: 'relative'
                }}>
                  Startseite
                  <span style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '2px', 
                    background: 'linear-gradient(90deg, #0070f3, #00a3ff)', 
                    transform: 'scaleX(0)', 
                    transformOrigin: 'center', 
                    transition: 'transform 0.3s ease' 
                  }}></span>
                </a>
              </li>
              <li>
                <a href="#about" style={{ 
                  textDecoration: 'none', 
                  color: isDarkMode ? '#e0e0e0' : '#333', 
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0',
                  position: 'relative'
                }}>
                  Über uns
                  <span style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '2px', 
                    background: 'linear-gradient(90deg, #0070f3, #00a3ff)', 
                    transform: 'scaleX(0)', 
                    transformOrigin: 'center', 
                    transition: 'transform 0.3s ease' 
                  }}></span>
                </a>
              </li>
              <li>
                <a href="#team" style={{ 
                  textDecoration: 'none', 
                  color: isDarkMode ? '#e0e0e0' : '#333', 
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0',
                  position: 'relative' 
                }}>
                  Team
                  <span style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '2px', 
                    background: 'linear-gradient(90deg, #0070f3, #00a3ff)', 
                    transform: 'scaleX(0)', 
                    transformOrigin: 'center', 
                    transition: 'transform 0.3s ease' 
                  }}></span>
                </a>
              </li>
              <li>
                <a href="/projects" style={{ 
                  textDecoration: 'none', 
                  color: isDarkMode ? '#e0e0e0' : '#333', 
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0',
                  position: 'relative' 
                }}>
                  Projekte
                  <span style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '2px', 
                    background: 'linear-gradient(90deg, #0070f3, #00a3ff)', 
                    transform: 'scaleX(0)', 
                    transformOrigin: 'center', 
                    transition: 'transform 0.3s ease' 
                  }}></span>
                </a>
              </li>
              <li>
                <a href="/admin" style={{ 
                  textDecoration: 'none', 
                  color: isDarkMode ? '#e0e0e0' : '#333', 
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0',
                  position: 'relative' 
                }}>
                  Kontakt
                  <span style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '2px', 
                    background: 'linear-gradient(90deg, #0070f3, #00a3ff)', 
                    transform: 'scaleX(0)', 
                    transformOrigin: 'center', 
                    transition: 'transform 0.3s ease' 
                  }}></span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      
      {/* Floating settings button */}
      <button 
        onClick={toggleSettings}
        aria-label="Open settings"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          borderRadius: '50%',
          color: isDarkMode ? '#e0e0e0' : '#555',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
      
      <SettingsMenu />
    </>
  );
}