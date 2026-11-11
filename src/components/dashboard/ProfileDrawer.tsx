'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  profile: {
    sex: string;
    age: number;
    heightCm: number;
    weightKg: number;
    activityLevel: string;
    goal: string;
    diet: string;
    regionalPref: string;
    dailyBudget: number;
  };
  onSave: (data: ProfileDrawerProps['profile']) => Promise<void>;
}

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
  { value: 'extra_active', label: 'Extra Active' },
];

const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'recomposition', label: 'Recomposition' },
  { value: 'maintenance', label: 'Maintenance' },
];

const DIET_OPTIONS = [
  { value: 'veg', label: '🥦 Veg' },
  { value: 'eggetarian', label: '🥚 Eggetarian' },
  { value: 'non_veg', label: '🍗 Non-Veg' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'jain', label: '🫙 Jain' },
];

export function ProfileDrawer({ open, onClose, profile, onSave }: ProfileDrawerProps) {
  const [form, setForm] = React.useState({ ...profile });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { setForm({ ...profile }); }, [profile]);

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="font-black text-slate-900 text-lg">Edit Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Changes update your plan live</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sex */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Biological Sex</label>
                <div className="flex gap-3">
                  {['male', 'female'].map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(p => ({ ...p, sex: s }))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2"
                      style={{
                        background: form.sex === s ? '#635BFF' : 'white',
                        color: form.sex === s ? 'white' : '#64748B',
                        borderColor: form.sex === s ? '#635BFF' : '#E2E8F0',
                      }}
                    >
                      {s === 'male' ? '♂ Male' : '♀ Female'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Age (years)</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={e => setForm(p => ({ ...p, age: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400"
                    min={16} max={80}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weightKg}
                    onChange={e => setForm(p => ({ ...p, weightKg: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400"
                    min={30} max={250}
                  />
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={form.heightCm}
                  onChange={e => setForm(p => ({ ...p, heightCm: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400"
                  min={100} max={250}
                />
              </div>

              {/* Activity Level */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Activity Level</label>
                <select
                  value={form.activityLevel}
                  onChange={e => setForm(p => ({ ...p, activityLevel: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400"
                >
                  {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Goal */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_OPTIONS.map(g => (
                    <button
                      key={g.value}
                      onClick={() => setForm(p => ({ ...p, goal: g.value }))}
                      className="py-2.5 rounded-xl text-xs font-medium transition-all border-2"
                      style={{
                        background: form.goal === g.value ? '#635BFF' : 'white',
                        color: form.goal === g.value ? 'white' : '#64748B',
                        borderColor: form.goal === g.value ? '#635BFF' : '#E2E8F0',
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Diet Type</label>
                <div className="flex flex-wrap gap-2">
                  {DIET_OPTIONS.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setForm(p => ({ ...p, diet: d.value }))}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                      style={{
                        background: form.diet === d.value ? '#635BFF' : 'white',
                        color: form.diet === d.value ? 'white' : '#64748B',
                        borderColor: form.diet === d.value ? '#635BFF' : '#E2E8F0',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Budget */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Daily Budget</label>
                  <span className="text-sm font-black" style={{ color: '#635BFF' }}>₹{form.dailyBudget}/day</span>
                </div>
                <input
                  type="range"
                  min={150} max={1500} step={50}
                  value={form.dailyBudget}
                  onChange={e => setForm(p => ({ ...p, dailyBudget: Number(e.target.value) }))}
                  className="w-full h-2 rounded-full"
                  style={{ accentColor: '#635BFF' }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>₹150</span><span>₹1,500</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100">
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #635BFF, #4B44CC)' }}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Save className="w-4 h-4" /> Save & Recalculate Plan</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

