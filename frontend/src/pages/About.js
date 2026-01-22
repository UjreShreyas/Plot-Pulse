import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Database, Activity, Sun, Moon } from 'lucide-react';

// Accept theme props
const About = ({ toggleTheme, isDark }) => {
  return (
    <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}
      className="min-h-screen p-8 font-sans text-theme-primary"
    >
       {/* Nav for consistency */}
      <nav className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors">
          <ArrowLeft size={20}/> Back to Home
        </Link>
         <button onClick={toggleTheme} className="p-2 rounded-full bg-theme-secondary border border-theme hover:bg-glass transition-all">
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-400" />}
        </button>
      </nav>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 title-text title-glow">About Plot Pulse.</h1>
        
        <div className="space-y-12 text-lg leading-relaxed text-theme-secondary">
          <p>
            Plot Pulse is an experimental prediction engine that visualizes global interest trends. 
            Unlike static graphs, we use <span className="font-bold text-theme-primary">Facebook's Prophet</span> model 
            to analyze seasonality and growth patterns, projecting them into the future.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <FeatureBlock icon={<Database style={{color: 'var(--accent-blue)'}}/>} title="Live Data Source" description="We utilize real-time aggregated Pageview data from the Wikipedia API to measure public interest." colorBg="var(--accent-blue)"/>
            <FeatureBlock icon={<Cpu style={{color: 'var(--accent-purple)'}}/>} title="Machine Learning" description="Our Python backend processes 4 years of daily data points to detect weekly and yearly seasonality patterns." colorBg="var(--accent-purple)"/>
            <FeatureBlock icon={<Activity className="text-green-500"/>} title="Dynamic Forecasting" description="Adjust the prediction horizon from 1 month to 1 year instantly using our client-side filtering engine." colorBg="#22c55e"/>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeatureBlock = ({icon, title, description, colorBg}) => (
  <div className="flex gap-4">
    <div className="p-3 rounded-lg h-fit" style={{backgroundColor: `${colorBg}20`}}>{icon}</div>
    <div>
      <h3 className="text-xl font-bold text-theme-primary mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  </div>
);

export default About;