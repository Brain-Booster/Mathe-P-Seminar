import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '../src/contexts/ThemeContext';
import { useRouter } from 'next/router';
import { 
  mockProjects, 
  getClientProjectsSync, 
  getClientProjects,
  getClientTeamMembers, 
  getClientTeamMembersSync 
} from './models/index';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const popupRef = useRef(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Mark when component has mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load the latest projects from server API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // First set with sync data for immediate display
        setProjects(getClientProjectsSync());
        
        // Then fetch latest data from server
        const serverProjects = await getClientProjects();
        setProjects(serverProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    // Load projects initially
    loadProjects();

    // Set up polling to refresh data periodically
    const intervalId = setInterval(async () => {
      try {
        const serverProjects = await getClientProjects();
        setProjects(serverProjects);
      } catch (error) {
        console.error('Error polling projects:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Set up visibility change event to refresh projects when the page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProjects();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // First set with sync data for immediate display
        const syncData = getClientTeamMembersSync() || [];
        setTeamMembers(syncData);
        
        // Then fetch latest data from server
        const data = await getClientTeamMembers();
        setTeamMembers(data);
      } catch (error) {
        console.error('Error loading team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Handle opening team member popup from query parameter
  useEffect(() => {
    if (router.isReady && router.query.member) {
      const memberName = decodeURIComponent(router.query.member);
      
      // Find the member by their full name (assuming format "Name Nachname")
      const foundMember = teamMembers.find(member => 
        `${member.name} ${member.nachname}` === memberName
      );
      
      if (foundMember) {
        setSelectedMember(foundMember);
        
        // Scroll to team section
        const teamSection = document.getElementById('team');
        if (teamSection) {
          teamSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [router.isReady, router.query.member, teamMembers]);

  // Handle clicking outside the popup to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setSelectedMember(null);
        
        // Remove the member query parameter from the URL without full page navigation
        const url = new URL(window.location);
        url.searchParams.delete('member');
        window.history.pushState({}, '', url);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  // Handle Escape key to close the popup
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        setSelectedMember(null);
        
        // Remove the member query parameter from the URL without full page navigation
        const url = new URL(window.location);
        url.searchParams.delete('member');
        window.history.pushState({}, '', url);
      }
    }

    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);
  
  // Handle closing the popup
  const handleClosePopup = () => {
    setSelectedMember(null);
    
    // Remove the member query parameter from the URL without full page navigation
    const url = new URL(window.location);
    url.searchParams.delete('member');
    window.history.pushState({}, '', url);
  };

  // Handle opening a team member popup and updating URL
  const handleOpenMemberPopup = (member) => {
    setSelectedMember(member);
    
    // Add the member's name to the URL without full page navigation
    const url = new URL(window.location);
    url.searchParams.set('member', `${member.name} ${member.nachname}`);
    window.history.pushState({}, '', url);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Effner Mathe P-Seminar</title>
        <meta name="description" content="Mathe P-Seminar von dem Joseph-Effner-Gymnasium 2025" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>
          Willkommen zum Mathe P-Seminar!
        </h1>

        <p className={styles.description}>
          Das ist eine Webseite für das Mathe P-Seminar von dem Joseph-Effner-Gymnasium 2025.
        </p>

        {/* About Us Section - Moved to top */}
        <section id="about" style={{ width: '100%', maxWidth: '1000px', margin: '3rem auto 0' }}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Über uns
          </h2>
          
          <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-light)', maxWidth: '700px', margin: '0 auto 3rem' }}>
            Wer wir sind und woran wir arbeiten
          </p>
          
          {/* Schule und P-Seminar Section */}
          <div style={{ 
            maxWidth: '800px', 
            margin: '2rem auto', 
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                backgroundColor: 'var(--accent-blue)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 6px 20px rgba(0, 163, 255, 0.3)'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h2 style={{ 
                margin: '0 0 1rem 0', 
                color: 'var(--heading-color)', 
                fontSize: '1.8rem',
                textAlign: 'center',
                background: 'linear-gradient(90deg, #0070f3, #00a3ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Josef Effner Gymnasium
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'var(--text-light)',
                textAlign: 'center',
                maxWidth: '600px',
                lineHeight: '1.6'
              }}>
                Wir sind Schüler des Josef Effner Gymnasiums und erstellen diese Website im Rahmen unseres Mathe P-Seminars.
              </p>
            </div>

            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', 
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                margin: '0 0 1rem 0', 
                color: 'var(--heading-color)', 
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Unser P-Seminar
              </h3>
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--text-color)',
                lineHeight: '1.6',
                margin: '0 0 1rem 0'
              }}>
                In unserem Mathematik P-Seminar beschäftigen wir uns mit der praktischen Anwendung mathematischer Konzepte. 
                Wir nutzen moderne Technologien und Programmierung, um mathematische Modelle zu visualisieren und interaktiv erfahrbar zu machen.
              </p>
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--text-color)',
                lineHeight: '1.6',
                margin: '0'
              }}>
                Durch die Entwicklung dieser Website möchten wir unsere Projekte dokumentieren und anderen Schülern und Interessierten zur Verfügung stellen.
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '1.5rem',
              justifyContent: 'center'
            }}>
              <div style={{ 
                flex: '1 1 300px',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                padding: '1.5rem',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  backgroundColor: isDarkMode ? 'rgba(0, 163, 255, 0.1)' : 'rgba(0, 163, 255, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--heading-color)' }}>Mathematische Grundlagen</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: '1.6', margin: '0' }}>
                  Wir vertiefen unser Verständnis der Mathematik durch praktische Anwendung und Visualisierung.
                </p>
              </div>
              
              <div style={{ 
                flex: '1 1 300px',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                padding: '1.5rem',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  backgroundColor: isDarkMode ? 'rgba(0, 163, 255, 0.1)' : 'rgba(0, 163, 255, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--heading-color)' }}>Projektarbeit</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: '1.6', margin: '0' }}>
                  In Teamarbeit realisieren wir Projekte, die mathematische Konzepte praktisch und anschaulich umsetzen.
                </p>
              </div>
            </div>
          </div>
        </section>

        <h2 className={styles.sectionTitle} style={{ marginTop: '5rem' }}>
          Unsere Projekte
        </h2>
        
        <div className={styles.projectGrid}>
          {/* Display only the first 3 projects */}
          {projects.slice(0, 3).map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div style={{ 
                height: '160px', 
                backgroundColor: '#1e1e1e', 
                borderRadius: '6px', 
                marginBottom: '1.2rem',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {project.image ? (
                  <img 
                    src={project.image} 
                    alt={project.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                )}
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#e0e0e0' }}>
                {project.title}
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#bbb', lineHeight: '1.5' }}>
                {project.description}
              </p>
              <Link 
                href={`/projects/${project.id}`}
                style={{ color: '#0070f3', fontSize: '0.95rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}
              >
                Projekt ansehen 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* Show 'Alle Projekte ansehen' button only if there are more than 3 projects */}
        {projects.length > 3 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a href="/projects" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-lime))', 
              color: '#222',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(0, 163, 255, 0.4)',
              transition: 'all 0.3s ease'
            }}>
              Alle Projekte ansehen
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        )}

        {/* Team Section */}
        <section id="team" style={{ width: '100%', maxWidth: '1000px', margin: '5rem auto 0' }}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Unser Team
          </h2>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '2rem',
            justifyContent: 'center'
          }}>
            {!isClient ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                Lade Team Mitglieder...
              </div>
            ) : isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                Lade Team Mitglieder...
              </div>
            ) : teamMembers.length > 0 ? (
              teamMembers.slice(0, 3).map((member) => (
                <div 
                  key={member.id} 
                  style={{ 
                    flex: '0 1 280px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid var(--border-color)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleOpenMemberPopup(member)}
                >
                  <div style={{ 
                    height: '280px', 
                    backgroundColor: isDarkMode ? '#2d2d2d' : '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {member.profileImage ? (
                      <img 
                        src={member.profileImage} 
                        alt={`${member.name} ${member.nachname}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </div>
                  <div style={{ 
                    padding: '1.5rem', 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>
                      {member.name} {member.nachname}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 1rem 0' }}>
                      {member.projektId ? (
                        <Link 
                          href={`/projects/${member.projektId}`} 
                          style={{
                            color: '#00b7ff',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          onClick={(e) => e.stopPropagation()} // Prevent popup when clicking on link
                        >
                          {member.projekt}
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </Link>
                      ) : (
                        member.projekt
                      )}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {member.specializations && member.specializations.length > 0 ? (
                        member.specializations.map((specialization, index) => (
                          <span key={index} style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.15rem 0.5rem', 
                            backgroundColor: 'rgba(0, 183, 255, 0.3)', 
                            color: 'white',
                            borderRadius: '4px',
                          }}>
                            {specialization}
                          </span>
                        ))
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                Keine Team Mitglieder vorhanden.
              </div>
            )}
          </div>

          {/* Show "Alle Mitglieder" button if there are more than 3 members */}
          {isClient && teamMembers.length > 3 && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <a href="/team" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-lime))', 
                color: '#222',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 163, 255, 0.4)',
                transition: 'all 0.3s ease'
              }}>
                Alle Mitglieder ansehen
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Popup for team member profile image */}
      {isClient && selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div 
            ref={popupRef}
            style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '12px',
              padding: '1rem',
              maxWidth: '80%',
              maxHeight: '80vh',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <button 
              onClick={handleClosePopup}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-color)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                zIndex: 10,
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
            >
              ×
            </button>
            <h3 style={{ margin: '0.5rem 0 1rem 0', color: 'var(--heading-color)' }}>
              {selectedMember.name} {selectedMember.nachname}
            </h3>
            <div style={{
              width: '100%',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {selectedMember.profileImage ? (
                <img 
                  src={selectedMember.profileImage} 
                  alt={`${selectedMember.name} ${selectedMember.nachname}`} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                  }} 
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 