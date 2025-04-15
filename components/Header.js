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
                  backgroundColor: '#FFD700', // Yellow color for the rhombus
                  transform: 'rotate(45deg)',
                  marginLeft: '4px',
                  marginRight: '4px'
                }}></span>
                <span style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#90EE90', // Light green color for the square
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