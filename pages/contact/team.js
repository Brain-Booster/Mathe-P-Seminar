import Head from 'next/head';
import styles from '@styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getClientTeamMembers, getClientTeamMembersSync, updateTeamMembers } from '../../models/team';
import { getClientProjects, getClientProjectsSync, updateMockProjects } from '../../models/models';

// Initial team members for rendering
const initialTeamMembers = getClientTeamMembersSync();

export default function AdminTeam() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'edit', 'new'
  const [selectedMember, setSelectedMember] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    nachname: '',
    projekt: '',
    projektId: '',
    profileImage: '/team/default-avatar.png',
    specializations: []
  });
  const [newSpecialization, setNewSpecialization] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Projects state
  const [projects, setProjects] = useState([]);

  // Load client-side team members and projects from server API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // First set with sync data for immediate display
        const initialTeamMembers = getClientTeamMembersSync();
        setTeamMembers(initialTeamMembers);
        
        // Then fetch latest data from server
        const serverTeamMembers = await getClientTeamMembers();
        setTeamMembers(serverTeamMembers);
        console.log('Admin: Team members loaded:', serverTeamMembers.length);
        
        // Load projects
        const projectsData = await getClientProjects();
        setProjects(projectsData);
        
        // Mark component as hydrated after initial client render
        setIsHydrated(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsHydrated(true); // Still mark as hydrated even if there's an error
      }
    };

    // Only run this on the client side
    if (typeof window !== 'undefined') {
      loadData();
      
      // Set up polling to refresh data periodically
      let interval;
      if (activeTab === 'list') {
        interval = setInterval(loadData, 10000); // refresh every 10 seconds
      }
      
      // Clean up
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [activeTab]);

  // Filter team members based on search term
  const filteredTeamMembers = isHydrated
    ? (teamMembers || []).filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.nachname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.projekt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Initialize form data when editing a team member
  useEffect(() => {
    if (selectedMember) {
      setFormData({
        id: selectedMember.id,
        name: selectedMember.name || '',
        nachname: selectedMember.nachname || '',
        projekt: selectedMember.projekt || '',
        projektId: selectedMember.projektId || '',
        profileImage: selectedMember.profileImage || '/team/default-avatar.png',
        specializations: selectedMember.specializations || []
      });
    } else if (activeTab === 'new') {
      // Initialize with empty values for new team member
      setFormData({
        id: teamMembers && teamMembers.length > 0 ? Math.max(...teamMembers.map(m => m.id)) + 1 : 1,
        name: '',
        nachname: '',
        projekt: '',
        projektId: '',
        profileImage: '/team/default-avatar.png',
        specializations: []
      });
    }
  }, [selectedMember, activeTab, teamMembers]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'projektId') {
      // When project selection changes, update both projektId and projekt fields
      const selectedProject = projects.find(p => p.id.toString() === value);
      setFormData({
        ...formData,
        projektId: value,
        projekt: selectedProject ? selectedProject.title : ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let updatedTeamMembers;
      
      if (activeTab === 'edit') {
        // Update existing team member
        updatedTeamMembers = teamMembers.map(member => 
          member.id === formData.id ? formData : member
        );
      } else if (activeTab === 'new') {
        // Add new team member
        updatedTeamMembers = [...teamMembers, formData];
      }
      
      // If projektId changed, update the project's team members array
      let shouldUpdateProjects = false;
      const previousMember = teamMembers.find(m => m.id === formData.id);
      
      // Check if the project assignment is new or changed
      if (formData.projektId && 
         (!previousMember || previousMember.projektId !== formData.projektId)) {
        
        // Find the project to update
        const projectToUpdate = projects.find(p => p.id.toString() === formData.projektId);
        
        if (projectToUpdate) {
          // Create full name for the team member
          const fullName = `${formData.name} ${formData.nachname}`;
          
          // Check if the member is already in the project's team
          if (!projectToUpdate.team || !projectToUpdate.team.includes(fullName)) {
            // Clone the projects array for updating
            const updatedProjects = projects.map(project => {
              if (project.id.toString() === formData.projektId) {
                // Add the team member to the project
                const updatedTeam = project.team ? [...project.team, fullName] : [fullName];
                return {
                  ...project,
                  team: updatedTeam
                };
              }
              return project;
            });
            
            // Update the projects on the server
            updateMockProjects(updatedProjects)
              .then(() => {
                console.log('Project team members updated successfully');
              })
              .catch(error => {
                console.error('Error updating project team members:', error);
              });
            
            shouldUpdateProjects = true;
          }
        }
      }
      
      // Remove member from previous project if the project changed
      if (previousMember && 
          previousMember.projektId && 
          previousMember.projektId !== formData.projektId) {
        
        // Find the previous project
        const previousProject = projects.find(p => p.id.toString() === previousMember.projektId);
        
        if (previousProject && previousProject.team) {
          const fullName = `${previousMember.name} ${previousMember.nachname}`;
          
          // Remove the member from the previous project's team
          if (previousProject.team.includes(fullName)) {
            const updatedProjects = projects.map(project => {
              if (project.id.toString() === previousMember.projektId) {
                return {
                  ...project,
                  team: project.team.filter(member => member !== fullName)
                };
              }
              return project;
            });
            
            // Update the projects on the server
            updateMockProjects(updatedProjects)
              .then(() => {
                console.log('Member removed from previous project');
              })
              .catch(error => {
                console.error('Error updating previous project:', error);
              });
            
            shouldUpdateProjects = true;
          }
        }
      }
      
      // Persist team members to server
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeamMembers),
      });
      if (!response.ok) throw new Error('Server error ' + response.status);
      // Refresh from server
      const serverMembers = await getClientTeamMembers();
      setTeamMembers(serverMembers);
      setActiveTab('list');
      setSelectedMember(null);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error in form submission:', error);
      setIsSubmitting(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Create a form data object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'images');
      
      // Upload the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      // Update the form with the new image URL
      setFormData(prev => ({
        ...prev,
        profileImage: data.fileUrl
      }));
      
      console.log('Image uploaded successfully:', data.fileUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  // Handle creating a new team member
  const handleNewMember = () => {
    setSelectedMember(null);
    setFormData({
      id: null,
      name: '',
      nachname: '',
      projekt: '',
      projektId: '',
      profileImage: '',
      specializations: []
    });
    setActiveTab('new');
  };

  // Handle editing a team member
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setFormData({
      ...member,
      projektId: member.projekt ? projects.find(p => p.title === member.projekt)?.id.toString() : ''
    });
    setActiveTab('edit');
  };

  // Handle deleting a team member
  const handleDeleteMember = async (id) => {
    if (!window.confirm('Sind Sie sicher, dass Sie dieses Teammitglied löschen möchten?')) return;
    const updatedTeamMembers = teamMembers.filter(member => member.id !== id);
    try {
      // Persist deletion to server
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeamMembers),
      });
      if (!response.ok) throw new Error('Server responded with ' + response.status);
      // Refresh from server
      const serverMembers = await getClientTeamMembers();
      setTeamMembers(serverMembers);
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  // Handle adding a specialization
  const handleAddSpecialization = () => {
    if (newSpecialization.trim() !== '' && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  // Handle removing a specialization
  const handleRemoveSpecialization = (specializationToRemove) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(specialization => specialization !== specializationToRemove)
    }));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Team Mitglieder Verwalten | Admin Dashboard</title>
        <meta name="description" content="Team Mitglieder Verwaltung für das Schulprojekt" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '2rem', 
              color: 'var(--title-color)',
              fontWeight: 700,
              margin: 0
            }}>
              Team Mitglieder Verwalten
            </h1>
            <Link 
              href="/contact" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'var(--text-light)',
                textDecoration: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-lighter)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Dashboard
            </Link>
          </div>

          {/* Tabs */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              borderBottom: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}` 
            }}>
              <button 
                onClick={() => setActiveTab('list')} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer', 
                  fontWeight: activeTab === 'list' ? 'bold' : 'normal',
                  color: activeTab === 'list' ? 'var(--accent-blue)' : 'var(--text-color)',
                  borderBottom: activeTab === 'list' ? '2px solid var(--accent-blue)' : 'none',
                  marginBottom: activeTab === 'list' ? '-1px' : '0'
                }}
              >
                Alle Mitglieder
              </button>
              <button 
                onClick={handleNewMember} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer', 
                  fontWeight: activeTab === 'new' ? 'bold' : 'normal',
                  color: activeTab === 'new' ? 'var(--accent-blue)' : 'var(--text-color)',
                  borderBottom: activeTab === 'new' ? '2px solid var(--accent-blue)' : 'none',
                  marginBottom: activeTab === 'new' ? '-1px' : '0'
                }}
              >
                Neues Mitglied
              </button>
              {activeTab === 'edit' && (
                <button 
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    border: 'none', 
                    background: 'none', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    color: 'var(--accent-blue)',
                    borderBottom: '2px solid var(--accent-blue)',
                    marginBottom: '-1px'
                  }}
                >
                  Mitglied bearbeiten
                </button>
              )}
            </div>
          </div>

          {/* List View */}
          {activeTab === 'list' && (
            <>
              {/* Search and Add Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                  <input 
                    type="text"
                    placeholder="Team Mitglieder suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      fontSize: '0.9rem',
                      border: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
                      borderRadius: '4px',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-color)'
                    }}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-light)'
                    }}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <button
                  onClick={handleNewMember}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    backgroundColor: 'var(--accent-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Neues Mitglied
                </button>
              </div>

              {/* Team Members Table */}
              <div style={{ 
                backgroundColor: 'var(--card-bg)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ 
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem'
                }}>
                  <thead>
                    <tr style={{ 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      textAlign: 'left'
                    }}>
                      <th style={{ padding: '1rem' }}>Profilbild</th>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Nachname</th>
                      <th style={{ padding: '1rem' }}>Projekt</th>
                      <th style={{ padding: '1rem' }}>Spezialisierungen</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeamMembers.length > 0 ? (
                      filteredTeamMembers.map((member) => (
                        <tr key={member.id} style={{ 
                          borderTop: `1px solid ${isDarkMode ? '#333' : '#f0f0f0'}` 
                        }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              overflow: 'hidden',
                              backgroundColor: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {member.profileImage ? (
                                <img 
                                  src={member.profileImage} 
                                  alt={`${member.name} ${member.nachname}`} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>{member.name}</td>
                          <td style={{ padding: '1rem' }}>{member.nachname}</td>
                          <td style={{ padding: '1rem' }}>
                            {member.projektId ? (
                              <Link href={`/projects/${member.projektId}`} style={{
                                color: 'var(--accent-blue)',
                                textDecoration: 'none'
                              }}>
                                {member.projekt}
                              </Link>
                            ) : (
                              member.projekt
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap',
                              gap: '0.35rem'
                            }}>
                              {member.specializations && member.specializations.map((specialization, index) => (
                                <span key={index} style={{ 
                                  fontSize: '0.75rem', 
                                  padding: '0.15rem 0.5rem', 
                                  backgroundColor: 'rgba(var(--accent-blue-rgb, 0, 163, 255), 0.15)', 
                                  color: 'var(--accent-blue)',
                                  borderRadius: '4px',
                                }}>
                                  {specialization}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleEditMember(member)}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: isDarkMode ? 'rgba(0, 112, 243, 0.1)' : 'rgba(0, 112, 243, 0.1)',
                                  color: 'var(--accent-blue)',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: isDarkMode ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                                  color: '#ff3b30',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                          {isHydrated ? (
                            searchTerm ? 'Keine Teammitglieder gefunden, die Ihrer Suche entsprechen.' : 'Keine Teammitglieder vorhanden. Erstellen Sie ein neues Mitglied.'
                          ) : (
                            'Lade Teammitglieder...'
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Edit/New Form */}
          {(activeTab === 'edit' || activeTab === 'new') && (
            <div style={{ 
              backgroundColor: 'var(--card-bg)',
              borderRadius: '8px',
              padding: '2rem'
            }}>
              <h2 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: '1.2rem' 
              }}>
                {activeTab === 'new' ? 'Neues Teammitglied erstellen' : 'Teammitglied bearbeiten'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '2rem',
                    marginBottom: '2rem'
                  }}>
                    <div>
                      <div style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '50%', 
                        overflow: 'hidden',
                        backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer'
                      }} onClick={handleImageUpload}>
                        {formData.profileImage ? (
                          <img 
                            src={formData.profileImage} 
                            alt="Profile" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        )}
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '0', 
                          left: '0', 
                          right: '0', 
                          backgroundColor: 'rgba(0,0,0,0.6)', 
                          color: 'white', 
                          padding: '0.25rem',
                          fontSize: '0.75rem',
                          textAlign: 'center'
                        }}>
                          Bild ändern
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem',
                          fontSize: '0.9rem',
                          color: 'var(--text-light)'
                        }}>
                          Name
                        </label>
                        <input 
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '0.9rem',
                            border: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
                            borderRadius: '4px',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-color)'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem',
                          fontSize: '0.9rem',
                          color: 'var(--text-light)'
                        }}>
                          Nachname
                        </label>
                        <input 
                          type="text"
                          name="nachname"
                          value={formData.nachname}
                          onChange={handleInputChange}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '0.9rem',
                            border: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
                            borderRadius: '4px',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-color)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      color: 'var(--text-light)'
                    }}>
                      Projekt
                    </label>
                    <select 
                      name="projektId"
                      value={formData.projektId}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '0.9rem',
                        border: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
                        borderRadius: '4px',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-color)',
                        appearance: 'auto'
                      }}
                    >
                      <option value="">Bitte wählen Sie ein Projekt</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id.toString()}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-light)'
                  }}>
                    Spezialisierungen
                  </label>
                  <div style={{ display: 'flex', marginBottom: '1rem' }}>
                    <input 
                      type="text"
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Neue Spezialisierung hinzufügen"
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        fontSize: '0.9rem',
                        border: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
                        borderRadius: '4px 0 0 4px',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-color)'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSpecialization();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecialization}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--accent-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0 4px 4px 0',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {formData.specializations.map((specialization, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'rgba(var(--accent-blue-rgb, 0, 163, 255), 0.15)',
                          color: 'var(--accent-blue)',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}
                      >
                        {specialization}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(specialization)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-blue)',
                            cursor: 'pointer',
                            padding: '0.1rem',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  borderTop: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
                  paddingTop: '1.5rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    style={{
                      padding: '0.75rem 1.25rem',
                      backgroundColor: 'transparent',
                      color: 'var(--text-color)',
                      border: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '0.75rem 1.25rem',
                      backgroundColor: 'var(--accent-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'Speichern...' : (activeTab === 'new' ? 'Erstellen' : 'Aktualisieren')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 