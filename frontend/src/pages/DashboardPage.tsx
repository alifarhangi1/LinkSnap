import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { linksApi, dashboardApi } from '../services/api';
import { ShortLink, DashboardStats } from '../types';
import Navbar from '../components/Navbar';
import CreateLinkModal from '../components/CreateLinkModal';
import LinkCard from '../components/LinkCard';
import { Plus, BarChart3, Link2, Activity, Zap, Search, X } from 'lucide-react';

type Filter = 'all' | 'active' | 'inactive';

export default function DashboardPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const fetchData = useCallback(async () => {
    try {
      const [linksRes, statsRes] = await Promise.all([
        linksApi.list(),
        dashboardApi.stats(),
      ]);
      setLinks(linksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        link.title.toLowerCase().includes(q) ||
        link.original_url.toLowerCase().includes(q) ||
        link.short_code.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && link.is_active && !link.is_expired) ||
        (filter === 'inactive' && (!link.is_active || link.is_expired));
      return matchesSearch && matchesFilter;
    });
  }, [links, search, filter]);

  const handleLinkCreated = (newLink: ShortLink) => {
    setLinks((prev) => [newLink, ...prev]);
    setStats((prev) => prev
      ? { ...prev, total_links: prev.total_links + 1, active_links: prev.active_links + 1 }
      : prev);
    setShowCreate(false);
  };

  const handleLinkDeleted = (id: number) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    fetchData();
  };

  const handleLinkToggled = (updated: ShortLink) => {
    setLinks((prev) => prev.map((l) => l.id === updated.id ? updated : l));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
            </h1>
            <p className="text-white/40 mt-1">Manage your links and track their performance.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={18} />
            New Link
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Total Links', value: stats.total_links, icon: <Link2 size={20} />, color: 'text-brand-400' },
              { label: 'Total Clicks', value: stats.total_clicks, icon: <BarChart3 size={20} />, color: 'text-purple-400' },
              { label: 'Active Links', value: stats.active_links, icon: <Activity size={20} />, color: 'text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="glass-card p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{s.value.toLocaleString()}</div>
                  <div className="text-white/40 text-sm">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Links section */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <h2 className="text-xl font-semibold text-white">Your Links</h2>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-8 pr-8 py-2 text-sm w-full"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex items-center bg-white/5 rounded-lg p-1 shrink-0">
                {(['all', 'active', 'inactive'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                      filter === f
                        ? 'bg-brand-500 text-white'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap size={28} className="text-brand-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No links yet</h3>
              <p className="text-white/40 mb-6">Create your first short link to get started.</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} />
                Create your first link
              </button>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Search size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No links match your search.</p>
              <button onClick={() => { setSearch(''); setFilter('all'); }} className="text-brand-400 text-sm mt-2 hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDeleted={handleLinkDeleted}
                  onToggled={handleLinkToggled}
                />
              ))}
              {filteredLinks.length < links.length && (
                <p className="text-center text-white/25 text-sm pt-2">
                  Showing {filteredLinks.length} of {links.length} links
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateLinkModal
          onClose={() => setShowCreate(false)}
          onCreated={handleLinkCreated}
        />
      )}
    </div>
  );
}
