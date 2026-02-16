import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageLoaderProps {
  children: React.ReactNode;
}

const PageLoader: React.FC<PageLoaderProps> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  // Use ref to store the previous path without causing re-renders or dependency issues
  const prevLocationPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash;
    // Read the previous path from the ref
    const prevPath = prevLocationPathRef.current;

    // Update the ref with the current path for the next render AFTER the check
    prevLocationPathRef.current = currentPath;

    // Trigger loading if the path actually changed and it's not the initial load
    if (prevPath !== '' && prevPath !== currentPath) {
      setIsLoading(true);

      // Use a slightly longer duration now that the visibility issue is likely fixed
      const timeoutDuration = 700 + Math.random() * 400; // 700-1100ms

      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, timeoutDuration);

      return () => {
        clearTimeout(timeoutId);
      };
    }
    // No else needed, state remains unchanged if path didn't change

    // Depend only on location changes
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark/80 backdrop-blur-md">
          <div className="flex flex-col items-center">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-solid border-primary border-t-transparent rounded-full animate-spin" />
            {/* Staggered Text */}
            <div className="mt-5 flex text-2xl font-bold overflow-hidden animate-pulse">
              <span className="text-primary">Scand</span>
              <span className="text-accent">ellari</span>
            </div>
          </div>
        </div>
      )}

      {children}
    </>
  );
};

export default PageLoader;
