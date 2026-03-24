import { Link } from 'react-router-dom';
import { Zap, BarChart3, Link2, Shield, ArrowRight, Check } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Fast',
    desc: 'Shorten any URL in milliseconds with our optimized infrastructure.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Deep Analytics',
    desc: 'Track every click with detailed insights — time, location, referrer.',
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: 'Custom Short Links',
    desc: 'Manage all your links from one beautiful dashboard.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Reliable & Secure',
    desc: 'Built-in spam protection and uptime monitoring on every link.',
  },
];

const pricingFeatures = [
  'Unlimited short links',
  'Click analytics & charts',
  'Link management dashboard',
  'API access',
  'Custom titles',
  'Link activation toggle',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Gradient blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 text-brand-400 text-sm font-medium mb-8">
            <Zap size={14} />
            Smart URL Shortener & Analytics
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Shorten. Share.{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Understand.
            </span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            LinkSnap turns long, unwieldy URLs into powerful short links with built-in analytics.
            Know exactly who clicks, when, and from where.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-4 px-8 inline-flex items-center gap-2 justify-center">
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base py-4 px-8 inline-flex items-center justify-center">
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-white/30 text-sm">No credit card required</p>
        </div>

        {/* Mock dashboard preview */}
        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="glass-card p-1 shadow-2xl shadow-brand-900/50">
            <div className="bg-[#0f0f1a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="text-white/30 text-xs font-mono">linksnap.io/dashboard</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[['47', 'Total Links'], ['1.2k', 'Total Clicks'], ['38', 'Active Links']].map(([val, label]) => (
                  <div key={label} className="glass-card p-4">
                    <div className="text-2xl font-bold text-white">{val}</div>
                    <div className="text-white/40 text-sm">{label}</div>
                  </div>
                ))}
              </div>
              <div className="glass-card p-4 space-y-3">
                {[
                  { code: 'Xk9mP2q', url: 'https://verylongwebsiteurl.com/some/deep/page', clicks: 284 },
                  { code: 'nB7vW1j', url: 'https://another-long-url.io/with/params?id=123', clicks: 156 },
                  { code: 'pQ3rT8s', url: 'https://docs.example.com/getting-started', clicks: 98 },
                ].map((link) => (
                  <div key={link.code} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                        <Link2 size={14} className="text-brand-400" />
                      </div>
                      <div>
                        <div className="text-brand-400 text-sm font-mono font-medium">ls.io/{link.code}</div>
                        <div className="text-white/30 text-xs truncate max-w-[200px]">{link.url}</div>
                      </div>
                    </div>
                    <div className="text-white/60 text-sm font-medium">{link.clicks} clicks</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-white/50 text-lg">Powerful features packed into a clean, intuitive interface.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-6 hover:border-brand-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple pricing</h2>
            <p className="text-white/50">One plan. Everything included. Free forever.</p>
          </div>
          <div className="glass-card p-8 border-brand-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="text-brand-400 font-medium text-sm mb-2">Free Plan</div>
              <div className="text-5xl font-black mb-1">$0</div>
              <div className="text-white/40 text-sm mb-8">forever, no credit card</div>
              <ul className="space-y-3 mb-8">
                {pricingFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-brand-400" />
                    </div>
                    <span className="text-white/70 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-primary w-full flex items-center justify-center gap-2">
                Get started free
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            LinkSnap
          </div>
          <p className="text-white/30 text-sm">© 2026 LinkSnap. Built with React & Django.</p>
        </div>
      </footer>
    </div>
  );
}
