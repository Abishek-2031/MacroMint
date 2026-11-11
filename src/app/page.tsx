'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronRight, Zap, Target, TrendingUp, ShoppingBag,
  Star, Clock, Leaf, Flame, Dumbbell, ArrowRight,
  CheckCircle, Users, Award
} from 'lucide-react';

const DISHES = [
  { emoji: '🫓', name: 'Ragi Dosa', cal: 285, protein: 9, price: 95, tag: 'High Fiber', tagColor: '#00D4B6' },
  { emoji: '🥗', name: 'Paneer Tikka Bowl', cal: 420, protein: 28, price: 185, tag: 'High Protein', tagColor: '#635BFF' },
  { emoji: '🫕', name: 'Dal Tadka & Phulka', cal: 380, protein: 16, price: 120, tag: 'Budget Friendly', tagColor: '#F59E0B' },
  { emoji: '🍗', name: 'Grilled Chicken Millet', cal: 495, protein: 42, price: 220, tag: 'Fat Loss', tagColor: '#FF5E5B' },
];

const STEPS = [
  {
    icon: Target,
    title: 'Input Your Vitals',
    desc: 'Enter your age, weight, height, and biological sex to seed the Mifflin-St Jeor BMR calculation.',
    color: '#635BFF',
  },
  {
    icon: Zap,
    title: 'AI Maps Your TDEE',
    desc: 'Your activity level and goal (Fat Loss, Muscle Gain, or Recomposition) adjust your daily calorie target automatically.',
    color: '#00D4B6',
  },
  {
    icon: Flame,
    title: 'Adaptive Indian Menu',
    desc: 'The system selects authentic regional dishes matching your macro targets, budget, and dietary preference daily.',
    color: '#FF5E5B',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '₹499',
    period: '/month',
    features: ['7-Day Adaptive Meal Plan', 'BMR/TDEE Calculator', 'AI Nutrition Chatbot', '5 Dish Swaps/week'],
    color: '#635BFF',
    popular: false,
  },
  {
    name: 'Prime',
    price: '₹999',
    period: '/month',
    features: ['Everything in Starter', 'Unlimited Dish Swaps', 'Priority 20-min Delivery', 'Live Progress Analytics', 'Weekly AI Check-ins'],
    color: '#FF5E5B',
    popular: true,
  },
  {
    name: 'Pay-Per-Meal',
    price: '₹85',
    period: '/meal',
    features: ['No subscription', 'Fresh Ingredient Kits', 'Ready-to-Eat Meals', 'Single order minimum'],
    color: '#00D4B6',
    popular: false,
  },
];

function MacroRing({ value, max, color, label, size = 60 }: { value: number; max: number; color: string; label: string; size?: number }) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs font-medium text-slate-600">{label}</span>
    </div>
  );
}

