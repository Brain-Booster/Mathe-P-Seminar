import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [stats, setStats] = useState({ projectCount: 0, visitorCount: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch real stats when the component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up polling to refresh stats more frequently
    const intervalId = setInterval(fetchStats, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Dashboard | Schulprojekt</title>
        <meta name="description" content="Admin Dashboard für das Schulprojekt" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '2rem', 
            color: 'var(--title-color)',
            fontWeight: 700
          }}>
            Admin Dashboard
          </h1>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '3rem' 
          }}>
            {/* Admin Navigation Cards - Only keep Projekte verwalten */}
            <AdminCard 
              title="Projekte verwalten" 
              description="Projekte erstellen, bearbeiten und löschen" 
              href="/admin/projects" 
              icon="📁" 
            />
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '8px',
            marginBottom: '2rem' 
          }}>
            <h2 style={{ 
              fontSize: '1.2rem', 
              marginTop: 0,
              marginBottom: '1rem', 
              color: 'var(--heading-color)' 
            }}>
              Quick Stats
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <StatCard 
                title="Projekte" 
                value={loading ? "..." : stats.projectCount.toString()} 
              />
              <StatCard 
                title="Besucher/Monat" 
                value={loading ? "..." : stats.visitorCount.toString()} 
              />
            </div>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '8px' 
          }}>
            <h2 style={{ 
              fontSize: '1.2rem', 
              marginTop: 0,
              marginBottom: '1rem', 
              color: 'var(--heading-color)' 
            }}>
              Neueste Aktivitäten
            </h2>
            
            <div style={{ color: 'var(--text-color)' }}>
              <ActivityItem 
                text="3D Stuhl-Modellierung Projekt aktualisiert" 
                time="Heute, 15:45" 
              />
              <ActivityItem 
                text="Neues Modell hochgeladen: chair.glb" 
                time="Gestern, 10:23" 
              />
              <ActivityItem 
                text="Projekt 'Projekt Zwei' bearbeitet" 
                time="19. März 2023" 
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Admin card component for navigation
function AdminCard({ title, description, href, icon }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: 'var(--card-bg)', 
        borderRadius: '8px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        height: '100%',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }} className="admin-card">
        <div style={{ 
          fontSize: '2rem', 
          marginBottom: '1rem' 
        }}>
          {icon}
        </div>
        <h3 style={{ 
          margin: '0 0 0.5rem', 
          fontSize: '1.2rem', 
          color: 'var(--heading-color)' 
        }}>
          {title}
        </h3>
        <p style={{ 
          margin: '0', 
          color: 'var(--text-light)',
          fontSize: '0.9rem',
          flex: 1
        }}>
          {description}
        </p>
      </div>
    </Link>
  );
}

// Stat card component
function StatCard({ title, value }) {
  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: 'rgba(var(--bg-rgb), 0.5)', 
      borderRadius: '6px',
      textAlign: 'center'
    }}>
      <h3 style={{ 
        margin: '0 0 0.5rem', 
        fontSize: '0.9rem', 
        color: 'var(--text-light)' 
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: '0', 
        fontSize: '1.8rem', 
        fontWeight: 'bold',
        color: 'var(--accent-blue)'
      }}>
        {value}
      </p>
    </div>
  );
}

// Activity item component
function ActivityItem({ text, time }) {
  return (
    <div style={{ 
      padding: '0.8rem 0', 
      borderBottom: '1px solid var(--border-color)',
      fontSize: '0.9rem'
    }}>
      <div style={{ marginBottom: '0.3rem' }}>{text}</div>
      <div style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>{time}</div>
    </div>
  );
} 