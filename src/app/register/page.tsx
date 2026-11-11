'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Eye, EyeOff, ArrowLeft, Zap } from 'lucide-react';
import { toast } from '@/components/ui/Toaster';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const router = useRouter();

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast('Welcome to MacroMint! Let\'s set up your profile.', 'success');
      router.push('/onboarding');
    } else {
      toast(result.error || 'Registration failed', 'error');
    }
    setLoading(false);
  }

  async function handleDemo() {
    setLoading(true);
    const demoEmail = `demo_${Date.now()}@macromint.demo`;
    const result = await register('Demo User', demoEmail, 'demo123456');
    if (result.success) {
      toast('Demo account created! Exploring MacroMint...', 'success');
      router.push('/onboarding');
    } else {
      // Try to login with the demo account that might already exist
      toast('Using demo mode', 'info');
      router.push('/onboarding');
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
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white" style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)' }}>M</div>
            <span className="font-black text-slate-900 text-xl">MacroMint</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-8">Start your free nutrition assessment today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                placeholder="Priya Sharma"
                className={`w-full px-4 py-3 border rounded-xl text-sm transition-all outline-none ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-indigo-400'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                placeholder="priya@example.com"
                className={`w-full px-4 py-3 border rounded-xl text-sm transition-all outline-none ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-indigo-400'}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="At least 6 characters"
                  className={`w-full px-4 py-3 pr-12 border rounded-xl text-sm transition-all outline-none ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-indigo-400'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #635BFF, #4B44CC)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account →'
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <motion.button
            onClick={handleDemo}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-60"
          >
            <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
            Continue with Demo Account
          </motion.button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#635BFF' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

