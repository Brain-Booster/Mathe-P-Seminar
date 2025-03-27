import styles from '../styles/Home.module.css';
import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <footer className={styles.footer}>
      <div style={{ 
        maxWidth: '1200px', 
        width: '100%', 
        padding: '0 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <a href="/" style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            textDecoration: 'none', 
            color: '#0070f3',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span style={{ background: 'linear-gradient(90deg, #0070f3, #00a3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              School Project
            </span>
          </a>
        </div>
        <p style={{ color: isDarkMode ? '#bbb' : '#666', fontSize: '0.95rem', margin: '0 0 1.2rem' }}>
          © {new Date().getFullYear()} School Project. All rights reserved.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          justifyContent: 'center',
          fontSize: '0.9rem',
          position: 'relative',
          padding: '0.8rem 0'
        }}>
          <a href="#" style={{ 
            color: isDarkMode ? '#e0e0e0' : '#555', 
            textDecoration: 'none', 
            transition: 'color 0.2s ease',
            position: 'relative',
            padding: '0.3rem 0'
          }}>
            Privacy Policy
            <span style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              width: '100%', 
              height: '1px', 
              background: 'linear-gradient(90deg, transparent, rgba(0,112,243,0.3), transparent)', 
              transform: 'scaleX(0)', 
              transformOrigin: 'center', 
              transition: 'transform 0.3s ease' 
            }}></span>
          </a>
          <a href="#" style={{ 
            color: isDarkMode ? '#e0e0e0' : '#555', 
            textDecoration: 'none', 
            transition: 'color 0.2s ease',
            position: 'relative',
            padding: '0.3rem 0'
          }}>
            Terms of Service
            <span style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              width: '100%', 
              height: '1px', 
              background: 'linear-gradient(90deg, transparent, rgba(0,112,243,0.3), transparent)', 
              transform: 'scaleX(0)', 
              transformOrigin: 'center', 
              transition: 'transform 0.3s ease' 
            }}></span>
          </a>
          <a href="#" style={{ 
            color: isDarkMode ? '#e0e0e0' : '#555', 
            textDecoration: 'none', 
            transition: 'color 0.2s ease',
            position: 'relative',
            padding: '0.3rem 0'
          }}>
            Contact Us
            <span style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              width: '100%', 
              height: '1px', 
              background: 'linear-gradient(90deg, transparent, rgba(0,112,243,0.3), transparent)', 
              transform: 'scaleX(0)', 
              transformOrigin: 'center', 
              transition: 'transform 0.3s ease' 
            }}></span>
          </a>
        </div>
      </div>
    </footer>
  );
} 