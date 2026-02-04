import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, Download, RefreshCcw, ArrowRight, Activity, Calendar, Palette, ChevronDown } from 'lucide-react';

const Home = ({ currentTheme, setTheme }) => {
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyRange, setHistoryRange] = useState(12);
  const [predictRange, setPredictRange] = useState(6);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const chartRef = useRef(null);

  const themes = [
    { id: 'midnight', name: 'Midnight', color: '#0B0F19' },
    { id: 'matte', name: 'Matte Light', color: '#F1F5F9' },
    { id: 'sunset', name: 'Sunset (Anim)', color: '#be185d' },
    { id: 'forest', name: 'Deep Forest', color: '#052e16' },
    { id: 'ocean', name: 'Ocean Depth', color: '#0c4a6e' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: '#000000' },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword) return;
    setLoading(true);
    setError('');
    
    // Simulate loading for better UX if using cache/fast API
    setTimeout(async () => {
      try {
        const response = await axios.get(`http://localhost:8000/predict/${keyword}`);
        setData(response.data);
      } catch (err) {
        setError('Topic not found. Try a specific Wikipedia title (e.g. "Bitcoin")');
      }
      setLoading(false);
    }, 800);
  };

  const handleDownload = useCallback(() => {
    if (chartRef.current === null) return;
    toPng(chartRef.current, { cacheBust: true, backgroundColor: 'var(--bg-primary)' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${keyword}-trend-analysis.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.log(err));
  }, [chartRef, keyword]);

  const getFilteredData = () => {
    if (!data) return [];
    const todayIndex = data.graph_data.findIndex(d => d["Predicted Trend"] !== null && d["Actual Interest"] === null);
    // Safety check if todayIndex is -1 (e.g. all history or all prediction)
    const idx = todayIndex === -1 ? data.graph_data.length - 1 : todayIndex;
    
    const start = Math.max(0, idx - (historyRange * 30));
    const end = Math.min(data.graph_data.length, idx + (predictRange * 30));
    return data.graph_data.slice(start, end);
  };

  const filteredData = getFilteredData();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen p-8 font-sans">
      
      {/* Decorative Blobs (Only visible on non-animated themes for performance) */}
      {!['sunset', 'cyberpunk'].includes(currentTheme) && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-[var(--accent-primary)] rounded-full blur-[128px] opacity-20 animate-pulse"></div>
           <div className="absolute bottom-[10%] right-[20%] w-80 h-80 bg-[var(--accent-secondary)] rounded-full blur-[128px] opacity-20 animate-pulse delay-1000"></div>
        </div>
      )}

      {/* Navigation */}
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

            {/* THEME SWITCHER */}
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

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Search Hero */}
        <div className="text-center mb-12">
            <motion.h1 
  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
  className="text-6xl font-extrabold mb-6 py-2 pb-4 title-glow text-theme-primary"
>
  Future Intelligence.
