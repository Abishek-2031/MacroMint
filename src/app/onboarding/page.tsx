'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, User, Activity, Utensils, BarChart3,
  Check, AlertCircle, Ruler, Weight, Calendar, Flame, Dumbbell,
  TrendingDown, Scale, Sparkles, IndianRupee,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

// ─── Types ───────────────────────────────────────────────────────────────────
type Sex = 'male' | 'female' | '';
type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | '';
type Goal = 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance' | '';
type DietType = 'veg' | 'eggetarian' | 'non_veg' | 'vegan' | 'jain' | '';
type RegionalPref = 'south_indian' | 'north_indian' | 'pan_indian' | 'continental' | '';

interface FormData {
  sex: Sex;
  age: string;
  heightCm: string;
  heightFt: string;
  heightIn: string;
  heightUnit: 'cm' | 'imperial';
  weightKg: string;
  activityLevel: ActivityLevel;
  goal: Goal;
  weeklyPace: number;
  diet: DietType;
  regionalPref: RegionalPref;
  allergies: string;
  dailyBudget: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', emoji: '🛋️', multiplier: 1.2 },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1–3 days/week', emoji: '🚶', multiplier: 1.375 },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3–5 days/week', emoji: '🏃', multiplier: 1.55 },
  { value: 'very_active', label: 'Very Active', desc: '6–7 days/week', emoji: '🏋️', multiplier: 1.725 },
  { value: 'extra_active', label: 'Extra Active', desc: 'Physical job + training', emoji: '⚡', multiplier: 1.9 },
] as const;

const GOALS = [
  { value: 'fat_loss', label: 'Fat Loss', desc: 'Shed body fat', emoji: '🔥', icon: TrendingDown },
  { value: 'muscle_gain', label: 'Muscle Gain', desc: 'Build lean mass', emoji: '💪', icon: Dumbbell },
  { value: 'recomposition', label: 'Body Recomposition', desc: 'Lose fat, gain muscle', emoji: '⚖️', icon: Scale },
  { value: 'maintenance', label: 'Maintenance', desc: 'Stay at current weight', emoji: '🎯', icon: Activity },
] as const;

const DIET_TYPES = [
  { value: 'veg', label: 'Vegetarian', emoji: '🥦' },
  { value: 'eggetarian', label: 'Eggetarian', emoji: '🥚' },
  { value: 'non_veg', label: 'Non-Veg', emoji: '🍗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'jain', label: 'Jain', emoji: '🪷' },
] as const;

const REGIONAL_PREFS = [
  { value: 'south_indian', label: 'South Indian', emoji: '🫙' },
  { value: 'north_indian', label: 'North Indian', emoji: '🫓' },
  { value: 'pan_indian', label: 'Pan-Indian', emoji: '🇮🇳' },
  { value: 'continental', label: 'Continental', emoji: '🌍' },
] as const;

const GOAL_ADJUSTMENTS: Record<string, number> = {
  fat_loss: -500, muscle_gain: 300, recomposition: 0, maintenance: 0,
};
const PROTEIN_MULTIPLIERS: Record<string, number> = {
  fat_loss: 2.2, muscle_gain: 2.0, recomposition: 2.4, maintenance: 1.6,
};
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extra_active: 1.9,
};

// ─── Animated Number Counter ────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 300, damping: 25 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return spring.on('change', (v) => {
      setDisplay(v.toFixed(decimals));
    });
  }, [spring, decimals]);

  return <span>{display}</span>;
}

