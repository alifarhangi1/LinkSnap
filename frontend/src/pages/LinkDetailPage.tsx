import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { linksApi } from '../services/api';
import { ShortLinkDetail } from '../types';
import Navbar from '../components/Navbar';
import { ArrowLeft, Copy, ExternalLink, BarChart3, Calendar, MousePointerClick, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [link, setLink] = useState<ShortLinkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    linksApi.get(parseInt(id))
      .then(({ data }) => setLink(data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!link) return null;

  const shortCode = link.short_url.split('/').pop();
  const chartData = link.clicks_by_day;

  // Fill in missing dates with 0
  const filledData = (() => {
    const map = new Map(chartData.map((d) => [d.date, d.count]));
    const result = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, count: map.get(key) ?? 0 });
    }
    return result;
  })();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Link info card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              {link.title && <h1 className="text-xl font-bold text-white mb-1">{link.title}</h1>}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-brand-400 font-mono font-semibold">ls.io/{shortCode}</span>
                {!link.is_active && (
                  <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">Inactive</span>
                )}
              </div>
              <p className="text-white/40 text-sm truncate">{link.original_url}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 text-sm py-2">
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-sm py-2">
                <ExternalLink size={14} />
                Open
              </a>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Clicks', value: link.click_count, icon: <MousePointerClick size={18} />, color: 'text-brand-400' },
            { label: 'Created', value: new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: <Calendar size={18} />, color: 'text-purple-400' },
            { label: 'Status', value: link.is_active ? 'Active' : 'Inactive', icon: <BarChart3 size={18} />, color: link.is_active ? 'text-emerald-400' : 'text-white/40' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Click chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Clicks over the last 30 days</h2>
          {filledData.every((d) => d.count === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/30">
              <MousePointerClick size={40} className="mb-3 opacity-30" />
              <p>No clicks recorded yet.</p>
              <p className="text-sm mt-1">Share your link to start tracking!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={filledData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}
                  cursor={{ stroke: 'rgba(99,102,241,0.3)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#colorClicks)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
