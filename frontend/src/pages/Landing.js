import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, LineChart, Palette, ChevronDown } from 'lucide-react';

const Landing = ({ currentTheme, setTheme }) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themes = [
    { id: 'midnight', name: 'Midnight', color: '#0B0F19' },
    { id: 'matte', name: 'Matte Light', color: '#F1F5F9' },
    { id: 'sunset', name: 'Sunset (Anim)', color: '#be185d' },
    { id: 'forest', name: 'Deep Forest', color: '#052e16' },
    { id: 'ocean', name: 'Ocean Depth', color: '#0c4a6e' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: '#000000' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen p-8 font-sans"
    >
      {!['sunset', 'cyberpunk'].includes(currentTheme) && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[15%] w-96 h-96 bg-[var(--accent-primary)] rounded-full blur-[128px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[5%] right-[20%] w-80 h-80 bg-[var(--accent-secondary)] rounded-full blur-[128px] opacity-20 animate-pulse delay-1000"></div>
        </div>
      )}

      <nav className="flex justify-between items-center mb-16 max-w-7xl mx-auto z-50 relative">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="w-10 h-10 shadow-lg shadow-[var(--accent-primary)]/30 rounded-xl" />
          <span className="font-bold text-xl tracking-tight text-theme-primary">Plot Pulse</span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-theme-secondary">
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-theme-primary hover:opacity-80">Explore</Link>
            <Link to="/wiki" className="hover:text-theme-primary transition-colors">Wiki Trends</Link>
            <Link to="/price-tracker" className="hover:text-theme-primary transition-colors">Price Tracker</Link>
            <Link to="/creators" className="hover:text-theme-primary transition-colors">Creators</Link>
            <Link to="/about" className="hover:text-theme-primary transition-colors">About</Link>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-secondary border border-theme hover:bg-glass transition-all text-theme-primary"
            >
              <Palette size={16} />
              <span className="capitalize hidden sm:block">{currentTheme}</span>
              <ChevronDown size={14} />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-theme-secondary border border-theme rounded-xl shadow-xl overflow-hidden z-50">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:brightness-110 flex items-center gap-2 text-theme-primary transition-colors"
                    style={{ backgroundColor: currentTheme === t.id ? 'var(--glass-bg)' : 'transparent' }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto z-10 relative text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl font-extrabold mb-6 py-2 pb-4 title-glow text-theme-primary"
        >
          Choose your intelligence feed.
        </motion.h1>
        <p className="text-lg text-theme-secondary max-w-2xl mx-auto mb-12">
          Jump into Wikipedia trend forecasting or track real-world product prices for Amazon and Flipkart.
          Pick the experience you want to explore today.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard
            title="Wiki Trends Predictor"
            description="Explore historical Wikipedia interest and forecast future momentum with AI-guided insights."
            to="/wiki"
            icon={<LineChart size={32} />}
            accent="from-[var(--accent-primary)] to-[var(--accent-secondary)]"
          />
          <FeatureCard
            title="Amazon & Flipkart Price Tracker"
            description="Paste a product link to visualize price history, predict drops, and watch upcoming sales." 
            to="/price-tracker"
            icon={<BarChart3 size={32} />}
            accent="from-amber-400 to-rose-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ title, description, to, icon, accent }) => (
  <Link to={to} className="group">
    <div className="h-full bg-theme-secondary border border-theme rounded-3xl p-8 text-left shadow-xl hover:shadow-2xl transition-all relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-glass border border-theme mb-6 text-theme-primary">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-theme-primary mb-3">{title}</h3>
        <p className="text-theme-secondary mb-6">{description}</p>
        <span className="inline-flex items-center gap-2 text-theme-primary font-medium">
          Explore now <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  </Link>
);

export default Landing;
