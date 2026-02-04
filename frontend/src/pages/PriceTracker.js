import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, ArrowRight, Calendar, Link2, Percent, Search, Sparkles, Tag } from 'lucide-react';

const PriceTracker = () => {
  const [productUrl, setProductUrl] = useState('');
  const [site, setSite] = useState('amazon');
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [pricePayload, setPricePayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSources, setSearchSources] = useState(null);

  const priceData = useMemo(() => {
    if (!pricePayload) return [];
    const history = pricePayload.history || [];
    const forecast = pricePayload.forecast || [];
    const combined = [...history, ...forecast];
    return combined.map((point) => ({
      date: point.date,
      price: history.find((entry) => entry.date === point.date)?.price ?? null,
      forecast: forecast.find((entry) => entry.date === point.date)?.price ?? null,
    }));
  }, [pricePayload]);

  const insights = useMemo(() => {
    if (!pricePayload?.history?.length) return null;
    const history = pricePayload.history;
    const forecast = pricePayload.forecast || [];
    const currentPrice = pricePayload.current_price;
    const lowestPrice = Math.min(...history.map((point) => point.price));
    const nextDrop = forecast.reduce((acc, point) => {
      if (!acc || point.price < acc.price) return point;
      return acc;
    }, null);

    return {
      currentPrice,
      lowestPrice,
      nextDropDate: nextDrop?.date,
      nextDropPrice: nextDrop?.price,
      confidence: forecast.length > 1 ? 'Model-based' : 'Baseline',
    };
  }, [pricePayload]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!productUrl) return;
    setLoading(true);
    setError('');
    const cleanedUrl = productUrl.trim();
    setSubmittedUrl(cleanedUrl);
    try {
      const response = await axios.get('http://localhost:8000/price-track', {
        params: { url: cleanedUrl },
      });
      setPricePayload(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to fetch live pricing. Please try again.');
      setPricePayload(null);
    }
    setLoading(false);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchQuery) return;
    setSearchLoading(true);
    setSearchError('');
    try {
      const response = await axios.get('http://localhost:8000/product-search', {
        params: { query: searchQuery.trim() },
      });
      setSearchResults(response.data.results || []);
      setSearchSources(response.data.sources || null);
    } catch (err) {
      setSearchError(err?.response?.data?.detail || 'Unable to search right now. Please try again.');
      setSearchResults([]);
      setSearchSources(null);
    }
    setSearchLoading(false);
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

        <form onSubmit={handleSearch} className="bg-theme-secondary border border-theme rounded-3xl p-6 shadow-xl mb-10">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 flex items-center gap-3 bg-glass border border-theme rounded-2xl px-4">
              <Search size={18} className="text-theme-secondary" />
              <input
                type="text"
                placeholder="Search product name (e.g. Redmi Note 15 Pro)"
                className="w-full bg-transparent border-none focus:outline-none text-theme-primary py-3"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="flex items-center justify-center gap-2 bg-theme-primary text-theme-primary border border-theme rounded-2xl px-6 py-3 hover:brightness-110 transition-all"
            >
              {searchLoading ? 'Searching...' : 'Find Deals'} <ArrowRight size={18} />
            </button>
          </div>
          {searchSources && (
            <p className="text-xs text-theme-secondary mt-3">
              Sources enabled: {searchSources.keepa_enabled ? 'Keepa' : 'Keepa (missing key)'} ·{' '}
              {searchSources.serpapi_enabled ? 'SerpAPI' : 'SerpAPI (missing key)'}
            </p>
          )}
        </form>

        {searchError && (
          <div className="mb-8 text-red-400 bg-red-400/10 py-2 px-4 rounded-lg inline-block border border-red-400/20">
            {searchError}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="bg-theme-secondary border border-theme rounded-3xl p-6 shadow-xl mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-theme-primary">Cheapest Deals</h2>
              <span className="text-sm text-theme-secondary">Ranked by price</span>
            </div>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={`${result.url}-${index}`} className="flex flex-col md:flex-row md:items-center gap-3 bg-glass border border-theme rounded-2xl p-4">
                  <div className="flex-1">
                    <p className="text-xs text-theme-secondary">{result.store} · {result.source}</p>
                    <p className="text-sm font-semibold text-theme-primary truncate" title={result.title}>
                      {result.title}
                    </p>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-theme-primary hover:underline"
                    >
                      View product
                    </a>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-theme-secondary">Rank #{index + 1}</p>
                    <p className="text-lg font-bold text-theme-primary">₹{result.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-theme-primary text-theme-primary border border-theme rounded-2xl px-6 py-3 hover:brightness-110 transition-all"
            >
              {loading ? 'Fetching...' : 'Analyze'} <ArrowRight size={18} />
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 text-red-400 bg-red-400/10 py-2 px-4 rounded-lg inline-block border border-red-400/20">
            {error}
          </div>
        )}

        {submittedUrl && insights && pricePayload && (
          <div className="space-y-10">
            <div className="bg-theme-secondary border border-theme rounded-3xl p-6 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-theme-primary">
                  <span
                    className="block max-w-lg truncate"
                    title={pricePayload.product?.title}
                  >
                    {pricePayload.product?.title}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-theme-secondary">
                  <span>Live pricing from {pricePayload.product?.site?.toUpperCase()}</span>
                  <span>·</span>
                  <a
                    href={pricePayload.product?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline block max-w-xs truncate"
                  >
                    {pricePayload.product?.url}
                  </a>
                </div>
              </div>
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
                      <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(value) => `₹${value}`} />
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
                    value={
                      insights.nextDropDate
                        ? `${insights.nextDropDate} · ₹${insights.nextDropPrice.toLocaleString('en-IN')}`
                        : 'Forecast unavailable'
                    }
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
                <span className="text-sm text-theme-secondary">Live sale pages</span>
              </div>
              {pricePayload.sales?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricePayload.sales.map((sale) => (
                    <a
                      key={sale.name}
                      href={sale.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-glass border border-theme rounded-2xl p-4 hover:border-[var(--accent-primary)] transition-all"
                    >
                      <p className="text-sm text-theme-secondary">{sale.source}</p>
                      <h3 className="text-lg font-semibold text-theme-primary mb-1">{sale.name}</h3>
                      <p className="text-theme-secondary text-sm">{sale.date}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-theme-secondary text-sm">No upcoming sales detected for this site yet.</p>
              )}
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