// ─── Macro Ring ──────────────────────────────────────────────────────────────
function MacroRing({
  label, value, unit, color, maxVal,
}: {
  label: string; value: number; unit: string; color: string; maxVal: number;
}) {
  const pct = Math.min(value / maxVal, 1);
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference * (1 - pct);
  const motionOffset = useSpring(circumference, { stiffness: 300, damping: 25 });

  useEffect(() => {
    motionOffset.set(dashOffset);
  }, [dashOffset, motionOffset]);

  const [animatedOffset, setAnimatedOffset] = useState(circumference);
  useEffect(() => {
    return motionOffset.on('change', setAnimatedOffset);
  }, [motionOffset]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#E5E7EB" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-[#0A2540]">
            <AnimatedNumber value={value} />
          </span>
          <span className="text-[10px] text-gray-500">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1"
    >
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color }}>
          <AnimatedNumber value={Math.round(value)} />
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormData>({
    sex: '', age: '', heightCm: '', heightFt: '', heightIn: '', heightUnit: 'cm',
    weightKg: '', activityLevel: '', goal: '', weeklyPace: 0.5,
    diet: '', regionalPref: '', allergies: '', dailyBudget: 500,
  });

  const setField = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  // ─ Computed nutrition values ─
  const computedStats = useCallback(() => {
    const w = parseFloat(form.weightKg) || 0;
    const h = form.heightUnit === 'cm'
      ? parseFloat(form.heightCm) || 0
      : (parseInt(form.heightFt) || 0) * 30.48 + (parseFloat(form.heightIn) || 0) * 2.54;
    const age = parseInt(form.age) || 0;

    if (!w || !h || !age || !form.sex || !form.activityLevel || !form.goal) {
      return { bmr: 0, tdee: 0, dailyCalories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const base = 10 * w + 6.25 * h - 5 * age;
    const bmr = form.sex === 'male' ? base + 5 : base - 161;
    const tdee = bmr * (ACTIVITY_MULTIPLIERS[form.activityLevel] || 1.55);
    const dailyCalories = tdee + (GOAL_ADJUSTMENTS[form.goal] || 0);
    const protein = w * (PROTEIN_MULTIPLIERS[form.goal] || 1.8);
    const fat = (dailyCalories * 0.28) / 9;
    const carbs = (dailyCalories - protein * 4 - fat * 9) / 4;

    return {
      bmr: Math.round(bmr), tdee: Math.round(tdee),
      dailyCalories: Math.round(dailyCalories),
      protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat),
    };
  }, [form]);

  const stats = computedStats();

  // ─ Validation ─
  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.sex) e.sex = 'Please select your biological sex.';
      if (!form.age || parseInt(form.age) < 10 || parseInt(form.age) > 100)
        e.age = 'Enter a valid age (10–100).';
      if (form.heightUnit === 'cm') {
        if (!form.heightCm || parseFloat(form.heightCm) < 50 || parseFloat(form.heightCm) > 300)
          e.heightCm = 'Enter a valid height (50–300 cm).';
      } else {
        if (!form.heightFt || parseInt(form.heightFt) < 1 || parseInt(form.heightFt) > 9)
          e.heightFt = 'Enter valid feet (1–9).';
      }
      if (!form.weightKg || parseFloat(form.weightKg) < 20 || parseFloat(form.weightKg) > 500)
        e.weightKg = 'Enter a valid weight (20–500 kg).';
    }
    if (s === 1) {
      if (!form.activityLevel) e.activityLevel = 'Please select your activity level.';
      if (!form.goal) e.goal = 'Please select your goal.';
    }
    if (s === 2) {
      if (!form.diet) e.diet = 'Please select your diet type.';
      if (!form.regionalPref) e.regionalPref = 'Please select your regional preference.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handleBack = () => { setStep(s => s - 1); setErrors({}); };

  // ─ Submit ─
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const heightCm = form.heightUnit === 'cm'
        ? parseFloat(form.heightCm)
        : parseInt(form.heightFt) * 30.48 + parseFloat(form.heightIn || '0') * 2.54;

      const payload = {
        sex: form.sex,
        age: parseInt(form.age),
        heightCm: Math.round(heightCm),
        weightKg: parseFloat(form.weightKg),
        activityLevel: form.activityLevel,
        goal: form.goal,
        weeklyPace: form.weeklyPace,
        diet: form.diet,
        regionalPref: form.regionalPref,
        allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        dailyBudget: form.dailyBudget,
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await refresh();
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setErrors({ submit: data.error || 'Failed to save profile. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS = ['Basics', 'Lifestyle & Goal', 'Preferences', 'Your Plan'];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#0d2f52] to-[#1a3a66] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl font-black text-white">Macro<span className="text-[#00D4B6]">Mint</span></span>
        </div>

        {/* Step Progress Bar */}
        <div className="flex gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <motion.div
                className="h-1 rounded-full"
                initial={{ backgroundColor: '#1e4976' }}
                animate={{ backgroundColor: i <= step ? '#635BFF' : '#1e4976' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-[11px] font-medium transition-colors ${i === step ? 'text-[#635BFF]' : i < step ? 'text-[#00D4B6]' : 'text-gray-500'}`}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 pb-8 flex flex-col">
        <div className="bg-white rounded-3xl shadow-2xl flex-1 p-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: Basics ── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#0A2540]">Let's start with the basics</h2>
                  <p className="text-gray-500 text-sm mt-1">We use this to calculate your personal nutrition targets.</p>
                </div>

                {/* Sex */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                    <User className="inline w-4 h-4 mr-1" />Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['male', 'female'] as const).map(s => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setField('sex', s)}
                        className={`py-4 rounded-2xl border-2 font-semibold capitalize transition-all ${
                          form.sex === s
                            ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]'
                            : 'border-gray-200 text-gray-600 hover:border-[#635BFF]/40'
                        }`}
                      >
                        {s === 'male' ? '♂️ Male' : '♀️ Female'}
                      </motion.button>
                    ))}
                  </div>
                  {errors.sex && <ErrorMsg msg={errors.sex} />}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />Age
                  </label>
                  <input
                    type="number" placeholder="e.g. 25" value={form.age}
                    onChange={e => setField('age', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-[#0A2540] font-medium transition-colors"
                  />
                  {errors.age && <ErrorMsg msg={errors.age} />}
                </div>

                {/* Height */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-[#0A2540]">
                      <Ruler className="inline w-4 h-4 mr-1" />Height
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-gray-200">
                      {(['cm', 'imperial'] as const).map(unit => (
                        <button
                          key={unit}
                          onClick={() => setField('heightUnit', unit)}
                          className={`px-3 py-1 text-xs font-semibold transition-colors ${
                            form.heightUnit === unit ? 'bg-[#635BFF] text-white' : 'bg-white text-gray-500'
                          }`}
                        >
                          {unit === 'cm' ? 'cm' : 'ft/in'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.heightUnit === 'cm' ? (
                    <input
                      type="number" placeholder="e.g. 170" value={form.heightCm}
                      onChange={e => setField('heightCm', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-[#0A2540] font-medium transition-colors"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="number" placeholder="ft" value={form.heightFt}
                        onChange={e => setField('heightFt', e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-[#0A2540] font-medium transition-colors"
                      />
                      <input
                        type="number" placeholder="in" value={form.heightIn}
                        onChange={e => setField('heightIn', e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-[#0A2540] font-medium transition-colors"
                      />
                    </div>
                  )}
                  {(errors.heightCm || errors.heightFt) && <ErrorMsg msg={errors.heightCm || errors.heightFt || ''} />}
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                    <Weight className="inline w-4 h-4 mr-1" />Current Weight (kg)
                  </label>
                  <input
                    type="number" placeholder="e.g. 70" value={form.weightKg}
                    onChange={e => setField('weightKg', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-[#0A2540] font-medium transition-colors"
                  />
                  {errors.weightKg && <ErrorMsg msg={errors.weightKg} />}
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Lifestyle & Goal ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#0A2540]">Lifestyle & Goal</h2>
                  <p className="text-gray-500 text-sm mt-1">Tell us how active you are and what you want to achieve.</p>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-3">
                    <Activity className="inline w-4 h-4 mr-1" />Activity Level
                  </label>
                  <div className="flex flex-col gap-2">
                    {ACTIVITY_LEVELS.map(a => (
                      <motion.button
                        key={a.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setField('activityLevel', a.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          form.activityLevel === a.value
                            ? 'border-[#635BFF] bg-[#635BFF]/8 shadow-sm'
                            : 'border-gray-200 hover:border-[#635BFF]/40'
                        }`}
                      >
                        <span className="text-xl">{a.emoji}</span>
                        <div className="flex-1">
                          <div className={`font-semibold text-sm ${form.activityLevel === a.value ? 'text-[#635BFF]' : 'text-[#0A2540]'}`}>
                            {a.label}
                          </div>
                          <div className="text-xs text-gray-500">{a.desc}</div>
                        </div>
                        {form.activityLevel === a.value && (
                          <Check className="w-4 h-4 text-[#635BFF]" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                  {errors.activityLevel && <ErrorMsg msg={errors.activityLevel} />}
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-3">
                    <Sparkles className="inline w-4 h-4 mr-1" />Your Goal
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map(g => (
                      <motion.button
                        key={g.value}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setField('goal', g.value)}
                        className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all ${
                          form.goal === g.value
                            ? 'border-[#635BFF] bg-[#635BFF]/10'
                            : 'border-gray-200 hover:border-[#635BFF]/40'
                        }`}
                      >
                        <span className="text-2xl">{g.emoji}</span>
                        <span className={`text-xs font-bold text-center ${form.goal === g.value ? 'text-[#635BFF]' : 'text-[#0A2540]'}`}>
                          {g.label}
                        </span>
                        <span className="text-[10px] text-gray-400 text-center">{g.desc}</span>
                      </motion.button>
                    ))}
                  </div>
                  {errors.goal && <ErrorMsg msg={errors.goal} />}
                </div>

                {/* Weekly Pace */}
                <AnimatePresence>
                  {(form.goal === 'fat_loss' || form.goal === 'muscle_gain') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Weekly Pace:{' '}
                        <span className="text-[#635BFF]">{form.weeklyPace} kg/week</span>
                      </label>
                      <input
                        type="range" min={0.25} max={1.0} step={0.25}
                        value={form.weeklyPace}
                        onChange={e => setField('weeklyPace', parseFloat(e.target.value))}
                        className="w-full accent-[#635BFF]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>0.25 kg/wk</span><span>0.5 kg/wk</span><span>0.75 kg/wk</span><span>1.0 kg/wk</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── STEP 2: Cuisine & Dietary Preferences ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#0A2540]">Cuisine & Preferences</h2>
                  <p className="text-gray-500 text-sm mt-1">We'll personalise your meal plan to your taste.</p>
                </div>

                {/* Diet Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-3">
                    <Utensils className="inline w-4 h-4 mr-1" />Diet Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIET_TYPES.map(d => (
                      <motion.button
                        key={d.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setField('diet', d.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                          form.diet === d.value
                            ? 'border-[#635BFF] bg-[#635BFF] text-white'
                            : 'border-gray-200 text-gray-600 hover:border-[#635BFF]/40'
                        }`}
                      >
                        <span>{d.emoji}</span> {d.label}
                      </motion.button>
                    ))}
                  </div>
                  {errors.diet && <ErrorMsg msg={errors.diet} />}
                </div>

                {/* Regional Preference */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-3">Regional Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    {REGIONAL_PREFS.map(r => (
                      <motion.button
                        key={r.value}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setField('regionalPref', r.value)}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all ${
                          form.regionalPref === r.value
                            ? 'border-[#635BFF] bg-[#635BFF]/10'
                            : 'border-gray-200 hover:border-[#635BFF]/40'
                        }`}
                      >
                        <span className="text-lg">{r.emoji}</span>
                        <span className={`text-sm font-semibold ${form.regionalPref === r.value ? 'text-[#635BFF]' : 'text-[#0A2540]'}`}>
                          {r.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  {errors.regionalPref && <ErrorMsg msg={errors.regionalPref} />}
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-2">Allergies (optional)</label>
                  <input
                    type="text" placeholder="e.g. peanuts, gluten, dairy"
                    value={form.allergies}
                    onChange={e => setField('allergies', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#635BFF] focus:outline-none text-[#0A2540] transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated list of foods to avoid.</p>
                </div>

                {/* Daily Budget */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                    <IndianRupee className="inline w-4 h-4 mr-1" />Daily Food Budget:{' '}
                    <span className="text-[#635BFF]">₹{form.dailyBudget}/day</span>
                  </label>
                  <input
                    type="range" min={150} max={1500} step={50}
                    value={form.dailyBudget}
                    onChange={e => setField('dailyBudget', parseInt(e.target.value))}
                    className="w-full accent-[#635BFF]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>₹150</span><span>₹500</span><span>₹1000</span><span>₹1500</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Scientific Breakdown ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#0A2540]">Your Scientific Breakdown</h2>
                  <p className="text-gray-500 text-sm mt-1">Calculated using Mifflin-St Jeor BMR formula.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="BMR" value={stats.bmr} unit="kcal" color="#635BFF" />
                  <StatCard label="TDEE" value={stats.tdee} unit="kcal" color="#00D4B6" />
                  <StatCard label="Daily Target" value={stats.dailyCalories} unit="kcal" color="#FF5E5B" />
                  <div className="bg-gradient-to-br from-[#635BFF] to-[#00D4B6] rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs text-white/70 font-medium uppercase tracking-wide">Goal</span>
                    <span className="text-sm font-bold text-white capitalize">
                      {form.goal.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Macro Rings */}
                <div>
                  <h3 className="text-sm font-bold text-[#0A2540] mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Daily Macros
                  </h3>
                  <div className="flex justify-around">
                    <MacroRing label="Protein" value={stats.protein} unit="g" color="#635BFF" maxVal={300} />
                    <MacroRing label="Carbs" value={stats.carbs} unit="g" color="#00D4B6" maxVal={500} />
                    <MacroRing label="Fat" value={stats.fat} unit="g" color="#FF5E5B" maxVal={150} />
                  </div>
                </div>

                {/* Macro Bars */}
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Protein', value: stats.protein, max: 300, color: '#635BFF', unit: 'g' },
                    { label: 'Carbs', value: stats.carbs, max: 500, color: '#00D4B6', unit: 'g' },
                    { label: 'Fat', value: stats.fat, max: 150, color: '#FF5E5B', unit: 'g' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                        <span>{m.label}</span>
                        <span style={{ color: m.color }}>{Math.round(m.value)}{m.unit}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: m.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {errors.submit && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 text-[#FF5E5B] flex-shrink-0" />
                    <span className="text-sm text-red-600">{errors.submit}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </motion.button>
            )}
            {step < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm shadow-lg shadow-[#635BFF]/30"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#00D4B6] text-white font-bold text-sm shadow-lg disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate My 7-Day Plan
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 mt-1.5"
    >
      <AlertCircle className="w-3.5 h-3.5 text-[#FF5E5B] flex-shrink-0" />
      <span className="text-xs text-[#FF5E5B] font-medium">{msg}</span>
    </motion.div>
  );
}
