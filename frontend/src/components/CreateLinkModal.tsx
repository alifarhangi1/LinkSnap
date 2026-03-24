import { useState } from 'react';
import { linksApi } from '../services/api';
import { ShortLink } from '../types';
import { X, Link2, Zap } from 'lucide-react';

interface Props {
  onClose: () => void;
  onCreated: (link: ShortLink) => void;
}

export default function CreateLinkModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ original_url: '', title: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await linksApi.create(form);
      onCreated(data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr.response?.data;
      if (data) {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs || 'Failed to create link.');
      } else {
        setError('Failed to create link.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <Link2 size={20} className="text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">New Short Link</h2>
              <p className="text-white/40 text-sm">Paste any long URL to shorten it</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="label">Destination URL *</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://your-very-long-url.com/..."
              value={form.original_url}
              onChange={(e) => setForm({ ...form, original_url: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Title <span className="text-white/30">(optional)</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="My awesome link"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={255}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
              ) : (
                <><Zap size={16} />Shorten URL</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