</motion.h1>
            
            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full blur opacity-40"></div>
                <div className="relative bg-theme-secondary border border-theme rounded-full p-2 flex items-center shadow-2xl">
                    <Search className="ml-4 text-theme-secondary" size={18} />
                    <input
                        type="text" placeholder="Search trends (e.g. AI, Bitcoin)..."
                        className="w-full bg-transparent border-none focus:outline-none text-theme-primary px-4 py-2 placeholder-theme-secondary"
                        value={keyword} onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button type="submit" disabled={loading} className="p-2 bg-theme-primary hover:brightness-110 border border-theme rounded-full transition-all text-theme-primary">
                        {loading ? <RefreshCcw size={18} className="animate-spin"/> : <ArrowRight size={18}/>}
                    </button>
                </div>
            </form>
            {error && <div className="text-red-400 bg-red-400/10 py-2 px-4 rounded-lg inline-block border border-red-400/20">{error}</div>}
        </div>

        {/* DATA VISUALIZATION AREA */}
        {data && (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} 
              className="bg-theme-secondary border border-theme rounded-3xl p-8 shadow-2xl backdrop-blur-sm" ref={chartRef}>
                
                {/* Header */}
                <div className="flex flex-wrap gap-4 justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-theme-primary">{data.keyword}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-sm px-2 py-0.5 rounded border font-medium ${data.stats.prediction_trend === 'Rising' ? 'bg-green-500/20 border-green-500/30 text-green-500' : 'bg-red-500/20 border-red-500/30 text-red-500'}`}>
                                Trend: {data.stats.prediction_trend}
                            </span>
                            <span className="text-sm text-theme-secondary">Source: Wikipedia API</span>
                        </div>
                    </div>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-glass hover:bg-theme-primary border border-theme rounded-lg text-sm transition-all text-theme-primary font-medium">
                        <Download size={16} /> Save PNG
                    </button>
                </div>

                {/* Main Content Grid - Fixed Layout */}
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                    
                    {/* CHART SECTION (Grows to fill space) */}
                    <div className="flex-1 h-[450px] min-h-[300px] bg-glass rounded-2xl p-4 border border-theme">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredData}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-secondary)" tickFormatter={(str) => str.substring(0, 7)} minTickGap={40} tick={{fill: 'var(--text-secondary)'}} />
                                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} tickFormatter={(num) => `${(num/1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                                <Area type="monotone" dataKey="Actual Interest" stroke="var(--accent-primary)" fill="url(#colorActual)" strokeWidth={3} />
                                <Area type="monotone" dataKey="Predicted Trend" stroke="var(--accent-secondary)" strokeDasharray="5 5" fill="url(#colorPred)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* STATS PANEL (Fixed width on desktop, full width on mobile) */}
                    <div className="lg:w-72 flex flex-col gap-4 shrink-0">
                        <StatCard title="Peak Interest" value={data.stats.peak.toLocaleString()} icon={<Activity size={18} style={{color: 'var(--accent-primary)'}}/>} />
                        <StatCard title="Daily Average" value={data.stats.average.toLocaleString()} icon={<Calendar size={18} style={{color: 'var(--accent-secondary)'}}/>} />
                        <StatCard title="Future Forecast" value={data.stats.prediction_trend} icon={<TrendingUp size={18} className={data.stats.prediction_trend === 'Rising' ? "text-green-500" : "text-red-500"}/>} highlight={true}/>
                        
                        {/* AI Insight Box */}
                        <div className="p-5 rounded-2xl border border-theme bg-glass mt-2 relative overflow-hidden flex-grow">
                          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-10"></div>
                          <h3 className="text-sm font-bold text-theme-primary mb-2 relative">AI Insight</h3>
                          <p className="text-sm text-theme-secondary leading-relaxed relative">
                            Based on historical patterns, interest in <span className="font-bold text-theme-primary">{data.keyword}</span> is expected to 
                            {data.stats.prediction_trend === 'Rising' ? ' increase ' : ' decrease '} 
                            over the next 12 months.
                          </p>
                        </div>
                    </div>
                </div>

                {/* SLIDERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-glass p-6 rounded-2xl border border-theme">
                    <SliderControl label="Past History" value={historyRange} setValue={setHistoryRange} min="3" max="48" color="var(--accent-primary)" />
                    <SliderControl label="Future Prediction" value={predictRange} setValue={setPredictRange} min="1" max="12" color="var(--accent-secondary)" />
                </div>

            </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, highlight }) => (
  <div className={`p-5 rounded-2xl border transition-transform hover:scale-[1.02] ${highlight ? 'bg-glass border-theme shadow-lg shadow-[var(--accent-secondary)]/10' : 'bg-theme-primary border-theme'}`}>
    <div className="flex items-center gap-3 text-theme-secondary mb-2">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
    </div>
    <div className="text-2xl font-bold text-theme-primary">{value}</div>
  </div>
);

const SliderControl = ({ label, value, setValue, min, max, color }) => (
  <div>
      <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-theme-secondary">{label}</label>
          <span className="text-sm font-bold" style={{color: color}}>{value} Months</span>
      </div>
      <input 
          type="range" min={min} max={max} step="1" value={value} onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 bg-theme-primary rounded-lg appearance-none cursor-pointer"
          style={{accentColor: color}}
      />
  </div>
);

export default Home;
