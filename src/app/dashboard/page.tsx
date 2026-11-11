'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import {
  LogOut, User, Store, ChevronRight, X, Check, RefreshCw,
  Flame, Dumbbell, Wheat, Droplets, IndianRupee, Clock,
  Save, AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Dish {
  id: string;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  type: string;
  diet: string[];
  category: string;
  description: string;
}

interface DayPlan {
  breakfast: Dish;
  lunch: Dish;
  dinner: Dish;
}

interface MealPlan {
  Monday: DayPlan;
  Tuesday: DayPlan;
  Wednesday: DayPlan;
  Thursday: DayPlan;
  Friday: DayPlan;
  Saturday: DayPlan;
  Sunday: DayPlan;
}

interface Profile {
  sex: string;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goal: string;
  weeklyPace: number;
  diet: string;
  regionalPref: string;
  allergies: string;
  dailyBudget: number;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mealPlan: string;
}

interface MealLog {
  mealId: string;
  eaten: boolean;
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

const MEAL_LABELS: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅', color: '#FF5E5B', bg: 'bg-[#FF5E5B]/10' },
  lunch: { label: 'Lunch', emoji: '☀️', color: '#635BFF', bg: 'bg-[#635BFF]/10' },
  dinner: { label: 'Dinner', emoji: '🌙', color: '#00D4B6', bg: 'bg-[#00D4B6]/10' },
};

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
  { value: 'recomposition', label: 'Body Recomposition' },
  { value: 'maintenance', label: 'Maintenance' },
];
const DIET_OPTIONS = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'non_veg', label: 'Non-Veg' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'jain', label: 'Jain' },
];
const REGIONAL_OPTIONS = [
  { value: 'south_indian', label: 'South Indian' },
  { value: 'north_indian', label: 'North Indian' },
  { value: 'pan_indian', label: 'Pan-Indian' },
  { value: 'continental', label: 'Continental' },
];

