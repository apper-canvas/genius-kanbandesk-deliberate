import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

// Icons
const KanbanIcon = getIcon('layout-dashboard');
const InfoIcon = getIcon('info');

const Home = () => {
  const [loading, setLoading] = useState(true);

  // Simulate loading for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-surface-600 dark:text-surface-400 text-lg">Loading KanbanDesk...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-surface-800 shadow-sm border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <KanbanIcon className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-primary">KanbanDesk</h1>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <motion.a
                href="https://github.com/your-repo/kanbandesk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200 text-sm inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <InfoIcon className="h-4 w-4 mr-1" />
                <span>About</span>
              </motion.a>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <MainFeature />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-surface-500 dark:text-surface-400">
            <p>KanbanDesk &copy; {new Date().getFullYear()} - A Ticket Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;