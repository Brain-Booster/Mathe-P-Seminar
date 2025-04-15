import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

const DEFAULT_COLORS = {
  color1: '#FFD700', // Yellow
  color2: '#90EE90', // Green
  color3: '#ADD8E6', // Blue
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customColors, setCustomColors] = useState(DEFAULT_COLORS);

  useEffect(() => {
    // Check if user preference is stored
    const storedTheme = localStorage.getItem('theme');
<<<<<<< HEAD
=======
    const storedColors = localStorage.getItem('customColors');
    
>>>>>>> 8e1e51c (yes)
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
<<<<<<< HEAD
      // Set light theme as default if no preference is stored
      document.documentElement.setAttribute('data-theme', 'light');
=======
      document.documentElement.setAttribute('data-theme', 'light');
    }

    if (storedColors) {
      setCustomColors(JSON.parse(storedColors));
      updateCustomColorsInDOM(JSON.parse(storedColors));
    } else {
      updateCustomColorsInDOM(DEFAULT_COLORS);
>>>>>>> 8e1e51c (yes)
    }
  }, []);

  const updateCustomColorsInDOM = (colors) => {
    document.documentElement.style.setProperty('--accent-yellow', colors.color1);
    document.documentElement.style.setProperty('--accent-green', colors.color2);
    document.documentElement.style.setProperty('--accent-blue', colors.color3);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
<<<<<<< HEAD
=======
  };

  const updateCustomColors = (newColors) => {
    setCustomColors(newColors);
    localStorage.setItem('customColors', JSON.stringify(newColors));
    updateCustomColorsInDOM(newColors);
  };

  const resetCustomColors = () => {
    setCustomColors(DEFAULT_COLORS);
    localStorage.setItem('customColors', JSON.stringify(DEFAULT_COLORS));
    updateCustomColorsInDOM(DEFAULT_COLORS);
>>>>>>> 8e1e51c (yes)
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme,
        toggleTheme,
        isSettingsOpen,
        toggleSettings,
        closeSettings,
        customColors,
        updateCustomColors,
        resetCustomColors
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 