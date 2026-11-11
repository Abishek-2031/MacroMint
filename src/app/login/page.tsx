'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/Toaster';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    const result = await login(form.email, form.password);
    if (result.success) {
      toast('Welcome back!', 'success');
      router.push(result.hasProfile ? '/dashboard' : '/onboarding');
    } else {
      toast(result.error || 'Login failed', 'error');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white" style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)' }}>M</div>
            <span className="font-black text-slate-900 text-xl">MacroMint</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your nutrition dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="priya@example.com"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #635BFF, #4B44CC)' }}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In →'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: '#635BFF' }}>Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

