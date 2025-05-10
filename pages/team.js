import Head from 'next/head';
import styles from '../styles/Projects.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../src/contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { getClientTeamMembers, getClientTeamMembersSync } from '../models/team';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Team() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Alle');
  const [allSpecializations, setAllSpecializations] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [expandedSpecializations, setExpandedSpecializations] = useState({});
  const popupRef = useRef(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Mark when component has mounted on client side
  useEffect(() => {
    setIsClient(true);
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

    // Set up polling to refresh data periodically
    const intervalId = setInterval(async () => {
      try {
        const data = await getClientTeamMembers();
        setTeamMembers(data);
      } catch (error) {
        console.error('Error polling team members:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Set up visibility change event to refresh data when the page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTeamMembers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Extract unique specializations and update filtered members when team members change
  useEffect(() => {
    if (teamMembers.length > 0) {
      // Extract all unique specializations
      const specializations = new Set();
      specializations.add('Alle'); // Always include "All" option
      
      teamMembers.forEach(member => {
        if (member.specializations && member.specializations.length > 0) {
          member.specializations.forEach(spec => {
            specializations.add(spec);
          });
        }
      });
      
      setAllSpecializations(Array.from(specializations));
      
      // Update filtered members based on active filter
      filterMembers(activeFilter, teamMembers);
    } else {
      setFilteredMembers([]);
    }
  }, [teamMembers, activeFilter]);

  // Check for member parameter in URL to open popup
  useEffect(() => {
    if (router.query.member && isClient) {
      const memberName = decodeURIComponent(router.query.member);
      const member = teamMembers.find(m => 
        `${m.name} ${m.nachname}` === memberName
      );
      
      if (member) {
        setSelectedMember(member);
      }
    }
  }, [router.query.member, teamMembers, isClient]);

  // Handle escape key and click outside for popup
  useEffect(() => {
    if (!selectedMember) return;

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        handleClosePopup();
      }
    };

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        handleClosePopup();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedMember]);

  const filterMembers = (filter, members = teamMembers) => {
    if (filter === 'Alle') {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(
        members.filter(member => 
          member.specializations && member.specializations.includes(filter)
        )
      );
    }
    setActiveFilter(filter);
  };

  const handleFilterClick = (filter) => {
    filterMembers(filter);
  };

  const handleOpenPopup = (member) => {
    setSelectedMember(member);
    
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('member', `${member.name} ${member.nachname}`);
    router.push(url, undefined, { shallow: true });
  };

  const handleClosePopup = () => {
    setSelectedMember(null);
    
    // Remove member parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('member');
    router.push(url, undefined, { shallow: true });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Team | P-Seminar</title>
        <meta name="description" content="Unser Team im P-Seminar Informatik" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Unser Team</h1>
          <p className={styles.subtitle}>
            Die Menschen hinter den Projekten
          </p>
        </div>

        {/* Specialization filter buttons */}
        {isClient && allSpecializations.length > 0 && (
          <div className={styles.categoryFilter}>
            {allSpecializations.map(specialization => (
              <button
                key={specialization}
                className={`${styles.categoryButton} ${activeFilter === specialization ? styles.active : ''}`}
                onClick={() => handleFilterClick(specialization)}
              >
                {specialization}
              </button>
            ))}
          </div>
        )}

        {/* Team members grid */}
        <div className={styles.projectGrid}>
          {!isClient ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', gridColumn: '1 / -1' }}>
              <span>Lade Team Mitglieder...</span>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', gridColumn: '1 / -1' }}>
              <span>Lade Team Mitglieder...</span>
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <div 
                key={member.id}
                className={styles.projectCard}
                onClick={() => handleOpenPopup(member)}
                style={{ 
                  cursor: 'pointer',
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
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
                        {member.projekt || 'Projekt ansehen'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </Link>
                    ) : (
                      member.projekt || 'Kein Projekt zugewiesen'
                    )}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    maxHeight: '26px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {member.specializations && member.specializations.length > 0 ? (
                      <>
                        {member.specializations.map((specialization, index) => (
                          <span key={index} style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.15rem 0.5rem', 
                            backgroundColor: 'rgba(0, 183, 255, 0.3)', 
                            color: 'white',
                            borderRadius: '4px',
                          }}>
                            {specialization}
                            {index === member.specializations.length - 1 && member.specializations.length > 2 ? '...' : ''}
                          </span>
                        ))}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', gridColumn: '1 / -1' }}>
              <p>Keine Team Mitglieder gefunden.</p>
              {activeFilter !== 'Alle' && (
                <button 
                  className={styles.categoryButton}
                  onClick={() => handleFilterClick('Alle')}
                  style={{ marginTop: '1rem' }}
                >
                  Alle anzeigen
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Popup for team member details */}
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
            {selectedMember.projekt && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--heading-color)' }}>Projekt</h4>
                {selectedMember.projektId ? (
                  <Link 
                    href={`/projects/${selectedMember.projektId}`}
                    style={{
                      color: 'var(--accent-blue)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {selectedMember.projekt}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </Link>
                ) : (
                  <span style={{ color: 'var(--text-color)' }}>{selectedMember.projekt}</span>
                )}
              </div>
            )}
            {selectedMember.specializations && selectedMember.specializations.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--heading-color)' }}>Spezialisierung</h4>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {selectedMember.specializations.map((specialization, index) => (
                    <span key={index} style={{ 
                      fontSize: '0.85rem', 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: 'rgba(var(--accent-blue-rgb, 0, 163, 255), 0.15)', 
                      color: 'var(--accent-blue)',
                      borderRadius: '4px',
                    }}>
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 