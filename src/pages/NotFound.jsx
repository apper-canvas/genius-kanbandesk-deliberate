import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const ArrowLeftIcon = getIcon('arrow-left');
const SearchXIcon = getIcon('search-x');

const NotFound = () => {
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="mx-auto w-24 h-24 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-6"
        >
          <SearchXIcon className="h-12 w-12 text-primary" />
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          404
        </motion.h1>
        
        <motion.h2 
          className="text-2xl md:text-3xl font-semibold mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Page Not Found
        </motion.h2>
        
        <motion.p 
          className="text-surface-600 dark:text-surface-400 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;