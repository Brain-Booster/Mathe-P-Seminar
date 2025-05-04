import { useEffect } from 'react';

// This component just pings the stats API to track visitors
// It should be added to the _app.js file
export default function VisitorTracker() {
  useEffect(() => {
    // Track visitor when component mounts
    const trackVisitor = async () => {
      try {
        await fetch('/api/stats', {
          // Add cache-busting query parameter
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    // Track immediately on mount
    trackVisitor();
    
    // Also track when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackVisitor();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
} 