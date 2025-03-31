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
  const [activities, setActivities] = useState([]);
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

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        const data = await response.json();
        
        // Additional client-side deduplication (in case there are legacy duplicates in the database)
        const uniqueActivities = [];
        const textSet = new Set();
        
        data.forEach(activity => {
          if (!textSet.has(activity.text)) {
            textSet.add(activity.text);
            uniqueActivities.push(activity);
          }
        });
        
        setActivities(uniqueActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();

    // Set up polling to refresh activities
    const intervalId = setInterval(fetchActivities, 5000); // Refresh every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Function to format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If it's today
    if (date.toDateString() === now.toDateString()) {
      return `Heute, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // If it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Gestern, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Otherwise, return the date
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
  };

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
              href="/contact/projects" 
              icon="📁" 
            />
            <AdminCard 
              title="Team Mitglieder Verwalten" 
              description="Team Mitglieder hinzufügen, bearbeiten und löschen" 
              href="/contact/team" 
              icon="👥" 
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
              Letzte Aktivitäten
            </h2>
            
            <div style={{ 
              color: 'var(--text-color)',
              maxHeight: activities.length > 3 ? '300px' : 'auto',
              overflowY: activities.length > 3 ? 'auto' : 'visible',
              paddingRight: activities.length > 3 ? '8px' : '0'
            }}>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityItem 
                    key={activity.id}
                    text={activity.text} 
                    time={formatTimestamp(activity.timestamp)}
                    type={activity.type}
                  />
                ))
              ) : (
                <div style={{ padding: '1rem 0', fontSize: '0.9rem' }}>
                  Keine Aktivitäten gefunden.
                </div>
              )}
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
function ActivityItem({ text, time, type }) {
  const getActivityIcon = () => {
    if (type === 'project') {
      return '📁';
    } else if (type === 'team') {
      return '👤';
    }
    return '📝';
  };

  return (
    <div style={{ 
      padding: '0.8rem 0', 
      borderBottom: '1px solid var(--border-color)',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.8rem'
    }}>
      <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>
        {getActivityIcon()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '0.3rem' }}>{text}</div>
        <div style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>{time}</div>
      </div>
    </div>
  );
} 