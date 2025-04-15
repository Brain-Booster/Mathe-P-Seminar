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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontSize: '1.4rem',
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
                width: '18px',
                height: '18px',
                backgroundColor: '#FFD700',
                transform: 'rotate(45deg)',
                marginLeft: '4px',
                marginRight: '4px'
              }}></span>
              <span style={{
                display: 'inline-block',
                width: '18px',
                height: '18px',
                backgroundColor: '#ADD8E6',
                transform: 'rotate(45deg)',
                marginLeft: '4px',
                marginRight: '4px'
              }}></span>
              <span style={{
                display: 'inline-block',
                width: '18px',
                height: '18px',
                backgroundColor: '#90EE90',
                marginLeft: '4px'
              }}></span>
            </div>
            <span style={{ 
              color: isDarkMode ? '#e0e0e0' : '#333',
              marginLeft: '8px',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              Mathe P-Seminar
            </span>
          </a>
        </div>
        <p style={{ color: isDarkMode ? '#bbb' : '#666', fontSize: '0.95rem', margin: '0 0 1.2rem' }}>
          © {new Date().getFullYear()} Effner Mathe P-Seminar. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 