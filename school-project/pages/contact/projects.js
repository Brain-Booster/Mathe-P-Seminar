import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { getClientProjects, getClientProjectsSync, updateMockProjects } from '../../models.js';
import dynamic from 'next/dynamic';
import { getClientTeamMembers, getClientTeamMembersSync } from '../../models';
import { updateTeamMembers } from '../../models';

// Import ThreeJsViewer with SSR disabled
const ThreeJsViewer = dynamic(() => import('../../components/ThreeJsViewer'), { ssr: false });

// Import ModelViewer with SSR disabled
const ModelViewer = dynamic(() => import('../../components/ModelViewer'), { ssr: false });

// Use the default projects for server-side rendering
const initialProjects = getClientProjectsSync();

// Available categories for select dropdown
const availableCategories = [
  '3D-Design',
  'Web-Entwicklung',
  'Maschinelles Lernen',
  'Spieleentwicklung',
  'Mobile Entwicklung',
  'Embedded Systems',
  'Robotik',
  'Künstliche Intelligenz',
  'Datenanalyse'
];

export default function AdminProjects() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'edit', 'new'
  const [selectedProject, setSelectedProject] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    longDescription: '',
    category: '',
    technologies: [],
    image: '',
    modelPath: '',
    completed: false,
    team: [],
    timeline: '',
    github: ''
  });
  const [layoutSections, setLayoutSections] = useState([
    { id: 'header', type: 'header', title: 'Header', active: true },
    { id: 'description', type: 'text', title: 'Beschreibung', active: true },
    { id: 'technologies', type: 'tags', title: 'Technologien', active: true },
    { id: 'model', type: '3d-model', title: '3D-Modell', active: true },
    { id: 'details', type: 'details', title: 'Details', active: true }
  ]);
  const [newTechnology, setNewTechnology] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef(null);
  const modelInputRef = useRef(null);
  const sectionFileInputRef = useRef(null);
  const sectionModelInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const sectionPdfInputRef = useRef(null);
  
  // Add separate refs for edit section form
  const editSectionFileInputRef = useRef(null);
  const editSectionModelInputRef = useRef(null);
  const editSectionPdfInputRef = useRef(null);
  
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('text');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [newSectionModel, setNewSectionModel] = useState('');
  const [newSectionImage, setNewSectionImage] = useState('');
  const [newSectionPdf, setNewSectionPdf] = useState('');
  
  // Add new state variables for section editing
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editSectionType, setEditSectionType] = useState('text');
  const [editSectionContent, setEditSectionContent] = useState('');
  const [editSectionImage, setEditSectionImage] = useState('');
  const [editSectionModel, setEditSectionModel] = useState('');
  const [editSectionPdf, setEditSectionPdf] = useState('');
  
  // State for team members
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMemberSearch, setTeamMemberSearch] = useState('');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  
  // Load client-side projects from server API on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // First set with sync data for immediate display
        const initialProjects = getClientProjectsSync();
        setProjects(initialProjects);
        
        // Then fetch latest data from server
        const serverProjects = await getClientProjects();
        setProjects(serverProjects);
        console.log('Admin: Projects loaded:', serverProjects.length);
        
        // Mark component as hydrated after initial client render
        setIsHydrated(true);
      } catch (error) {
        console.error('Error loading projects:', error);
        setIsHydrated(true); // Still mark as hydrated even if there's an error
      }
    };

    // Only run this on the client side
    if (typeof window !== 'undefined') {
      loadProjects();
      
      // Set up polling to refresh data periodically
      const intervalId = setInterval(async () => {
        if (activeTab === 'list') { // Only poll when on list view
          try {
            const serverProjects = await getClientProjects();
            setProjects(serverProjects);
          } catch (error) {
            console.error('Error polling projects:', error);
          }
        }
      }, 10000); // Poll every 10 seconds
      
      // Clean up
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [activeTab]);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const fetchedProjects = await getClientProjects();
        setProjects(fetchedProjects);
        
        // Fetch team members
        const fetchedTeamMembers = await getClientTeamMembers();
        setTeamMembers(fetchedTeamMembers);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    // Set initial data synchronously
    if (!isHydrated) {
      setProjects(getClientProjectsSync());
      setTeamMembers(getClientTeamMembersSync());
    }
    
    fetchData();
  }, [isHydrated]);

  // Filter projects based on search term
  const filteredProjects = isHydrated
    ? projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Initialize form data when editing a project
  useEffect(() => {
    if (selectedProject) {
      setFormData({
        id: selectedProject.id,
        title: selectedProject.title || '',
        description: selectedProject.description || '',
        longDescription: selectedProject.longDescription || '',
        category: selectedProject.category || '',
        technologies: selectedProject.technologies || [],
        image: selectedProject.image || '',
        modelPath: selectedProject.modelPath || '',
        completed: selectedProject.completed || false,
        team: selectedProject.team || [],
        timeline: selectedProject.timeline || '',
        github: selectedProject.github || ''
      });
      
      // If the project has layout sections, use them; otherwise, keep current layout
      if (selectedProject.layoutSections) {
        setLayoutSections(selectedProject.layoutSections);
      }
    } else if (activeTab === 'new') {
      // Initialize with empty values for new project
      setFormData({
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        title: '',
        description: '',
        longDescription: '',
        category: '',
        technologies: [],
        image: '',
        modelPath: '',
        completed: false,
        team: [],
        timeline: '',
        github: ''
      });
      
      // Reset layout sections to defaults for new project
      setLayoutSections([
        { id: 'header', type: 'header', title: 'Header', active: true },
        { id: 'description', type: 'text', title: 'Beschreibung', active: true },
        { id: 'technologies', type: 'tags', title: 'Technologien', active: true },
        { id: 'details', type: 'details', title: 'Details', active: true }
      ]);
    }
  }, [selectedProject, activeTab, projects]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle rich text editor changes
  const handleRichTextChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding technologies
  const handleAddTechnology = () => {
    if (newTechnology.trim() !== '' && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  // Handle removing technologies
  const handleRemoveTechnology = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  // Handle adding team members
  const handleAddTeamMember = (memberId) => {
    if (!memberId) return;
    
    const memberToAdd = teamMembers.find(m => m.id === memberId);
    if (!memberToAdd) return;
    
    const fullName = `${memberToAdd.name} ${memberToAdd.nachname}`;
    
    // Check if member is already in the team
    if (formData.team.includes(fullName)) {
      return; // Member already in team
    }
    
    // Update form data with new team member
    setFormData({
      ...formData,
      team: [...formData.team, fullName]
    });
    
    // Update team member with project reference
    const updatedTeamMember = {
      ...memberToAdd,
      projekt: formData.title,
      projektId: formData.id.toString()
    };
    
    // Find index of team member to update
    const memberIndex = teamMembers.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      const updatedTeamMembers = [...teamMembers];
      updatedTeamMembers[memberIndex] = updatedTeamMember;
      setTeamMembers(updatedTeamMembers);
      
      // Update the team members on the server using the updateTeamMembers function from models.js
      updateTeamMembers(updatedTeamMembers)
        .then(() => {
          console.log('Team member updated successfully with project reference');
        })
        .catch(error => {
          console.error('Error updating team member:', error);
        });
    }
    
    // Reset search and close dropdown
    setTeamMemberSearch('');
    setIsTeamDropdownOpen(false);
  };

  // Handle removing team members
  const handleRemoveTeamMember = (memberToRemove) => {
    // Update the form data to remove the team member
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(member => member !== memberToRemove)
    }));
    
    // Find the team member in the team members array
    const teamMember = teamMembers.find(member => 
      `${member.name} ${member.nachname}` === memberToRemove && 
      member.projektId === formData.id.toString()
    );
    
    // If found, update the team member to remove the project reference
    if (teamMember) {
      const updatedTeamMembers = teamMembers.map(member => {
        if (member.id === teamMember.id) {
          return {
            ...member,
            projekt: '',
            projektId: ''
          };
        }
        return member;
      });
      
      // Update team members on the server using updateTeamMembers from models.js
      updateTeamMembers(updatedTeamMembers)
        .then(() => {
          console.log('Team member project reference removed successfully');
          // Update local state
          setTeamMembers(updatedTeamMembers);
        })
        .catch(error => {
          console.error('Error updating team member:', error);
        });
    }
  };

  // Handle layout section toggle
  const handleToggleSection = (sectionId) => {
    setLayoutSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, active: !section.active } 
          : section
      )
    );
  };

  // Handle layout section reorder (move up)
  const handleMoveUp = (index) => {
    if (index > 0) {
      const newSections = [...layoutSections];
      const temp = newSections[index];
      newSections[index] = newSections[index - 1];
      newSections[index - 1] = temp;
      setLayoutSections(newSections);
    }
  };

  // Handle layout section reorder (move down)
  const handleMoveDown = (index) => {
    if (index < layoutSections.length - 1) {
      const newSections = [...layoutSections];
      const temp = newSections[index];
      newSections[index] = newSections[index + 1];
      newSections[index + 1] = temp;
      setLayoutSections(newSections);
    }
  };

  // Handle section deletion
  const handleDeleteSection = (index) => {
    if (confirm("Möchten Sie diesen Abschnitt wirklich löschen?")) {
      const newSections = [...layoutSections];
      newSections.splice(index, 1);
      setLayoutSections(newSections);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Include layoutSections in the project data
    const projectData = { 
      ...formData,
      layoutSections: layoutSections 
    };
    
    // Update projects through the API
    setTimeout(async () => {
      try {
        let updatedProjects;
        
      if (activeTab === 'edit') {
        // Update existing project
          updatedProjects = projects.map(project => 
          project.id === projectData.id ? { ...projectData } : project
        );
      } else {
        // Add new project
        const newProject = { ...projectData };
          updatedProjects = [...projects, newProject];
        }
        
        // Update state immediately for responsive UI
        setProjects(updatedProjects);
        
        // Then update on the server
        await updateMockProjects(updatedProjects);
      
      setIsSubmitting(false);
      setActiveTab('list');
      setSelectedProject(null);

        // Show success message and option to view the project
        const projectId = projectData.id;
        const isNewProject = activeTab === 'new';
        const message = isNewProject 
          ? `Projekt "${projectData.title}" wurde erfolgreich erstellt!` 
          : `Projekt "${projectData.title}" wurde erfolgreich aktualisiert!`;
        
        if (confirm(`${message}\n\nMöchten Sie das Projekt jetzt ansehen?`)) {
          // Navigate to the project detail page
          window.location.href = `/projects/${projectId}`;
        }
      } catch (error) {
        console.error('Error updating projects:', error);
        alert('Fehler beim Speichern der Projekte. Bitte versuchen Sie es erneut.');
        setIsSubmitting(false);
      }
    }, 500); // Simulating API call delay
  };

  // Handle image upload
  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  // Handle image file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'image');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        image: data.fileUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes. Bitte versuchen Sie es erneut.');
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Handle 3D model upload
  const handleModelUpload = () => {
    modelInputRef.current.click();
  };

  // Handle 3D model file selection
  const handleModelFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'model');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        modelPath: data.fileUrl
      }));
    } catch (error) {
      console.error('Error uploading model:', error);
      alert('Fehler beim Hochladen des 3D-Modells. Bitte versuchen Sie es erneut.');
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Handle new project button
  const handleNewProject = () => {
    setActiveTab('new');
    setSelectedProject(null);
    setPreviewMode(false);
  };

  // Handle edit project
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setActiveTab('edit');
    setPreviewMode(false);
  };

  // Handle delete project
  const handleDeleteProject = (id) => {
    if (confirm("Sind Sie sicher, dass Sie dieses Projekt löschen möchten?")) {
      const updatedProjects = projects.filter(project => project.id !== id);
      
      // Update state immediately for responsive UI
      setProjects(updatedProjects);
      
      // Then update on the server
      updateMockProjects(updatedProjects)
        .then(() => {
          // Show confirmation message
          alert("Projekt wurde erfolgreich gelöscht und aus allen Listen entfernt.");
        })
        .catch(error => {
          console.error('Error deleting project:', error);
          alert('Fehler beim Löschen des Projekts. Bitte versuchen Sie es erneut.');
        });
    }
  };

  // Add a new section to the layout
  const handleAddSection = () => {
    if (!newSectionTitle) {
      alert('Bitte einen Titel für den Abschnitt eingeben.');
      return;
    }
    
    let content = '';
    
    // Set content based on section type
    if (newSectionType === 'text') {
      content = newSectionContent;
    } else if (newSectionType === 'image') {
      content = newSectionImage;
    } else if (newSectionType === '3d-model') {
      content = newSectionModel;
    } else if (newSectionType === 'pdf') {
      content = newSectionPdf;
    }
    
    // Required fields validation
    if ((newSectionType === 'image' && !content) || 
        (newSectionType === '3d-model' && !content) || 
        (newSectionType === 'pdf' && !content)) {
      alert(`Bitte wählen Sie eine Datei für den ${
        newSectionType === 'image' ? 'Bild' : 
        newSectionType === '3d-model' ? '3D-Modell' : 'PDF'
      }-Abschnitt aus.`);
      return;
    }
    
    // Add new section
    const newSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      type: newSectionType,
      content: content,
      description: newSectionType === '3d-model' || newSectionType === 'pdf' ? newSectionContent : '',
      active: true
    };
    
    setLayoutSections([...layoutSections, newSection]);
    
    // Reset form fields
    setNewSectionTitle('');
    setNewSectionContent('');
    setNewSectionImage('');
    setNewSectionModel('');
    setNewSectionPdf('');
  };
  
  // Get default title based on section type
  const getDefaultSectionTitle = (type) => {
    switch(type) {
      case 'text': return 'Text';
      case '3d-model': return '3D-Modell';
      case 'image': return 'Bild';
      case 'gallery': return 'Galerie';
      case 'tags': return 'Technologien';
      default: return 'Abschnitt';
    }
  };

  // Handle section image upload
  const handleSectionImageUpload = () => {
    if (sectionFileInputRef.current) {
    sectionFileInputRef.current.click();
    }
  };

  // Handle section image file selection
  const handleSectionFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'image');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setNewSectionImage(data.fileUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes. Bitte versuchen Sie es erneut.');
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Handle section 3D model upload
  const handleSectionModelUpload = () => {
    if (sectionModelInputRef.current) {
    sectionModelInputRef.current.click();
    }
  };

  // Handle section 3D model file selection
  const handleSectionModelFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'model');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setNewSectionModel(data.fileUrl);
    } catch (error) {
      console.error('Error uploading model:', error);
      alert('Fehler beim Hochladen des 3D-Modells. Bitte versuchen Sie es erneut.');
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Handle section PDF upload
  const handleSectionPdfUpload = () => {
    if (sectionPdfInputRef.current) {
      sectionPdfInputRef.current.click();
    }
  };

  // Handle section PDF file selection
  const handleSectionPdfFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'pdf');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setNewSectionPdf(data.fileUrl);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Fehler beim Hochladen des PDFs. Bitte versuchen Sie es erneut.');
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  // Handle section drag start
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.classList.add('dragging');
    
    // Create a visual clone of the element that follows the cursor
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Store the offsets to maintain the position relative to cursor
    e.dataTransfer.setData('offsetX', offsetX);
    e.dataTransfer.setData('offsetY', offsetY);
    
    // Use the actual element as the drag image for better visual feedback
    // This makes the element "stay in hand" while dragging
    e.dataTransfer.setDragImage(e.currentTarget, offsetX, 20);
    
    // Get reference to the element before setTimeout
    const draggedElement = e.currentTarget;
    
    // Hide the original element during drag (visual effect only)
    setTimeout(() => {
      if (draggedElement) {
        draggedElement.style.visibility = 'hidden';
        draggedElement.style.opacity = '0';
        
        // Store item height as CSS variable for animation
        const itemHeight = rect.height;
        document.documentElement.style.setProperty('--item-height', `${itemHeight}px`);
      }
    }, 0);
  };
  
  // Handle section drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const items = document.querySelectorAll('.draggable-section');
    const draggedItem = document.querySelector('.dragging');
    if (!draggedItem) return;
    
    // Get the container to ensure we stay within bounds
    const container = document.querySelector('.sections-container');
    if (container) {
      const containerRect = container.getBoundingClientRect();
      
      // Only process if the cursor is within the container bounds
      if (
        e.clientY >= containerRect.top && 
        e.clientY <= containerRect.bottom &&
        e.clientX >= containerRect.left && 
        e.clientX <= containerRect.right
      ) {
        // Auto-scroll when near container edges
        if (layoutSections.length >= 6) {
          const scrollThreshold = 50; // Pixels from edge to trigger scrolling
          
          // Auto-scroll when near top edge
          if (e.clientY < containerRect.top + scrollThreshold) {
            container.scrollTop -= 10; // Scroll up
          }
          // Auto-scroll when near bottom edge
          else if (e.clientY > containerRect.bottom - scrollThreshold) {
            container.scrollTop += 10; // Scroll down
          }
        }
        
        // Determine target position based on vertical mouse position only
        let targetIndex = null;
        
        items.forEach((item, index) => {
          if (item === draggedItem) return;
          
          const rect = item.getBoundingClientRect();
          const middleY = rect.top + rect.height / 2;
          
          // Find the correct position based on vertical position
          if (e.clientY < middleY && (targetIndex === null || index < targetIndex)) {
            targetIndex = index;
          }
        });
        
        // If no position found and we're below all items, place at the end
        if (targetIndex === null) {
          targetIndex = items.length - 1;
        }
        
        // Remove old placeholder if exists
        const oldPlaceholder = document.querySelector('.drop-placeholder');
        if (oldPlaceholder) {
          oldPlaceholder.remove();
        }
        
        // Reset all animations first
        items.forEach(item => {
          item.classList.remove('items-shifted');
          item.classList.remove('items-shifted-up');
          item.classList.remove('drop-target');
          item.classList.remove('gap-after');
        });
        
        // Add visual effect for elements below the hover position
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        
        // Create and insert placeholder at the correct position
        const placeholder = document.createElement('div');
        placeholder.className = 'drop-placeholder';
        
        // Place the placeholder before or after the target item based on mouse position
        const targetItem = items[targetIndex];
        if (targetItem) {
          const targetRect = targetItem.getBoundingClientRect();
          // If cursor is in the top half of the target, place before, otherwise after
          if (e.clientY < targetRect.top + targetRect.height / 2) {
            targetItem.parentNode.insertBefore(placeholder, targetItem);
            
            // Add up arrow to placeholder
            const arrow = document.createElement('div');
            arrow.className = 'drop-placeholder-arrow top';
            arrow.textContent = '⬆';
            placeholder.appendChild(arrow);
          } else {
            // If it's the last item, append after it
            if (targetIndex === items.length - 1) {
              targetItem.parentNode.appendChild(placeholder);
            } else {
              // Otherwise insert before the next item
              const nextItem = items[targetIndex + 1];
              targetItem.parentNode.insertBefore(placeholder, nextItem);
            }
            
            // Add down arrow to placeholder
            const arrow = document.createElement('div');
            arrow.className = 'drop-placeholder-arrow bottom';
            arrow.textContent = '⬇';
            placeholder.appendChild(arrow);
          }
        } else if (items.length > 0) {
          // If no target (shouldn't happen but just in case), append to the end
          items[items.length - 1].parentNode.appendChild(placeholder);
        }
      }
    }
  };
  
  // Handle section drop
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    // Remove any placeholder
    const placeholder = document.querySelector('.drop-placeholder');
    let placeholderPosition = null;
    
    // Determine the placeholder position before removing it
    if (placeholder) {
      // Find all draggable sections
      const allSections = Array.from(document.querySelectorAll('.draggable-section'));
      
      // Find the section immediately before our placeholder
      let prevSection = placeholder.previousElementSibling;
      while (prevSection && !prevSection.classList.contains('draggable-section')) {
        prevSection = prevSection.previousElementSibling;
      }
      
      if (prevSection) {
        // If there's a previous section, place after it
        const prevIndex = allSections.indexOf(prevSection);
        placeholderPosition = prevIndex + 1;
      } else {
        // If no previous section, place at the beginning
        placeholderPosition = 0;
      }
      
      // Now remove the placeholder
      placeholder.remove();
    }
    
    // Reset all items' visual state
    const items = document.querySelectorAll('.draggable-section');
    items.forEach((item) => {
      item.classList.remove('drop-target');
      item.classList.remove('items-shifted');
      item.classList.remove('items-shifted-up');
      item.classList.remove('gap-after');
      item.style.visibility = '';
      item.style.opacity = '';
    });
    
    // Use the placeholder position if available, otherwise fallback to target
    let actualTargetIndex = placeholderPosition !== null ? placeholderPosition : targetIndex;
    
    // Only move if we're dropping at a different position
    if (sourceIndex === actualTargetIndex) return;
    
    // Handle special case: if dragging down, need to account for the removed item
    if (sourceIndex < actualTargetIndex) {
      actualTargetIndex--;
    }
    
    // Ensure we're only moving up or down
    if (sourceIndex !== actualTargetIndex) {
      // For vertical movement, we just need to know if we're moving up or down
      const newSections = [...layoutSections];
      const temp = newSections[sourceIndex];
      newSections.splice(sourceIndex, 1);
      newSections.splice(actualTargetIndex, 0, temp);
      
      setLayoutSections(newSections);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    
    // Restore visibility of the dragged item if drop wasn't successful
    e.currentTarget.style.visibility = '';
    e.currentTarget.style.opacity = '';
    
    // Remove any placeholder
    const placeholder = document.querySelector('.drop-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
    
    // Reset all items to their original state
    const items = document.querySelectorAll('.draggable-section');
    items.forEach(item => {
      item.classList.remove('drop-target');
      item.classList.remove('items-shifted');
      item.classList.remove('items-shifted-up');
      item.classList.remove('gap-after');
    });
  };

  // Handle editing a section
  const handleEditSection = (section) => {
    // Don't allow editing default components
    if (isDefaultComponent(section.id)) {
      return;
    }
    
    setEditingSectionId(section.id);
    setEditSectionTitle(section.title);
    setEditSectionType(section.type);
    setEditSectionContent(section.type === 'text' ? section.content : section.description || '');
    setEditSectionImage(section.type === 'image' ? section.content : '');
    setEditSectionModel(section.type === '3d-model' ? section.content : '');
    setEditSectionPdf(section.type === 'pdf' ? section.content : '');
  };

  // Handle saving edited section
  const handleSaveEditedSection = () => {
    if (!editSectionTitle) {
      alert('Bitte einen Titel für den Abschnitt eingeben.');
      return;
    }
    
    let content = '';
    let description = '';
    
    // Set content based on section type
    if (editSectionType === 'text') {
      content = editSectionContent;
    } else if (editSectionType === 'image') {
      content = editSectionImage;
      description = editSectionContent; // Use content as description for image
    } else if (editSectionType === '3d-model') {
      content = editSectionModel;
      description = editSectionContent;
    } else if (editSectionType === 'pdf') {
      content = editSectionPdf;
      description = editSectionContent;
    }
    
    // Required fields validation
    if ((editSectionType === 'image' && !content) || 
        (editSectionType === '3d-model' && !content) || 
        (editSectionType === 'pdf' && !content)) {
      alert(`Bitte wählen Sie eine Datei für den ${
        editSectionType === 'image' ? 'Bild' : 
        editSectionType === '3d-model' ? '3D-Modell' : 'PDF'
      }-Abschnitt aus.`);
      return;
    }
    
    // Update the section in layoutSections
    const updatedSections = layoutSections.map(section => {
      if (section.id === editingSectionId) {
        return {
          ...section,
          title: editSectionTitle,
          type: editSectionType,
          content: content,
          description: description
        };
      }
      return section;
    });
    
    setLayoutSections(updatedSections);
    
    // Reset edit form fields
    setEditingSectionId(null);
    setEditSectionTitle('');
    setEditSectionType('text');
    setEditSectionContent('');
    setEditSectionImage('');
    setEditSectionModel('');
    setEditSectionPdf('');
  };

  // Cancel editing section
  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setEditSectionTitle('');
    setEditSectionType('text');
    setEditSectionContent('');
    setEditSectionImage('');
    setEditSectionModel('');
    setEditSectionPdf('');
  };

  // EDIT SECTION UPLOAD HANDLERS
  
  // Handle edit section image upload
  const handleEditSectionImageUpload = () => {
    if (editSectionFileInputRef.current) {
      editSectionFileInputRef.current.click();
    }
  };

  // Handle edit section image file selection
  const handleEditSectionFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'image');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setEditSectionImage(data.fileUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes. Bitte versuchen Sie es erneut.');
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Handle edit section 3D model upload
  const handleEditSectionModelUpload = () => {
    if (editSectionModelInputRef.current) {
      editSectionModelInputRef.current.click();
    }
  };

  // Handle edit section 3D model file selection
  const handleEditSectionModelFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'model');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setEditSectionModel(data.fileUrl);
    } catch (error) {
      console.error('Error uploading model:', error);
      alert('Fehler beim Hochladen des 3D-Modells. Bitte versuchen Sie es erneut.');
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Handle edit section PDF upload
  const handleEditSectionPdfUpload = () => {
    if (editSectionPdfInputRef.current) {
      editSectionPdfInputRef.current.click();
    }
  };

  // Handle edit section PDF file selection
  const handleEditSectionPdfFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'pdf');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setEditSectionPdf(data.fileUrl);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Fehler beim Hochladen des PDFs. Bitte versuchen Sie es erneut.');
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Check if a section is a default component
  const isDefaultComponent = (sectionId) => {
    // These are the IDs of default components that should not be editable
    const defaultComponentIds = ['header', 'description', 'technologies', 'model', 'details', 'project-info'];
    return defaultComponentIds.includes(sectionId);
  };
  
  // Filter team members based on search term
  const filteredTeamMembers = teamMembers.filter(member => {
    const fullName = `${member.name} ${member.nachname}`.toLowerCase();
    return fullName.includes(teamMemberSearch.toLowerCase());
  });
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Projekte verwalten | Schulprojekt</title>
        <meta name="description" content="Projekte verwalten" />
        <link rel="icon" href="/favicon.ico" />
        <Script 
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js" 
          type="module"
          strategy="beforeInteractive"
        />
        <style jsx global>{`
          .dragging {
            opacity: 0.8;
            border: 2px dashed var(--accent-blue) !important;
            position: relative;
            z-index: 10;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transform: rotate(1deg);
          }
          .draggable-section {
            cursor: ns-resize;
            transition: transform 0.1s ease, margin 0.2s ease;
          }
          .draggable-section:before {
            content: "⋮⋮";
            margin-right: 10px;
            color: var(--text-light);
            font-size: 14px;
            cursor: ns-resize;
          }
          .drop-target {
            border-top: 2px solid var(--accent-blue) !important;
            transform: translateY(-8px);
            transition: transform 0.2s ease;
          }
          .sections-container {
            position: relative;
          }
          .draggable-section-placeholder {
            opacity: 0;
            visibility: hidden;
            height: 0;
            overflow: hidden;
            transition: height 0.2s ease, opacity 0.2s ease, margin 0.2s ease;
          }
          .items-shifted {
            transform: translateY(calc(var(--item-height) + 8px));
            transition: transform 0.2s ease;
          }
          .items-shifted-up {
            transform: translateY(calc(-1 * var(--item-height) - 8px));
            transition: transform 0.2s ease;
          }
          .gap-after {
            margin-bottom: calc(var(--item-height) + 16px) !important;
            transition: margin-bottom 0.2s ease;
          }
          .item-height {
            height: var(--item-height);
          }
          .drop-placeholder {
            height: var(--item-height);
            border: 2px dashed var(--accent-blue);
            border-radius: 6px;
            margin: 8px 0;
            background-color: rgba(var(--accent-blue-rgb), 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--accent-blue);
            opacity: 0.8;
            position: relative;
          }
          .drop-placeholder:after {
            content: "Abschnitt hier platzieren";
            font-size: 0.9rem;
          }
          .drop-placeholder-arrow {
            position: absolute;
            left: 15px;
            font-size: 18px;
            color: var(--accent-blue);
          }
          .drop-placeholder-arrow.top {
            top: -20px;
          }
          .drop-placeholder-arrow.bottom {
            bottom: -20px;
          }
        `}</style>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Head>

      <Header />

      <main className={styles.main}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header with navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <Link 
                href="/contact"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  color: 'var(--text-light)',
                  fontSize: '0.95rem',
                  marginBottom: '0.75rem'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Dashboard
              </Link>
              <h1 style={{ 
                fontSize: '2.5rem', 
                margin: '0', 
                color: 'var(--title-color)',
                fontWeight: 700
              }}>
                Projekte verwalten
              </h1>
            </div>
            
            {activeTab === 'list' && (
              <button 
                onClick={handleNewProject}
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  backgroundColor: 'var(--accent-blue)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Neues Projekt
              </button>
            )}
            
            {(activeTab === 'edit' || activeTab === 'new') && (
              <button 
                onClick={() => setActiveTab('list')}
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  backgroundColor: 'var(--bg-lighter)', 
                  color: 'var(--text-color)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Zurück zur Übersicht
              </button>
            )}
          </div>
          
          {/* Projects list view */}
          {activeTab === 'list' && (
            <div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--card-bg)', 
                borderRadius: '8px',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  {isHydrated ? (
                    <><strong>{projects.length}</strong> Projekte insgesamt</>
                  ) : (
                    <span>Projekte werden geladen...</span>
                  )}
                </div>
                <div style={{ width: '250px' }}>
                  <input 
                    type="text" 
                    placeholder="Projekte suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.6rem', 
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-color)'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {isHydrated ? (
                  <>
                    <div className="table-responsive" style={{ 
                      overflowX: 'auto', 
                      WebkitOverflowScrolling: 'touch',
                      width: '100%' 
              }}>
                <table style={{ 
                  width: '100%', 
                        minWidth: '700px', /* Ensure minimum width for small screens */
                  borderCollapse: 'collapse',
                  color: 'var(--text-color)',
                  fontSize: '0.95rem'
                }}>
                  <thead>
                    <tr style={{ 
                      backgroundColor: 'var(--bg-lighter)', 
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Titel</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Kategorie</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map(project => (
                      <tr key={project.id} style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        ':hover': { backgroundColor: 'var(--bg-darker)' }
                      }}>
                        <td style={{ padding: '1rem' }}>{project.id}</td>
                        <td style={{ padding: '1rem' }}>{project.title}</td>
                        <td style={{ padding: '1rem' }}>{project.category}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            backgroundColor: project.completed ? 'rgba(var(--accent-lime-rgb), 0.15)' : 'rgba(var(--accent-yellow-rgb), 0.15)',
                            color: project.completed ? 'var(--accent-lime)' : 'var(--accent-yellow)'
                          }}>
                            {project.completed ? 'Abgeschlossen' : 'In Bearbeitung'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleEditProject(project)}
                              style={{ 
                                padding: '0.4rem',
                                backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)',
                                color: 'var(--accent-blue)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Bearbeiten"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <Link 
                              href={`/projects/${project.id}`}
                              target="_blank"
                              style={{ 
                                padding: '0.4rem',
                                backgroundColor: 'rgba(var(--text-light-rgb), 0.1)',
                                color: 'var(--text-light)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'inline-flex'
                              }}
                              title="Anzeigen"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </Link>
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
                              style={{ 
                                padding: '0.4rem',
                                backgroundColor: 'rgba(var(--accent-red-rgb), 0.1)',
                                color: 'var(--accent-red)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Löschen"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                    </div>
                
                {filteredProjects.length === 0 && (
                  <div style={{ 
                    padding: '2rem 0', 
                    textAlign: 'center', 
                    color: 'var(--text-light)'
                  }}>
                    Keine Projekte gefunden.
                  </div>
                )}
                  </>
                ) : (
                  <div style={{ 
                    padding: '3rem 0', 
                    textAlign: 'center', 
                    color: 'var(--text-light)'
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                      </svg>
                    </div>
                    Projekte werden geladen...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Placeholder for edit and new forms - Will be implemented in the next step */}
          {(activeTab === 'edit' || activeTab === 'new') && (
            <div>
              {/* Form tabs */}
              <div style={{
                display: 'flex',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <button
                  onClick={() => setPreviewMode(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: !previewMode ? 'var(--accent-blue)' : 'var(--text-light)',
                    fontWeight: !previewMode ? '600' : '400',
                    borderBottom: !previewMode ? '2px solid var(--accent-blue)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: previewMode ? 'var(--accent-blue)' : 'var(--text-light)',
                    fontWeight: previewMode ? '600' : '400',
                    borderBottom: previewMode ? '2px solid var(--accent-blue)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Vorschau
                </button>
              </div>

              {/* Form Content */}
              {!previewMode ? (
                <form onSubmit={handleSubmit}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '2rem'
                  }}>
                    {/* Left column - Main project information */}
                    <div>
                      <div style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        <h2 style={{
                          fontSize: '1.2rem',
                          marginTop: 0,
                          marginBottom: '1.5rem',
                          color: 'var(--heading-color)'
                        }}>
                          Projekt-Informationen
                        </h2>

                        {/* Title input */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            htmlFor="title"
                            style={{
                              display: 'block',
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--text-color)'
                            }}
                          >
                            Titel *
                          </label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '1rem'
                            }}
                          />
                        </div>

                        {/* Short description input */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            htmlFor="description"
                            style={{
                              display: 'block',
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--text-color)'
                            }}
                          >
                            Kurzbeschreibung *
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '1rem',
                              resize: 'vertical'
                            }}
                          />
                        </div>

                        {/* Long description input */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            htmlFor="longDescription"
                            style={{
                              display: 'block',
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--text-color)'
                            }}
                          >
                            Ausführliche Beschreibung
                          </label>
                          <textarea
                            id="longDescription"
                            name="longDescription"
                            value={formData.longDescription}
                            onChange={handleInputChange}
                            rows={8}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '1rem',
                              resize: 'vertical'
                            }}
                          />
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                            Unterstützt Markdown-Formatierung
                          </p>
                        </div>

                        {/* Category select */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            htmlFor="category"
                            style={{
                              display: 'block',
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--text-color)'
                            }}
                          >
                            Kategorie *
                          </label>
                          <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            placeholder="Kategorie eingeben"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '1rem'
                            }}
                          />
                        </div>

                        {/* Completed checkbox */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.9rem',
                              color: 'var(--text-color)',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              name="completed"
                              checked={formData.completed}
                              onChange={handleInputChange}
                              style={{ marginRight: '0.5rem' }}
                            />
                            Projekt abgeschlossen
                          </label>
                        </div>
                        
                        {/* Project header image upload */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            style={{
                              display: 'block',
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--text-color)'
                            }}
                          >
                            Projektbild
                          </label>
                          
                          {formData.image ? (
                            <div style={{
                              position: 'relative',
                              marginBottom: '0.75rem'
                            }}>
                              <img 
                                src={formData.image}
                                alt="Projektbild Vorschau"
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: '200px',
                                  objectFit: 'cover',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-color)'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                style={{
                                  position: 'absolute',
                                  top: '0.5rem',
                                  right: '0.5rem',
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleImageUpload}
                              style={{
                                width: '100%',
                                padding: '1rem',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '6px',
                                backgroundColor: 'var(--bg-lighter)',
                                color: 'var(--text-light)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                fontSize: '0.9rem'
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              Projektbild hochladen
                            </button>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                          />
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                            Dieses Bild wird als Kopfzeile des Projekts angezeigt
                          </p>
                        </div>
                      </div>

                      {/* Technologies section */}
                      <div style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        <h2 style={{
                          fontSize: '1.2rem',
                          marginTop: 0,
                          marginBottom: '1.5rem',
                          color: 'var(--heading-color)'
                        }}>
                          Technologien
                        </h2>

                        <div style={{ display: 'flex', marginBottom: '1rem' }}>
                          <input
                            type="text"
                            value={newTechnology}
                            onChange={(e) => setNewTechnology(e.target.value)}
                            placeholder="Neue Technologie hinzufügen"
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              borderRadius: '6px 0 0 6px',
                              border: '1px solid var(--border-color)',
                              borderRight: 'none',
                              backgroundColor: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '1rem'
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTechnology();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddTechnology}
                            style={{
                              padding: '0 1rem',
                              backgroundColor: 'var(--accent-blue)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0 6px 6px 0',
                              cursor: 'pointer'
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {formData.technologies.map((tech, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)',
                                color: 'var(--accent-blue)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                              }}
                            >
                              {tech}
                              <button
                                type="button"
                                onClick={() => handleRemoveTechnology(tech)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent-blue)',
                                  marginLeft: '0.5rem',
                                  cursor: 'pointer',
                                  padding: '0.1rem',
                                  fontSize: '1rem',
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

                      {/* Additional details */}
                      <div style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        <h2 style={{
                          fontSize: '1.2rem',
                          marginTop: 0,
                          marginBottom: '1.5rem',
                          color: 'var(--heading-color)'
                        }}>
                          Zusätzliche Details
                        </h2>

                        {/* Team members */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label
                            style={{
                              display: 'block',
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--text-color)'
                            }}
                          >
                            Team-Mitglieder
                          </label>

                          <div style={{ display: 'flex', marginBottom: '1rem', position: 'relative' }}>
                            <input
                              type="text"
                              value={teamMemberSearch}
                              onChange={(e) => {
                                setTeamMemberSearch(e.target.value);
                                setIsTeamDropdownOpen(true);
                              }}
                              onClick={() => setIsTeamDropdownOpen(true)}
                              placeholder="Teammitglieder suchen..."
                              style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '6px 0 0 6px',
                                border: '1px solid var(--border-color)',
                                borderRight: 'none',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-color)',
                                fontSize: '1rem'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                              style={{
                                padding: '0 1rem',
                                backgroundColor: 'var(--accent-blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0 6px 6px 0',
                                cursor: 'pointer'
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 15l-6-6-6 6"/>
                              </svg>
                            </button>
                            
                            {isTeamDropdownOpen && (
                              <div 
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  right: 0,
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  backgroundColor: 'var(--card-bg)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '0 0 6px 6px',
                                  zIndex: 10,
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }}
                              >
                                {filteredTeamMembers.length > 0 ? (
                                  filteredTeamMembers.map(member => (
                                    <div 
                                      key={member.id}
                                      onClick={() => handleAddTeamMember(member.id)}
                                      style={{
                                        padding: '0.75rem',
                                        borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                      }}
                                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-lighter)'}
                                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <div style={{ 
                                        width: '30px', 
                                        height: '30px', 
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
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 'bold' }}>{member.name} {member.nachname}</div>
                                        {member.projekt && (
                                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                            {member.projekt}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ padding: '0.75rem', color: 'var(--text-light)', textAlign: 'center' }}>
                                    Keine Teammitglieder gefunden
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {formData.team.map((member, index) => (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: 'var(--bg-lighter)',
                                  borderRadius: '4px',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {member}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTeamMember(member)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-light)',
                                    cursor: 'pointer',
                                    padding: '0.1rem',
                                    fontSize: '1rem',
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

                        {/* Timeline input */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            htmlFor="timeline"
                            style={{
                              display: 'block',
                              marginBottom: '0.5rem',
                              fontSize: '0.9rem',
                              color: 'var(--text-color)'
                            }}
                          >
                            Zeitraum
                          </label>
                          <input
                            type="text"
                            id="timeline"
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleInputChange}
                            placeholder="z.B. Januar 2023 - März 2023"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--input-bg)',
                              color: 'var(--text-color)',
                              fontSize: '1rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column - Layout */}
                    <div>
                      {/* Layout customization */}
                      <div style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '8px',
                        padding: '1.5rem'
                      }}>
                        <h2 style={{
                          fontSize: '1.2rem',
                          marginTop: 0,
                          marginBottom: '1.5rem',
                          color: 'var(--heading-color)'
                        }}>
                          Layout anpassen
                        </h2>
                        
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                          Aktiviere oder deaktiviere Abschnitte und ändere ihre Reihenfolge, um das Layout der Projektseite anzupassen.
                        </p>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                              type="text"
                              placeholder="Titel für neuen Abschnitt"
                              value={newSectionTitle}
                              onChange={(e) => setNewSectionTitle(e.target.value)}
                            style={{
                                flex: 2,
                                padding: '0.6rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-lighter)',
                              color: 'var(--text-color)'
                            }}
                            />
                            <select
                              value={newSectionType}
                              onChange={(e) => setNewSectionType(e.target.value)}
                                style={{
                                flex: 1,
                                padding: '0.6rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-lighter)',
                                color: 'var(--text-color)'
                              }}
                            >
                              <option value="text">Text</option>
                              <option value="3d-model">3D-Modell</option>
                              <option value="image">Bild</option>
                              <option value="pdf">PDF</option>
                            </select>
                            </div>
                          
                          {/* Content fields based on section type */}
                          {newSectionType === 'text' && (
                            <div style={{ marginBottom: '1rem' }}>
                              <textarea
                                placeholder="Text-Inhalt für den Abschnitt"
                                value={newSectionContent}
                                onChange={(e) => setNewSectionContent(e.target.value)}
                                rows={4}
                              style={{
                                width: '100%',
                                  padding: '0.6rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-lighter)',
                                  color: 'var(--text-color)',
                                  resize: 'vertical'
                                }}
                          />
                        </div>
                          )}
                          
                          {newSectionType === '3d-model' && (
                            <div style={{ marginBottom: '1rem' }}>
                              {newSectionModel ? (
                              <div style={{
                                padding: '0.75rem',
                                backgroundColor: 'var(--bg-lighter)',
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.75rem'
                              }}>
                                <span style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                                    {newSectionModel.split('/').pop()}
                                </span>
                                <button
                                  type="button"
                                    onClick={() => setNewSectionModel('')}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-light)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                >
                                  &times;
                                </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                                  onClick={handleSectionModelUpload}
                              style={{
                                width: '100%',
                                padding: '1rem',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '6px',
                                backgroundColor: 'var(--bg-lighter)',
                                color: 'var(--text-light)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                fontSize: '0.9rem'
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                              </svg>
                              3D-Modell hochladen
                            </button>
                          )}
                          <input
                            type="file"
                                ref={sectionModelInputRef}
                                onChange={handleSectionModelFileChange}
                            accept=".glb,.gltf"
                            style={{ display: 'none' }}
                          />
                              
                              <textarea
                                placeholder="Beschreibung für das 3D-Modell (optional)"
                                value={newSectionContent}
                                onChange={(e) => setNewSectionContent(e.target.value)}
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '0.6rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-lighter)',
                                  color: 'var(--text-color)',
                                  resize: 'vertical',
                                  marginTop: '0.75rem'
                                }}
                              />
                            </div>
                          )}
                          
                          {newSectionType === 'pdf' && (
                            <div style={{ marginBottom: '1rem' }}>
                              {newSectionPdf ? (
                                <div style={{
                                  padding: '0.75rem',
                                  backgroundColor: 'var(--bg-lighter)',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '0.75rem'
                                }}>
                                  <span style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                                    {newSectionPdf.split('/').pop()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setNewSectionPdf('')}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-light)',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      fontSize: '1rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSectionPdfUpload}
                                  style={{
                                    width: '100%',
                                    padding: '1rem',
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--bg-lighter)',
                                    color: 'var(--text-light)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                  </svg>
                                  PDF hochladen
                                </button>
                              )}
                              <input
                                type="file"
                                ref={sectionPdfInputRef}
                                onChange={handleSectionPdfFileChange}
                                accept=".pdf"
                                style={{ display: 'none' }}
                              />
                              
                              <textarea
                                placeholder="Beschreibung für das PDF (optional)"
                                value={newSectionContent}
                                onChange={(e) => setNewSectionContent(e.target.value)}
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '0.6rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-lighter)',
                                  color: 'var(--text-color)',
                                  resize: 'vertical',
                                  marginTop: '0.75rem'
                                }}
                              />
                            </div>
                          )}
                          
                          {(newSectionType === 'image' || newSectionType === 'gallery') && (
                            <div style={{ marginBottom: '1rem' }}>
                              {newSectionImage ? (
                                <div style={{
                                  position: 'relative',
                                  marginBottom: '0.75rem'
                                }}>
                                  <img 
                                    src={newSectionImage}
                                    alt="Vorschau"
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      borderRadius: '6px',
                                      border: '1px solid var(--border-color)'
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setNewSectionImage('')}
                                    style={{
                                      position: 'absolute',
                                      top: '0.5rem',
                                      right: '0.5rem',
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '50%',
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      border: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSectionImageUpload}
                                  style={{
                                    width: '100%',
                                    padding: '1rem',
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--bg-lighter)',
                                    color: 'var(--text-light)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}>
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                  </svg>
                                  Bild hochladen
                                </button>
                              )}
                              <input
                                type="file"
                                ref={sectionFileInputRef}
                                onChange={handleSectionFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                              />
                              
                              <textarea
                                placeholder="Beschreibung für das Bild (optional)"
                                value={newSectionContent}
                                onChange={(e) => setNewSectionContent(e.target.value)}
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '0.6rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-lighter)',
                                  color: 'var(--text-color)',
                                  resize: 'vertical',
                                  marginTop: '0.75rem'
                                }}
                              />
                            </div>
                          )}
                          
                          <button
                            type="button"
                            onClick={handleAddSection}
                            style={{
                              padding: '0.6rem 1rem',
                              backgroundColor: 'var(--accent-blue)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Hinzufügen
                          </button>
                        </div>
                        
                        {/* Add section edit form */}
                        {editingSectionId && (
                          <div style={{
                            backgroundColor: 'var(--bg-darker)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginTop: '1.5rem',
                            marginBottom: '1.5rem',
                            border: '1px solid var(--border-color)'
                          }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Abschnitt bearbeiten</h3>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                              <input
                                type="text"
                                placeholder="Titel für Abschnitt"
                                value={editSectionTitle}
                                onChange={(e) => setEditSectionTitle(e.target.value)}
                                style={{
                                  flex: 2,
                                  padding: '0.6rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-lighter)',
                                  color: 'var(--text-color)'
                                }}
                              />
                              <select
                                value={editSectionType}
                                onChange={(e) => setEditSectionType(e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '0.6rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-lighter)',
                                  color: 'var(--text-color)'
                                }}
                              >
                                <option value="text">Text</option>
                                <option value="3d-model">3D-Modell</option>
                                <option value="image">Bild</option>
                                <option value="pdf">PDF</option>
                              </select>
                            </div>
                            
                            {/* Content fields based on section type */}
                            {(editSectionType === 'text' || editSectionType === '3d-model' || editSectionType === 'pdf' || editSectionType === 'image') && (
                              <div style={{ marginBottom: '1rem' }}>
                                <textarea
                                  placeholder={
                                    editSectionType === 'text' 
                                      ? "Text-Inhalt für den Abschnitt" 
                                      : editSectionType === 'image'
                                        ? "Beschreibung für das Bild (optional)"
                                        : editSectionType === '3d-model'
                                          ? "Beschreibung für das 3D-Modell (optional)"
                                          : "Beschreibung für das PDF (optional)"
                                  }
                                  value={editSectionContent}
                                  onChange={(e) => setEditSectionContent(e.target.value)}
                                  rows={4}
                                  style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-lighter)',
                                    color: 'var(--text-color)',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                            )}
                            
                            {editSectionType === 'image' && (
                              <div style={{ marginBottom: '1rem' }}>
                                {editSectionImage ? (
                                  <div style={{
                                    position: 'relative',
                                    marginBottom: '0.75rem'
                                  }}>
                                    <img 
                                      src={editSectionImage}
                                      alt="Vorschau"
                                      style={{
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)'
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setEditSectionImage('')}
                                      style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleEditSectionImageUpload}
                                    style={{
                                      width: '100%',
                                      padding: '1rem',
                                      border: '2px dashed var(--border-color)',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--bg-lighter)',
                                      color: 'var(--text-light)',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}>
                                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                      <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    Bild hochladen
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {editSectionType === '3d-model' && (
                              <div style={{ marginBottom: '1rem' }}>
                                {editSectionModel ? (
                                  <div style={{
                                    position: 'relative',
                                    marginBottom: '0.75rem',
                                    padding: '1rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--bg-lighter)'
                                  }}>
                                    <div style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>
                                      {editSectionModel}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEditSectionModel('')}
                                      style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: 'var(--bg-darker)',
                                        color: 'var(--text-light)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleEditSectionModelUpload}
                                    style={{
                                      width: '100%',
                                      padding: '1rem',
                                      border: '2px dashed var(--border-color)',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--bg-lighter)',
                                      color: 'var(--text-light)',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}>
                                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                    </svg>
                                    3D-Modell hochladen
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {editSectionType === 'pdf' && (
                              <div style={{ marginBottom: '1rem' }}>
                                {editSectionPdf ? (
                                  <div style={{
                                    position: 'relative',
                                    marginBottom: '0.75rem',
                                    padding: '1rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--bg-lighter)'
                                  }}>
                                    <div style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>
                                      {editSectionPdf}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEditSectionPdf('')}
                                      style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: 'var(--bg-darker)',
                                        color: 'var(--text-light)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleEditSectionPdfUpload}
                                    style={{
                                      width: '100%',
                                      padding: '1rem',
                                      border: '2px dashed var(--border-color)',
                                      borderRadius: '6px',
                                      backgroundColor: 'var(--bg-lighter)',
                                      color: 'var(--text-light)',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}>
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                      <line x1="16" y1="13" x2="8" y2="13"></line>
                                      <line x1="16" y1="17" x2="8" y2="17"></line>
                                      <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    PDF hochladen
                                  </button>
                                )}
                              </div>
                            )}
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                style={{
                                  padding: '0.6rem 1rem',
                                  backgroundColor: 'var(--bg-lighter)',
                                  color: 'var(--text-color)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Abbrechen
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEditedSection}
                                style={{
                                  padding: '0.6rem 1rem',
                                  backgroundColor: 'var(--accent-blue)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Speichern
                              </button>
                            </div>
                            
                            {/* Hidden file inputs for edit section */}
                            <input
                              type="file"
                              ref={editSectionFileInputRef}
                              onChange={handleEditSectionFileChange}
                              accept="image/*"
                              style={{ display: 'none' }}
                            />
                            <input
                              type="file"
                              ref={editSectionModelInputRef}
                              onChange={handleEditSectionModelFileChange}
                              accept=".glb,.gltf"
                              style={{ display: 'none' }}
                            />
                            <input
                              type="file"
                              ref={editSectionPdfInputRef}
                              onChange={handleEditSectionPdfFileChange}
                              accept=".pdf"
                              style={{ display: 'none' }}
                            />
                          </div>
                        )}
                        
                        <div style={{
                          maxHeight: layoutSections.length >= 6 ? '300px' : 'none',
                          overflowY: layoutSections.length >= 6 ? 'auto' : 'visible',
                          paddingRight: layoutSections.length >= 6 ? '10px' : '0',
                          marginRight: layoutSections.length >= 6 ? '-10px' : '0'
                        }} className="sections-container">
                          {layoutSections.map((section, index) => (
                            <div
                              key={section.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index)}
                              onDragEnd={handleDragEnd}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'var(--bg-lighter)',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                marginBottom: '0.5rem'
                              }}
                              className="draggable-section"
                            >
                              <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
                                <span style={{
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)',
                                  color: 'var(--accent-blue)',
                                  borderRadius: '4px',
                                  marginRight: '0.75rem'
                                }}>
                                  {index + 1}
                                </span>
                                <span style={{ color: section.active ? 'var(--text-color)' : 'var(--text-light)' }}>
                                  {section.title}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleEditSection(section)}
                                  disabled={isDefaultComponent(section.id)}
                                  style={{
                                    padding: '0.3rem',
                                    backgroundColor: isDefaultComponent(section.id) 
                                      ? 'rgba(var(--text-light-rgb), 0.1)' 
                                      : 'rgba(var(--accent-blue-rgb), 0.1)',
                                    color: isDefaultComponent(section.id) 
                                      ? 'var(--text-light)' 
                                      : 'var(--accent-blue)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    cursor: isDefaultComponent(section.id) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: isDefaultComponent(section.id) ? 0.5 : 1
                                  }}
                                  title={isDefaultComponent(section.id) 
                                    ? "Standard-Komponente kann nicht bearbeitet werden" 
                                    : "Abschnitt bearbeiten"}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSection(index)}
                                  style={{
                                    padding: '0.3rem',
                                    backgroundColor: 'rgba(var(--accent-red-rgb), 0.1)',
                                    color: 'var(--accent-red)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title="Abschnitt löschen"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                </button>
                                <label
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={section.active}
                                    onChange={() => handleToggleSection(section.id)}
                                    style={{ marginRight: '0.3rem' }}
                                  />
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                    Aktiv
                                  </span>
                                </label>
                              </div>
                            </div>
                          ))}
                          
                          {/* Section editing form has been moved above the sections list */}
                          
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Form actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    padding: '1.5rem 0'
                  }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--bg-lighter)',
                        color: 'var(--text-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                      }}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--accent-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isSubmitting ? 'wait' : 'pointer',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {isSubmitting && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                          <line x1="12" y1="2" x2="12" y2="6"></line>
                          <line x1="12" y1="18" x2="12" y2="22"></line>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                          <line x1="2" y1="12" x2="6" y2="12"></line>
                          <line x1="18" y1="12" x2="22" y2="12"></line>
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                      )}
                      {activeTab === 'edit' ? 'Änderungen speichern' : 'Projekt erstellen'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Preview Mode - show how the project page would look */
                <div style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  padding: '2rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem' 
                  }}>
                    <h2 style={{ margin: 0 }}>Vorschau: {formData.title || 'Neues Projekt'}</h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                      Dies ist eine Vorschau der Projektseite
                    </div>
                  </div>

                  {/* Helper hint for editing sections by clicking */}
                  <div style={{
                    backgroundColor: 'rgba(var(--accent-blue-rgb), 0.05)',
                    border: '1px solid rgba(var(--accent-blue-rgb), 0.1)',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--accent-blue)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Klicken Sie auf einen Abschnitt, um ihn zu bearbeiten. Die Änderungen werden in der Vorschau sofort angezeigt.
                  </div>

                  {/* Header Section - Always shown first */}
                  <div style={{ 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    marginBottom: '2rem',
                    position: 'relative',
                    height: '300px',
                    backgroundColor: 'var(--bg-darker)'
                  }}>
                    {formData.image ? (
                      <div style={{
                        backgroundImage: `url(${formData.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '100%',
                        width: '100%'
                      }} />
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        backgroundColor: 'var(--bg-darker)',
                        color: 'var(--text-light)'
                      }}>
                        Kein Bild ausgewählt
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: '1.5rem'
                    }}>
                      <h1 style={{ 
                        color: 'white', 
                        margin: 0, 
                        fontSize: '2rem',
                        fontWeight: 'bold' 
                      }}>
                        {formData.title || 'Projekttitel'}
                      </h1>
                      <p style={{ color: '#ddd', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                        {formData.description || 'Projektbeschreibung wird hier angezeigt.'}
                      </p>
                    </div>
                  </div>

                  {/* Render content based on layout sections */}
                  {layoutSections
                    .filter(section => section.active)
                    .map((section) => {
                      switch (section.type) {
                        case 'text':
                          return (
                            <div 
                              key={section.id} 
                              style={{
                              backgroundColor: 'var(--card-bg)',
                              padding: '1.5rem',
                              borderRadius: '8px',
                              marginBottom: '2rem',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                              }}
                              onClick={() => handleEditSection(section)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--accent-blue-rgb), 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{section.title}</h2>
                              <div style={{ 
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.6',
                                color: 'var(--text-color)'
                              }}>
                                {section.content || formData.longDescription || 'Keine Beschreibung verfügbar.'}
                              </div>
                            </div>
                          );
                        
                        case '3d-model':
                          return (
                            <div 
                              key={section.id} 
                              style={{
                              backgroundColor: 'var(--card-bg)',
                              padding: '1.5rem',
                              borderRadius: '8px',
                              marginBottom: '2rem',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                              }}
                              onClick={() => handleEditSection(section)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--accent-blue-rgb), 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{section.title}</h2>
                              <div style={{ 
                                height: '400px', 
                                backgroundColor: 'var(--bg-darker)', 
                                borderRadius: '8px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-light)'
                              }}>
                                {formData.modelPath ? (
                                  <div style={{ 
                                    width: '100%', 
                                    height: '100%'
                                  }}>
                                    <ModelViewer 
                                      modelPath={formData.modelPath}
                                      poster="/images/3d-model-placeholder.png"
                                      alt="3D Model"
                                    />
                                  </div>
                                ) : (
                                  'Kein 3D-Modell ausgewählt'
                                )}
                              </div>
                              {section.description && (
                                <div style={{ 
                                  marginTop: '1rem',
                                  fontSize: '0.95rem',
                                  color: 'var(--text-color)',
                                  lineHeight: '1.6'
                                }}>
                                  {section.description}
                                </div>
                              )}
                            </div>
                          );
                        
                        case 'tags':
                          return (
                            <div 
                              key={section.id} 
                              style={{
                              backgroundColor: 'var(--card-bg)',
                              padding: '1.5rem',
                              borderRadius: '8px',
                              marginBottom: '2rem',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                              }}
                              onClick={() => handleEditSection(section)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--accent-blue-rgb), 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{section.title}</h2>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {formData.technologies.length > 0 ? (
                                  formData.technologies.map((tech, index) => (
                                    <span
                                      key={index}
                                      style={{
                                        backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)',
                                        color: 'var(--accent-blue)',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                      }}
                                    >
                                      {tech}
                                    </span>
                                  ))
                                ) : (
                                  <span style={{ color: 'var(--text-light)' }}>
                                    Keine Technologien angegeben
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                          
                        case 'details':
                          return (
                            <div 
                              key={section.id} 
                              style={{
                              backgroundColor: 'var(--card-bg)',
                              padding: '1.5rem',
                              borderRadius: '8px',
                              marginBottom: '2rem',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                              }}
                              onClick={() => handleEditSection(section)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--accent-blue-rgb), 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{section.title}</h2>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Teammitglieder</h3>
                                  {formData.team.length > 0 ? (
                                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                                      {formData.team.map((member, index) => (
                                        <li key={index} style={{ marginBottom: '0.5rem' }}>{member}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span style={{ color: 'var(--text-light)' }}>
                                      Keine Teammitglieder angegeben
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Zeitraum</h3>
                                  <p style={{ margin: 0 }}>
                                    {formData.timeline || 'Kein Zeitraum angegeben'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                          
                        case 'image':
                          return (
                            <div 
                              key={section.id} 
                              style={{
                              backgroundColor: 'var(--card-bg)',
                              padding: '1.5rem',
                              borderRadius: '8px',
                              marginBottom: '2rem',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                              }}
                              onClick={() => handleEditSection(section)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--accent-blue-rgb), 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{section.title}</h2>
                              <div style={{ 
                                borderRadius: '8px',
                                overflow: 'visible',
                                backgroundColor: 'var(--bg-darker)'
                              }}>
                                {section.content ? (
                                  <img 
                                    src={section.content} 
                                    alt={section.title}
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      display: 'block',
                                      borderRadius: '8px'
                                    }}
                                  />
                                ) : (
                                  <div style={{ 
                                    padding: '2rem',
                                    backgroundColor: 'var(--bg-darker)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-light)'
                                  }}>
                                    Kein Bild ausgewählt
                                  </div>
                                )}
                              </div>
                              {section.description && (
                                <div style={{ 
                                  marginTop: '1rem',
                                  fontSize: '0.95rem',
                                  color: 'var(--text-color)',
                                  lineHeight: '1.6'
                                }}>
                                  {section.description}
                                </div>
                              )}
                            </div>
                          );
                          
                        case 'pdf':
                          return (
                            <div 
                              key={section.id} 
                              style={{
                                backgroundColor: 'var(--card-bg)',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                marginBottom: '2rem',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                              }}
                              onClick={() => handleEditSection(section)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--accent-blue-rgb), 0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{section.title}</h2>
                              <div style={{ 
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: 'var(--bg-darker)',
                                height: '500px'
                              }}>
                                {section.content ? (
                                  <object
                                    data={section.content}
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                    style={{ borderRadius: '8px' }}
                                  >
                                    <div style={{ 
                                      padding: '2rem',
                                      backgroundColor: 'var(--bg-darker)',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column',
                                      color: 'var(--text-light)',
                                      height: '100%'
                                    }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                      </svg>
                                      <p>Der PDF-Viewer wird hier angezeigt.</p>
                                      <a 
                                        href={section.content} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{
                                          padding: '0.5rem 1rem',
                                          backgroundColor: 'var(--accent-blue)',
                                          color: 'white',
                                          borderRadius: '4px',
                                          textDecoration: 'none',
                                          marginTop: '1rem'
                                        }}
                                      >
                                        PDF öffnen
                                      </a>
                                    </div>
                                  </object>
                                ) : (
                                  <div style={{ 
                                    padding: '2rem',
                                    backgroundColor: 'var(--bg-darker)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-light)'
                                  }}>
                                    Kein PDF ausgewählt
                                  </div>
                                )}
                              </div>
                              {section.description && (
                                <div style={{ 
                                  marginTop: '1rem',
                                  fontSize: '0.95rem',
                                  color: 'var(--text-color)',
                                  lineHeight: '1.6'
                                }}>
                                  {section.description}
                                </div>
                              )}
                            </div>
                          );
                          
                        case 'gallery':
                          return (
                            <div key={section.id} style={{
                              backgroundColor: 'var(--card-bg)',
                              padding: '1.5rem',
                              borderRadius: '8px',
                              marginBottom: '2rem',
                              border: '1px solid var(--border-color)'
                            }}>
                              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{section.title}</h2>
                              <div style={{ 
                                padding: '2rem',
                                backgroundColor: 'var(--bg-darker)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-light)'
                              }}>
                                Galerie-Inhalt
                              </div>
                            </div>
                          );
                          
                        default:
                          return null;
                      }
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 