// ─── Animated Ring ────────────────────────────────────────────────────────────
function ProgressRing({
  pct, label, value, unit, color, size = 80,
}: {
  pct: number; label: string; value: number; unit: string; color: string; size?: number;
}) {
  const r = size / 2 - 7;
  const circumference = 2 * Math.PI * r;
  const springPct = useSpring(0, { stiffness: 300, damping: 25 });
  const [animOffset, setAnimOffset] = useState(circumference);

  useEffect(() => {
    springPct.set(Math.min(pct, 1));
  }, [pct, springPct]);

  useEffect(() => {
    return springPct.on('change', v => {
      setAnimOffset(circumference * (1 - v));
    });
  }, [springPct, circumference]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={animOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-[#0A2540]">{Math.round(value)}</span>
          <span className="text-[9px] text-gray-400">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-gray-500">{label}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

// ─── Swap Modal ───────────────────────────────────────────────────────────────
function SwapModal({
  dish, diet, onSwap, onClose,
}: {
  dish: Dish; diet: string; onSwap: (d: Dish) => void; onClose: () => void;
}) {
  const [alternatives, setAlternatives] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/knowledge?type=${dish.type}&diet=${diet}&excludeId=${dish.id}`)
      .then(r => r.json())
      .then(d => { setAlternatives(d.dishes?.slice(0, 3) || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dish, diet]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0A2540]">Swap Dish</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Replacing: <span className="font-semibold text-[#0A2540]">{dish.name}</span></p>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : alternatives.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No alternatives found for your diet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {alternatives.map(alt => (
              <motion.button
                key={alt.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSwap(alt)}
                className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 hover:border-[#635BFF]/40 text-left transition-colors"
              >
                <span className="text-2xl">{alt.image}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#0A2540] truncate">{alt.name}</div>
                  <div className="text-xs text-gray-500">
                    {alt.calories} kcal · P{alt.protein}g · C{alt.carbs}g · F{alt.fat}g
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#635BFF] flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Meal Card ─────────────────────────────────────────────────────────────────
function MealCard({
  dish, mealType, isEaten, date, onToggleEaten, onSwap,
}: {
  dish: Dish; mealType: string; isEaten: boolean; date: string;
  onToggleEaten: () => void; onSwap: () => void;
}) {
  const meta = MEAL_LABELS[mealType];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(99,91,255,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`bg-white rounded-2xl shadow-sm border-2 transition-colors p-4 ${
        isEaten ? 'border-[#00D4B6]/40 bg-[#00D4B6]/5' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{dish.image}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg}`} style={{ color: meta.color }}>
              {meta.emoji} {meta.label}
            </span>
            {isEaten && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D4B6]/15 text-[#00D4B6]">
                ✓ Eaten
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm text-[#0A2540] leading-tight">{dish.name}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            <MacroChip icon={<Flame className="w-3 h-3" />} value={dish.calories} unit="kcal" color="#FF5E5B" />
            <MacroChip icon={<Dumbbell className="w-3 h-3" />} value={dish.protein} unit="g P" color="#635BFF" />
            <MacroChip icon={<Wheat className="w-3 h-3" />} value={dish.carbs} unit="g C" color="#00D4B6" />
            <MacroChip icon={<Droplets className="w-3 h-3" />} value={dish.fat} unit="g F" color="#F59E0B" />
            <MacroChip icon={<IndianRupee className="w-3 h-3" />} value={dish.price} unit="" color="#6B7280" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggleEaten}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isEaten
              ? 'bg-[#00D4B6] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-[#00D4B6]/20'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          {isEaten ? 'Marked Eaten' : 'Mark as Eaten'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSwap}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#635BFF]/10 text-[#635BFF] text-xs font-bold hover:bg-[#635BFF]/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Swap
        </motion.button>
      </div>
    </motion.div>
  );
}

function MacroChip({ icon, value, unit, color }: { icon: React.ReactNode; value: number; unit: string; color: string }) {
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color }}>
      {icon}{value}{unit}
    </span>
  );
}

// ─── Profile Drawer ───────────────────────────────────────────────────────────
function ProfileDrawer({
  profile, onClose, onSaved,
}: {
  profile: Profile; onClose: () => void; onSaved: (p: Profile) => void;
}) {
  const [form, setForm] = useState({ ...profile, allergies: tryParseAllergies(profile.allergies) });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function tryParseAllergies(a: string) {
    try { return (JSON.parse(a) as string[]).join(', '); } catch { return a; }
  }

  const setField = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        sex: form.sex, age: Number(form.age), heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg), activityLevel: form.activityLevel,
        goal: form.goal, weeklyPace: form.weeklyPace, diet: form.diet,
        regionalPref: form.regionalPref,
        allergies: String(form.allergies).split(',').map((s: string) => s.trim()).filter(Boolean),
        dailyBudget: Number(form.dailyBudget),
      };
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        onSaved(data.profile);
        onClose();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save.');
      }
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-[#0A2540] text-lg">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          <DrawerField label="Biological Sex">
            <div className="flex gap-2">
              {['male', 'female'].map(s => (
                <button key={s} onClick={() => setField('sex', s)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold capitalize transition-colors ${
                    form.sex === s ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]' : 'border-gray-200 text-gray-600'
                  }`}
                >{s === 'male' ? '♂️ Male' : '♀️ Female'}</button>
              ))}
            </div>
          </DrawerField>
          <DrawerField label="Age">
            <input type="number" value={form.age} onChange={e => setField('age', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-sm" />
          </DrawerField>
          <DrawerField label="Height (cm)">
            <input type="number" value={form.heightCm} onChange={e => setField('heightCm', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-sm" />
          </DrawerField>
          <DrawerField label="Weight (kg)">
            <input type="number" value={form.weightKg} onChange={e => setField('weightKg', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-sm" />
          </DrawerField>
          <DrawerField label="Activity Level">
            <select value={form.activityLevel} onChange={e => setField('activityLevel', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-sm bg-white">
              {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </DrawerField>
          <DrawerField label="Goal">
            <select value={form.goal} onChange={e => setField('goal', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-sm bg-white">
              {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </DrawerField>
          <DrawerField label="Diet Type">
            <select value={form.diet} onChange={e => setField('diet', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-sm bg-white">
              {DIET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </DrawerField>
          <DrawerField label="Regional Preference">
            <select value={form.regionalPref} onChange={e => setField('regionalPref', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-sm bg-white">
              {REGIONAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </DrawerField>
          <DrawerField label="Daily Budget (₹)">
            <div>
              <input type="range" min={150} max={1500} step={50} value={form.dailyBudget}
                onChange={e => setField('dailyBudget', parseInt(e.target.value))}
                className="w-full accent-[#635BFF]" />
              <div className="text-sm font-semibold text-[#635BFF] mt-1">₹{form.dailyBudget}/day</div>
            </div>
          </DrawerField>
          <DrawerField label="Allergies">
            <input type="text" value={form.allergies as string}
              onChange={e => setField('allergies', e.target.value)}
              placeholder="e.g. peanuts, gluten"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-sm" />
          </DrawerField>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 text-[#FF5E5B]" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#635BFF] text-white font-bold disabled:opacity-60"
          >
            {saving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save & Recalculate'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DrawerField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('Monday');
  const [eatenMeals, setEatenMeals] = useState<Set<string>>(new Set());
  const [logLoading, setLogLoading] = useState(false);

  const [swapState, setSwapState] = useState<{ mealType: string; dish: Dish } | null>(null);
  const [localMealPlan, setLocalMealPlan] = useState<MealPlan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // ─ Redirect if not authed ─
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // ─ Fetch Profile ─
  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const res = await fetch('/api/profile');
      if (res.status === 404) { router.push('/onboarding'); return; }
      if (!res.ok) { setProfileError('Failed to load profile.'); return; }
      const data = await res.json();
      setProfile(data.profile);
      try {
        const plan = JSON.parse(data.profile.mealPlan) as MealPlan;
        setMealPlan(plan);
        setLocalMealPlan(plan);
      } catch { setProfileError('Could not parse meal plan.'); }
    } catch { setProfileError('Network error loading profile.'); }
    finally { setProfileLoading(false); }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ─ Fetch Today's Meal Logs ─
  useEffect(() => {
    if (!profile) return;
    setLogLoading(true);
    fetch(`/api/meals/log?date=${today}`)
      .then(r => r.json())
      .then(data => {
        const eaten = new Set<string>(
          (data.logs || []).filter((l: MealLog) => l.eaten).map((l: MealLog) => l.mealId)
        );
        setEatenMeals(eaten);
      })
      .catch(() => {})
      .finally(() => setLogLoading(false));
  }, [profile, today]);

  // ─ Toggle Eaten ─
  const handleToggleEaten = async (mealId: string) => {
    const newEaten = !eatenMeals.has(mealId);
    setEatenMeals(prev => {
      const next = new Set(prev);
      newEaten ? next.add(mealId) : next.delete(mealId);
      return next;
    });
    try {
      await fetch('/api/meals/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, mealId, eaten: newEaten }),
      });
    } catch {
      // Revert on failure
      setEatenMeals(prev => {
        const next = new Set(prev);
        newEaten ? next.delete(mealId) : next.add(mealId);
        return next;
      });
    }
  };

  // ─ Swap Dish ─
  const handleSwap = (mealType: string, newDish: Dish) => {
    if (!localMealPlan) return;
    setLocalMealPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [mealType]: newDish,
        },
      };
    });
    setSwapState(null);
  };

  // ─ Profile saved ─
  const handleProfileSaved = (newProfile: Profile) => {
    setProfile(newProfile);
    try {
      const plan = JSON.parse(newProfile.mealPlan) as MealPlan;
      setMealPlan(plan);
      setLocalMealPlan(plan);
    } catch {}
  };

  // ─ Compute progress for today ─
  const todayMeals = localMealPlan?.[selectedDay];
  const computeConsumed = useCallback(() => {
    if (!todayMeals || !localMealPlan) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
    // Only count meals from "today" (current selectedDay)
    const todayData = localMealPlan[selectedDay];
    if (!todayData) return { cal: 0, protein: 0, carbs: 0, fat: 0 };

    let cal = 0, protein = 0, carbs = 0, fat = 0;
    for (const mt of MEAL_TYPES) {
      const dish = todayData[mt] as Dish;
      const mealId = `${selectedDay}-${mt}`;
      if (eatenMeals.has(mealId)) {
        cal += dish.calories;
        protein += dish.protein;
        carbs += dish.carbs;
        fat += dish.fat;
      }
    }
    return { cal, protein, carbs, fat };
  }, [todayMeals, localMealPlan, selectedDay, eatenMeals]);

  const consumed = computeConsumed();

  // ─ Determine today's day tab ─
  const todayDayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Nav skeleton */}
        <div className="bg-[#0A2540] h-16 px-4 flex items-center gap-3">
          <Skeleton className="h-6 w-28 bg-white/20" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-24 bg-white/20" />
          <Skeleton className="h-8 w-8 bg-white/20" />
        </div>
        <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4 mt-4">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="flex-1 h-24" />)}
          </div>
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#FF5E5B] mx-auto mb-3" />
          <p className="text-[#0A2540] font-semibold">{profileError}</p>
          <button onClick={fetchProfile}
            className="mt-4 px-6 py-2 rounded-xl bg-[#635BFF] text-white font-semibold text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const targets = { cal: profile?.dailyCalories || 2000, protein: profile?.proteinG || 150, carbs: profile?.carbsG || 250, fat: profile?.fatG || 65 };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Nav ── */}
      <div className="sticky top-0 z-30 bg-[#0A2540] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <span className="text-lg font-black text-white">Macro<span className="text-[#00D4B6]">Mint</span></span>
          <div className="flex-1" />
          {user && (
            <span className="text-sm text-white/70 font-medium hidden sm:block">
              Welcome back, <span className="text-white font-bold">{user.name}</span>! 👋
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/store')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#635BFF]/20 text-[#635BFF] text-xs font-bold border border-[#635BFF]/30 hover:bg-[#635BFF]/30 transition-colors"
          >
            <Store className="w-3.5 h-3.5" /> Store
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <User className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-[#FF5E5B]/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Mobile greeting */}
        <div className="sm:hidden">
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h1 className="text-xl font-black text-[#0A2540]">{user?.name} 👋</h1>
        </div>

        {/* ── Progress Rings ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#0A2540]">Today's Progress</h2>
            <span className="text-xs text-gray-400">{selectedDay === todayDayName ? 'Today' : selectedDay}</span>
          </div>
          <div className="flex justify-around">
            <ProgressRing label="Calories" value={consumed.cal} pct={consumed.cal / targets.cal} unit="kcal" color="#FF5E5B" />
            <ProgressRing label="Protein" value={consumed.protein} pct={consumed.protein / targets.protein} unit="g" color="#635BFF" />
            <ProgressRing label="Carbs" value={consumed.carbs} pct={consumed.carbs / targets.carbs} unit="g" color="#00D4B6" />
            <ProgressRing label="Fat" value={consumed.fat} pct={consumed.fat / targets.fat} unit="g" color="#F59E0B" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
            <span>Target: <strong className="text-[#0A2540]">{targets.cal} kcal</strong></span>
            <span>P: <strong>{targets.protein}g</strong></span>
            <span>C: <strong>{targets.carbs}g</strong></span>
            <span>F: <strong>{targets.fat}g</strong></span>
          </div>
        </motion.div>

        {/* ── Day Tabs ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DAYS.map((day, i) => (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDay === day
                  ? 'bg-[#635BFF] text-white shadow-md shadow-[#635BFF]/30'
                  : day === todayDayName
                    ? 'bg-[#635BFF]/15 text-[#635BFF] border border-[#635BFF]/30'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-[#635BFF]/40'
              }`}
            >
              {DAY_ABBR[i]}
              {day === todayDayName && <span className="ml-1">•</span>}
            </motion.button>
          ))}
        </div>

        {/* ── Meal Cards ── */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col gap-3"
            >
              {localMealPlan && MEAL_TYPES.map((mealType, idx) => {
                const dish = localMealPlan[selectedDay]?.[mealType] as Dish;
                if (!dish) return null;
                const mealId = `${selectedDay}-${mealType}`;
                return (
                  <motion.div
                    key={mealType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: idx * 0.08 }}
                  >
                    <MealCard
                      dish={dish}
                      mealType={mealType}
                      isEaten={eatenMeals.has(mealId)}
                      date={today}
                      onToggleEaten={() => handleToggleEaten(mealId)}
                      onSwap={() => setSwapState({ mealType, dish })}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Summary strip ── */}
        {localMealPlan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A2540] rounded-2xl p-4 flex justify-around"
          >
            {(() => {
              const dayData = localMealPlan[selectedDay];
              const totalCal = MEAL_TYPES.reduce((s, mt) => s + ((dayData[mt] as Dish)?.calories || 0), 0);
              const totalP = MEAL_TYPES.reduce((s, mt) => s + ((dayData[mt] as Dish)?.protein || 0), 0);
              const totalC = MEAL_TYPES.reduce((s, mt) => s + ((dayData[mt] as Dish)?.carbs || 0), 0);
              const totalF = MEAL_TYPES.reduce((s, mt) => s + ((dayData[mt] as Dish)?.fat || 0), 0);
              const totalBudget = MEAL_TYPES.reduce((s, mt) => s + ((dayData[mt] as Dish)?.price || 0), 0);
              return (
                <>
                  <SumChip label="Total" value={totalCal} unit="kcal" color="#FF5E5B" />
                  <SumChip label="Protein" value={totalP} unit="g" color="#635BFF" />
                  <SumChip label="Carbs" value={totalC} unit="g" color="#00D4B6" />
                  <SumChip label="Fat" value={totalF} unit="g" color="#F59E0B" />
                  <SumChip label="Cost" value={totalBudget} unit="₹" color="#E5E7EB" prefix="₹" />
                </>
              );
            })()}
          </motion.div>
        )}
      </div>

      {/* ── Swap Modal ── */}
      <AnimatePresence>
        {swapState && profile && (
          <SwapModal
            dish={swapState.dish}
            diet={profile.diet}
            onSwap={d => handleSwap(swapState.mealType, d)}
            onClose={() => setSwapState(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Profile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && profile && (
          <ProfileDrawer
            profile={profile}
            onClose={() => setDrawerOpen(false)}
            onSaved={handleProfileSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SumChip({ label, value, unit, color, prefix }: { label: string; value: number; unit: string; color: string; prefix?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>
        {prefix}{Math.round(value)}{prefix ? '' : unit}
      </span>
    </div>
  );
}
