import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import About from './pages/About';
import Creators from './pages/Creators';

const AnimatedRoutes = ({ currentTheme, setTheme }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home currentTheme={currentTheme} setTheme={setTheme} />} />
        <Route path="/about" element={<About currentTheme={currentTheme} />} />
        <Route path="/creators" element={<Creators currentTheme={currentTheme} />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  // Theme State: 'midnight', 'matte', 'sunset', 'forest', 'cyberpunk', 'ocean'
  const [currentTheme, setCurrentTheme] = useState('midnight');

  // Apply theme to <body> tag for global CSS variables
  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <Router>
      <AnimatedRoutes currentTheme={currentTheme} setTheme={setCurrentTheme} />
    </Router>
  );
};

export default App;