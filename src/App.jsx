import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from './utils/iconUtils';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Icons
const MoonIcon = getIcon('moon');
const SunIcon = getIcon('sun');

function App() {
  // Theme state management
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Toggle theme handler
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Theme toggle button - fixed position */}
      <button
        aria-label="Toggle dark mode"
        className="fixed right-4 bottom-4 z-50 p-3 rounded-full bg-surface-200 dark:bg-surface-800 shadow-soft hover:shadow-lg transition-all duration-300"
        onClick={toggleTheme}
      >
        <AnimatePresence mode="wait" initial={false}>
          {darkMode ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SunIcon className="h-5 w-5 text-yellow-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MoonIcon className="h-5 w-5 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Main content */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastClassName="rounded-lg shadow-lg"
      />
    </div>
  );
}

export default App;