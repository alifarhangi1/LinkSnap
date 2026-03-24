import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShortLink } from '../types';
import { linksApi } from '../services/api';
import { Copy, Trash2, BarChart3, ExternalLink, ToggleLeft, ToggleRight, Check, Clock, AlertCircle } from 'lucide-react';

interface Props {
  link: ShortLink;
  onDeleted: (id: number) => void;
  onToggled: (link: ShortLink) => void;
}

export default function LinkCard({ link, onDeleted, onToggled }: Props) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this link? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await linksApi.delete(link.id);
      onDeleted(link.id);
    } catch {
      setDeleting(false);
    }
  };

  const handleToggle = async () => {
    try {
      const { data } = await linksApi.update(link.id, { is_active: !link.is_active });
      onToggled(data);
    } catch (err) {
      console.error(err);
    }
  };

  const domain = (() => {
    try { return new URL(link.original_url).hostname; }
    catch { return link.original_url; }
  })();

  const shortCode = link.short_url.split('/').pop();

  const expirationBadge = (() => {
    if (!link.expires_at) return null;
    if (link.is_expired) {
      return (
        <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
          <AlertCircle size={10} />
          Expired
        </span>
      );
    }
    const expiresDate = new Date(link.expires_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    return (
      <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
        <Clock size={10} />
        Expires {expiresDate}
      </span>
    );
  })();

  return (
    <div className={`glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-200 ${!link.is_active || link.is_expired ? 'opacity-60' : ''}`}>
      {/* Icon + URL info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
          <span className="text-brand-400 text-lg font-bold">
            {domain.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-brand-400 font-mono font-semibold text-sm">
              ls.io/{shortCode}
            </span>
            {!link.is_active && (
              <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">Inactive</span>
            )}
            {expirationBadge}
          </div>
          {link.title && (
            <div className="text-white font-medium text-sm truncate">{link.title}</div>
          )}
          <div className="text-white/30 text-xs truncate">{link.original_url}</div>
        </div>
      </div>

      {/* Clicks badge */}
      <div className="flex items-center gap-1.5 text-white/50 text-sm shrink-0">
        <BarChart3 size={14} />
        <span className="font-medium">{link.click_count.toLocaleString()}</span>
        <span className="text-white/30">clicks</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={handleCopy} title="Copy" className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white">
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
        <a href={link.original_url} target="_blank" rel="noopener noreferrer" title="Open original" className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white">
          <ExternalLink size={16} />
        </a>
        <Link to={`/links/${link.id}`} title="Analytics" className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-brand-400">
          <BarChart3 size={16} />
        </Link>
        <button onClick={handleToggle} title={link.is_active ? 'Deactivate' : 'Activate'}
          className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white">
          {link.is_active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
        </button>
        <button onClick={handleDelete} disabled={deleting} title="Delete"
          className="w-9 h-9 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors text-white/50 hover:text-red-400">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
