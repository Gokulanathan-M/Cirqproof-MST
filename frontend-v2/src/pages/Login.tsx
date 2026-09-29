import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { Button, Card, Input } from '../components/ui';

const pipeline = ['Evidence', 'Reconciliation', 'Verification', 'MST Attestation', 'Settlement'];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@cirqproof.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({ email, password });
      if (res.ok) {
        login(res.data.token, res.data.user);
        navigate('/');
        return;
      }

      throw new Error('Invalid credentials');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050708] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.10),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(103,232,249,0.08),transparent_20%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute left-[-10%] top-[15%] h-80 w-80 rounded-full border border-emerald-400/10 bg-emerald-400/5 blur-3xl" />
      <div className="absolute bottom-[10%] right-[-5%] h-72 w-72 rounded-full border border-cyan-400/10 bg-cyan-400/5 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 xl:px-12">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col justify-center"
        >
          <div className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            MST TESTNET / VERIFICATION INFRASTRUCTURE
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.15)]">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/60">
                <span className="absolute h-4 w-4 rounded-full border border-emerald-300/70" />
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black tracking-tight text-white sm:text-4xl">CirqProof</div>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl"
          >
            Verify the claim.
            <span className="mt-2 block text-slate-300">Prove the evidence.</span>
            <span className="mt-2 block text-slate-300">Settle with confidence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45 }}
            className="mt-5 max-w-lg text-base leading-7 text-slate-300"
          >
            Evidence-backed MRV and verifiable settlement infrastructure for recycling operations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.45 }}
            className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.4)]"
          >
            <div className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              Verification pipeline
            </div>

            <div className="space-y-3">
              {pipeline.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-500/5 text-[10px] font-bold tracking-[0.2em] text-emerald-300">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-sm font-medium text-slate-200">{step}</div>
                  {index < pipeline.length - 1 ? (
                    <div className="text-slate-600">↓</div>
                  ) : null}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="flex items-center justify-center"
        >
          <Card className="relative w-full max-w-xl overflow-hidden border border-white/10 bg-[#0b0f13]/90 p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />

            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10">
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300/50">
                    <span className="absolute h-4 w-4 rounded-full border border-emerald-300/60" />
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">CirqProof</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Operator Login</div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <div className="mb-1 flex items-center gap-2 font-semibold text-red-300">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-300/50 text-xs">!</span>
                  Authentication failed
                </div>
                <p className="text-red-100/80">{error}</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                placeholder="operator@cirqproof.io"
                error={Boolean(error)}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<LockKeyhole className="h-4 w-4" />}
                placeholder="Enter your password"
                error={Boolean(error)}
              />

              <Button type="submit" loading={loading} className="mt-2 w-full" size="lg">
                {loading ? 'Signing in...' : 'Access Platform'}
              </Button>
            </form>

            <div className="mt-7 border-t border-white/10 pt-5">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Quick demo presets
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@cirqproof.com');
                    setPassword('admin123');
                  }}
                  className="rounded-xl border border-white/10 bg-slate-950/80 p-3 text-left transition-colors hover:border-emerald-400/40 hover:bg-slate-900"
                >
                  <div className="text-sm font-semibold text-emerald-300">Admin</div>
                  <div className="mt-1 text-[10px] text-slate-400">admin@cirqproof.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('producer@cirqproof.io');
                    setPassword('admin123');
                  }}
                  className="rounded-xl border border-white/10 bg-slate-950/80 p-3 text-left transition-colors hover:border-emerald-400/40 hover:bg-slate-900"
                >
                  <div className="text-sm font-semibold text-cyan-300">Producer</div>
                  <div className="mt-1 text-[10px] text-slate-400">producer@cirqproof.io</div>
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Secure operator access
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