function BMRPreviewWidget() {
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState(1.55);

  const bmr = sex === 'male'
    ? 10 * weight + 6.25 * 170 - 5 * age + 5
    : 10 * weight + 6.25 * 160 - 5 * age - 161;
  const tdee = Math.round(bmr * activity);
  const deficit = Math.round(tdee - 500);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,91,255,0.1)' }}>
          <Zap className="w-4 h-4" style={{ color: '#635BFF' }} />
        </div>
        <h3 className="font-bold text-slate-800">Live BMR Preview</h3>
      </div>

      {/* Sex Toggle */}
      <div className="flex gap-2 mb-4">
        {['male', 'female'].map(s => (
          <button
            key={s}
            onClick={() => setSex(s as 'male' | 'female')}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: sex === s ? '#635BFF' : '#F1F5F9',
              color: sex === s ? 'white' : '#64748B',
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Weight Slider */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Weight</span><span className="font-semibold text-slate-700">{weight} kg</span>
        </div>
        <input type="range" min={40} max={150} value={weight} onChange={e => setWeight(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#635BFF' }} />
      </div>

      {/* Age Slider */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Age</span><span className="font-semibold text-slate-700">{age} yrs</span>
        </div>
        <input type="range" min={16} max={80} value={age} onChange={e => setAge(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#635BFF' }} />
      </div>

      {/* Activity */}
      <select
        value={activity}
        onChange={e => setActivity(Number(e.target.value))}
        className="w-full text-sm p-2.5 border border-slate-200 rounded-xl mb-5 text-slate-700"
      >
        <option value={1.2}>Sedentary (desk job)</option>
        <option value={1.375}>Lightly Active</option>
        <option value={1.55}>Moderately Active</option>
        <option value={1.725}>Very Active</option>
      </select>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <motion.div
          key={bmr}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl" style={{ background: 'rgba(99,91,255,0.08)' }}
        >
          <p className="text-xl font-black" style={{ color: '#635BFF' }}>{Math.round(bmr)}</p>
          <p className="text-xs text-slate-500 mt-0.5">BMR kcal</p>
        </motion.div>
        <motion.div
          key={tdee}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl" style={{ background: 'rgba(0,212,182,0.08)' }}
        >
          <p className="text-xl font-black" style={{ color: '#00D4B6' }}>{tdee}</p>
          <p className="text-xs text-slate-500 mt-0.5">TDEE kcal</p>
        </motion.div>
        <motion.div
          key={deficit}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl" style={{ background: 'rgba(255,94,91,0.08)' }}
        >
          <p className="text-xl font-black" style={{ color: '#FF5E5B' }}>{deficit}</p>
          <p className="text-xs text-slate-500 mt-0.5">Fat Loss</p>
        </motion.div>
      </div>

      <Link href="/register">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)' }}
        >
          Get My Full Plan <ArrowRight className="w-4 h-4" />
        </motion.button>
      </Link>
    </motion.div>
  );
}

export default function LandingPage() {
  const [activeCarousel, setActiveCarousel] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="bg-[#F8FAFC] overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-white/10" style={{ background: 'rgba(10,37,64,0.95)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)' }}>M</div>
            <span className="font-black text-white text-lg">MacroMint</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['How It Works', 'Menu', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-slate-300 hover:text-white text-sm transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors">Sign In</button>
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-sm font-semibold text-white px-4 py-2 rounded-xl"
                style={{ background: '#635BFF' }}
              >
                Start Free
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="mesh-gradient min-h-screen flex items-center justify-center pt-16 relative">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-indigo-500/30"
              style={{ background: 'rgba(99,91,255,0.15)' }}
            >
              <Leaf className="w-4 h-4" style={{ color: '#00D4B6' }} />
              <span className="text-sm font-medium" style={{ color: '#00D4B6' }}>India's First Adaptive Nutrition OS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-white leading-tight mb-6"
            >
              Eat Smart.<br />
              <span style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Burn Precise.
              </span><br />
              Stay Indian.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg"
            >
              AI-powered nutrition plans built on Mifflin-St Jeor science and 500+ authentic Indian recipes.
              Real macros. Real food. Delivered in 20 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(99,91,255,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base"
                  style={{ background: 'linear-gradient(135deg, #635BFF, #4B44CC)' }}
                >
                  Start Free Assessment <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 mt-10"
            >
              <div className="flex -space-x-2">
                {['🧑', '👩', '🧔', '👨', '👩‍💼'].map((avatar, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-900 flex items-center justify-center text-sm bg-indigo-700">{avatar}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[0,1,2,3,4].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5"><span className="text-white font-semibold">12,480+</span> Indians transformed</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Floating cards */}
          <div className="relative hidden lg:block">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🫓</div>
                <div>
                  <p className="font-bold text-white">Ragi Dosa Set</p>
                  <p className="text-xs text-slate-300">South Indian • Breakfast</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-black text-white">₹95</p>
                  <p className="text-xs text-green-400">9 mins</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MacroRing value={285} max={600} color="#635BFF" label="285 kcal" size={56} />
                <MacroRing value={9} max={50} color="#00D4B6" label="9g protein" size={56} />
                <MacroRing value={48} max={80} color="#FF5E5B" label="48g carbs" size={56} />
                <MacroRing value={7} max={30} color="#F59E0B" label="7g fat" size={56} />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-6 -right-4 bg-white rounded-2xl p-4 shadow-2xl min-w-48"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#00D4B6' }} />
                <p className="text-xs font-semibold text-slate-700">Today's Progress</p>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: 'Calories', pct: 68, color: '#635BFF' },
                  { label: 'Protein', pct: 82, color: '#00D4B6' },
                  { label: 'Carbs', pct: 55, color: '#FF5E5B' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                      <span>{m.label}</span><span>{m.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.pct}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute -bottom-8 -left-4 bg-white rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,182,0.1)' }}>
                  <Clock className="w-4 h-4" style={{ color: '#00D4B6' }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">20 min delivery</p>
                  <p className="text-xs text-slate-500">Ready-to-eat meals</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-xs">Scroll to explore</span>
          <div className="w-5 h-8 border-2 border-slate-400/50 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-2 bg-slate-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ─── SECTION 2: HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#635BFF' }}>The Science</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2 mb-4">How Adaptive Nutrition Works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              We use the gold-standard Mifflin-St Jeor formula — accurate to ±5% for most adults — mapped to India's richest culinary traditions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(10,37,64,0.08)' }}
                className="p-8 rounded-3xl border border-slate-100 bg-white cursor-default transition-all"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${step.color}15` }}>
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-4 text-white" style={{ background: step.color }}>
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Formula showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1a1060 100%)' }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#00D4B6' }}>Mifflin-St Jeor BMR Formula</p>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-xs text-slate-400 mb-1">Male</p>
                    <p className="font-mono text-white text-sm">(10 × kg) + (6.25 × cm) − (5 × age) + 5</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-xs text-slate-400 mb-1">Female</p>
                    <p className="font-mono text-white text-sm">(10 × kg) + (6.25 × cm) − (5 × age) − 161</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Fat Loss', adj: '−500 kcal', color: '#FF5E5B' },
                  { label: 'Muscle Gain', adj: '+300 kcal', color: '#00D4B6' },
                  { label: 'Recomposition', adj: '±0 kcal', color: '#635BFF' },
                  { label: 'Maintenance', adj: '±0 kcal', color: '#F59E0B' },
                ].map(g => (
                  <div key={g.label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-lg font-black" style={{ color: g.color }}>{g.adj}</div>
                    <div className="text-xs text-slate-400 mt-1">{g.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 3: MENU CAROUSEL ─── */}
      <section id="menu" className="py-24" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#FF5E5B' }}>Fresh Kitchen</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2 mb-4">10-Minute Fresh Kit & Cloud Kitchen</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Every dish is macro-verified, portion-controlled, and available as Ready-to-Eat (20 min) or Fresh Ingredient Kit (9 min).
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="grid md:grid-cols-4 gap-6">
            {DISHES.map((dish, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 24px 48px rgba(10,37,64,0.12)' }}
                onClick={() => setActiveCarousel(i)}
                className="bg-white rounded-3xl p-6 border border-slate-100 cursor-pointer transition-all"
                style={activeCarousel === i ? { borderColor: dish.tagColor, boxShadow: `0 0 0 2px ${dish.tagColor}20` } : {}}
              >
                <div className="text-5xl mb-4">{dish.emoji}</div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-3 text-white" style={{ background: dish.tagColor }}>
                  {dish.tag}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{dish.name}</h3>
                <div className="flex gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-0.5"><Flame className="w-3 h-3" /> {dish.cal} kcal</span>
                  <span className="flex items-center gap-0.5"><Dumbbell className="w-3 h-3" /> {dish.protein}g P</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-lg" style={{ color: '#0A2540' }}>₹{dish.price}</span>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> 20 min</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/store">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)' }}
              >
                <ShoppingBag className="w-5 h-5" />
                Order from Full Menu
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 4: BMR PREVIEW WIDGET ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#F59E0B' }}>Try Before You Sign Up</span>
              <h2 className="text-4xl font-black text-slate-900 mt-2 mb-4">
                See Your Calories Change in Real Time
              </h2>
              <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                Drag the sliders to see how your Basal Metabolic Rate and Total Daily Energy Expenditure change — no sign-up required. This is the same calculation engine powering your personal plan.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Award, text: 'Mifflin-St Jeor — most accurate formula for healthy adults', color: '#635BFF' },
                  { icon: Users, text: 'Calibrated against 12,480+ Indian body profiles', color: '#00D4B6' },
                  { icon: TrendingUp, text: 'Updates every day based on your logged meals & progress', color: '#FF5E5B' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <p className="text-slate-600 text-sm mt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <BMRPreviewWidget />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: PRICING ─── */}
      <section id="pricing" className="py-24" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#635BFF' }}>Simple Pricing</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2 mb-4">Plans That Fit Your Lifestyle</h2>
            <p className="text-lg text-slate-500">Monthly subscriptions or flexible pay-per-meal. No lock-ins.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`p-8 rounded-3xl border-2 relative ${plan.popular ? 'border-transparent' : 'border-slate-200 bg-white'}`}
                style={plan.popular ? { background: 'linear-gradient(135deg, #0A2540, #1a1060)', borderColor: 'transparent' } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#FF5E5B' }}>
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className={`font-semibold mb-1 ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                      <span className={`text-sm ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-2xl font-bold text-sm text-white"
                    style={{ background: plan.color }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#0A2540' }} className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)' }}>M</div>
                <span className="font-black text-white text-lg">MacroMint</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">India's most scientifically rigorous nutrition platform for authentic Indian households.</p>
            </div>
            {[
              { title: 'Product', links: ['How It Works', 'Menu', 'Pricing', 'Dashboard'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookie Policy', 'FSSAI'] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-semibold text-white mb-4 text-sm">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2026 MacroMint. FSSAI License 10026011002900. Made with ❤️ in India.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-slate-500 text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

