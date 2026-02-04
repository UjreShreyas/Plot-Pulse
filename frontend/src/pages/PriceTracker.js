import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, ArrowRight, Calendar, Link2, Percent, Sparkles, Tag } from 'lucide-react';

const PriceTracker = () => {
  const [productUrl, setProductUrl] = useState('');
  const [site, setSite] = useState('amazon');
  const [submittedUrl, setSubmittedUrl] = useState('');

  const priceData = useMemo(() => {
    if (!submittedUrl) return [];
    const today = new Date();
    const historyPoints = 12;
    const forecastPoints = 6;
    const basePrice = site === 'amazon' ? 28999 : 26499;

    return Array.from({ length: historyPoints + forecastPoints }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - historyPoints + index, 1);
      const seasonalWave = Math.sin(index / 2) * 1200;
      const noise = (index % 3) * 150;
      const historicalPrice = Math.round(basePrice + seasonalWave + noise - (index * 80));
      const forecastPrice = Math.round(basePrice + seasonalWave - (index * 60));

      return {
        date: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        price: index < historyPoints ? historicalPrice : null,
        forecast: index >= historyPoints ? forecastPrice : null,
      };
    });
  }, [submittedUrl, site]);

  const insights = useMemo(() => {
    if (priceData.length === 0) return null;
    const history = priceData.filter((point) => point.price !== null);
    const forecast = priceData.filter((point) => point.forecast !== null);

    const currentPrice = history[history.length - 1]?.price || 0;
    const lowestPrice = Math.min(...history.map((point) => point.price));
    const nextDrop = forecast.reduce((acc, point) => {
      if (!acc || point.forecast < acc.forecast) return point;
      return acc;
    }, null);

    return {
      currentPrice,
      lowestPrice,
      nextDropDate: nextDrop?.date,
      nextDropPrice: nextDrop?.forecast,
      confidence: site === 'amazon' ? 'High' : 'Moderate',
    };
  }, [priceData, site]);

  const upcomingSales = [
    { name: 'Great Indian Festival', date: 'Oct 10 - Oct 15', tag: 'Amazon' },
    { name: 'Big Billion Days', date: 'Sep 28 - Oct 5', tag: 'Flipkart' },
    { name: 'Year-End Clearance', date: 'Dec 20 - Dec 31', tag: 'Both' },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!productUrl) return;
    setSubmittedUrl(productUrl.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-8 font-sans text-theme-primary"
    >
      <nav className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors">
          <ArrowLeft size={20} /> Back to Explore
        </Link>
        <Link to="/wiki" className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors">
          Wiki Trends <ArrowRight size={18} />
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-4 title-text title-glow">Price Intelligence Hub.</h1>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Paste a product link to preview historic pricing, forecast the next dip, and keep tabs on upcoming sales.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-theme-secondary border border-theme rounded-3xl p-6 shadow-xl mb-10">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 flex items-center gap-3 bg-glass border border-theme rounded-2xl px-4">
              <Link2 size={18} className="text-theme-secondary" />
              <input
                type="url"
                placeholder="Paste Amazon or Flipkart product link"
                className="w-full bg-transparent border-none focus:outline-none text-theme-primary py-3"
                value={productUrl}
                onChange={(event) => setProductUrl(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-glass border border-theme rounded-2xl p-2">
              <button
                type="button"
                onClick={() => setSite('amazon')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${site === 'amazon' ? 'bg-theme-primary text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}
              >
                Amazon
              </button>
              <button
                type="button"
                onClick={() => setSite('flipkart')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${site === 'flipkart' ? 'bg-theme-primary text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}
              >
                Flipkart
              </button>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-theme-primary text-theme-primary border border-theme rounded-2xl px-6 py-3 hover:brightness-110 transition-all"
            >
              Analyze <ArrowRight size={18} />
            </button>
          </div>
          <p className="text-xs text-theme-secondary mt-3">
            We use a demo dataset until live pricing APIs are connected.
          </p>
        </form>

        {submittedUrl && insights && (
          <div className="space-y-10">
            <div className="bg-theme-secondary border border-theme rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 h-[360px] bg-glass border border-theme rounded-2xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceData}>
                      <defs>
                        <linearGradient id="priceHistory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="priceForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} minTickGap={24} />
                      <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                        formatter={(value) => `₹${value}`}
                      />
                      <Area type="monotone" dataKey="price" stroke="var(--accent-primary)" fill="url(#priceHistory)" strokeWidth={3} name="Price" />
                      <Area type="monotone" dataKey="forecast" stroke="var(--accent-secondary)" fill="url(#priceForecast)" strokeDasharray="5 5" strokeWidth={3} name="Forecast" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:w-80 flex flex-col gap-4">
                  <InsightCard
                    title="Current Price"
                    value={`₹${insights.currentPrice.toLocaleString('en-IN')}`}
                    icon={<Tag size={18} style={{ color: 'var(--accent-primary)' }} />}
                  />
                  <InsightCard
                    title="90-Day Low"
                    value={`₹${insights.lowestPrice.toLocaleString('en-IN')}`}
                    icon={<Percent size={18} style={{ color: 'var(--accent-secondary)' }} />}
                  />
                  <InsightCard
                    title="Next Predicted Dip"
                    value={`${insights.nextDropDate} · ₹${insights.nextDropPrice.toLocaleString('en-IN')}`}
                    icon={<Calendar size={18} className="text-green-500" />}
                  />
                  <InsightCard
                    title="Prediction Confidence"
                    value={insights.confidence}
                    icon={<Sparkles size={18} className="text-yellow-400" />}
                    highlight
                  />
                </div>
              </div>
            </div>

            <div className="bg-theme-secondary border border-theme rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme-primary">Upcoming Sales Watchlist</h2>
                <span className="text-sm text-theme-secondary">Based on public sale calendars</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingSales.map((sale) => (
                  <div key={sale.name} className="bg-glass border border-theme rounded-2xl p-4">
                    <p className="text-sm text-theme-secondary">{sale.tag}</p>
                    <h3 className="text-lg font-semibold text-theme-primary mb-1">{sale.name}</h3>
                    <p className="text-theme-secondary text-sm">{sale.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const InsightCard = ({ title, value, icon, highlight }) => (
  <div className={`p-4 rounded-2xl border ${highlight ? 'bg-glass border-theme shadow-lg shadow-[var(--accent-secondary)]/10' : 'bg-theme-primary border-theme'}`}>
    <div className="flex items-center gap-3 text-theme-secondary mb-2">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
    </div>
    <div className="text-2xl font-bold text-theme-primary">{value}</div>
  </div>
);

export default PriceTracker;
