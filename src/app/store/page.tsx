'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/providers/CartProvider';
import knowledgeBase from '@/data/nutrition_knowledge.json';

/* ─── Types ─── */
interface Dish {
  id: string;
  name: string;
  category: string;
  type: string;
  diet: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  price: number;
  prepTime: number;
  description: string;
  ingredients: string[];
  tags: string[];
}

/* ─── Emoji map ─── */
const EMOJI_MAP: Record<string, string> = {
  'ragi-dosa': '🫓',
  'paneer-tikka-bowl': '🧆',
  'dal-tadka-phulka': '🍛',
  'grilled-chicken-millet': '🍗',
  'masala-oats-bowl': '🥣',
  'egg-bhurji-toast': '🍳',
  'chole-rice': '🥘',
  'kerala-fish-curry': '🐟',
};

const DEFAULT_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '🍱',
  dinner: '🌙',
};

/* ─── Filter tabs ─── */
type FilterTab = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'veg' | 'high-protein';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '✦ All' },
  { key: 'breakfast', label: '🌅 Breakfast' },
  { key: 'lunch', label: '🍱 Lunch' },
  { key: 'dinner', label: '🌙 Dinner' },
  { key: 'veg', label: '🥦 Veg Only' },
  { key: 'high-protein', label: '💪 High Protein' },
];

function filterDishes(dishes: Dish[], tab: FilterTab): Dish[] {
  switch (tab) {
    case 'breakfast': return dishes.filter(d => d.type === 'breakfast');
    case 'lunch':     return dishes.filter(d => d.type === 'lunch');
    case 'dinner':    return dishes.filter(d => d.type === 'dinner');
    case 'veg':       return dishes.filter(d => d.diet.includes('veg') || d.diet.includes('vegan'));
    case 'high-protein': return dishes.filter(d => d.protein >= 20);
    default:          return dishes;
  }
}

/* ─── Diet tag colours ─── */
function dietBadgeStyle(diet: string): string {
  switch (diet) {
    case 'veg':        return 'bg-green-100 text-green-700';
    case 'vegan':      return 'bg-emerald-100 text-emerald-700';
    case 'jain':       return 'bg-yellow-100 text-yellow-700';
    case 'eggetarian': return 'bg-orange-100 text-orange-700';
    case 'non_veg':    return 'bg-red-100 text-red-700';
    default:           return 'bg-slate-100 text-slate-600';
  }
}

/* ─── Macro badge ─── */
function MacroBadge({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <span className={`inline-flex flex-col items-center px-2 py-1 rounded-lg text-xs font-semibold ${color}`}>
      <span>{value}{unit}</span>
      <span className="font-normal opacity-70 text-[10px] leading-none">{label}</span>
    </span>
  );
}

/* ─── Meal Card ─── */
function MealCard({ dish }: { dish: Dish }) {
  const { addItem } = useCart();
  const [addedReady, setAddedReady] = useState(false);
  const [addedKit, setAddedKit]     = useState(false);

  const emoji = EMOJI_MAP[dish.id] ?? DEFAULT_EMOJI[dish.type] ?? '🍽️';

  const handleAdd = useCallback((type: 'ready_to_eat' | 'kit') => {
    addItem({
      id: `${dish.id}-${type}`,
      name: `${dish.name} (${type === 'kit' ? 'Fresh Kit' : 'Ready-to-Eat'})`,
      price: type === 'kit' ? dish.price + 20 : dish.price,
      calories: dish.calories,
      protein: dish.protein,
      carbs: dish.carbs,
      fat: dish.fat,
      image: emoji,
      type,
    });
    if (type === 'ready_to_eat') {
      setAddedReady(true);
      setTimeout(() => setAddedReady(false), 1500);
    } else {
      setAddedKit(true);
      setTimeout(() => setAddedKit(false), 1500);
    }
  }, [addItem, dish, emoji]);

  const isHighProtein = dish.protein >= 28;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(99,91,255,0.12)' }}
      className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Card header */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-5 flex items-center gap-4">
        {isHighProtein && (
          <span className="absolute top-3 right-3 bg-[#FF5E5B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            🔥 High Protein
          </span>
        )}
        <span className="text-5xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{dish.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{dish.category}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {dish.diet.slice(0, 2).map(d => (
              <span key={d} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dietBadgeStyle(d)}`}>
                {d.replace('_', '-')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="px-4 pt-3 flex gap-1.5 flex-wrap">
        <MacroBadge label="kcal"    value={dish.calories} unit="" color="bg-amber-50 text-amber-700"  />
        <MacroBadge label="protein" value={dish.protein}  unit="g" color="bg-blue-50 text-blue-700"   />
        <MacroBadge label="carbs"   value={dish.carbs}    unit="g" color="bg-purple-50 text-purple-700"/>
        <MacroBadge label="fat"     value={dish.fat}      unit="g" color="bg-rose-50 text-rose-700"   />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed px-4 pt-2 line-clamp-2">{dish.description}</p>

      {/* Tags */}
      <div className="px-4 pt-2 flex flex-wrap gap-1">
        {dish.tags.slice(0, 3).map(t => (
          <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
        ))}
      </div>

      {/* Price + Delivery */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-slate-800">₹{dish.price}</span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          🕐 {dish.prepTime} min delivery
        </span>
      </div>

      {/* Action buttons */}
      <div className="p-4 pt-3 flex gap-2 mt-auto">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => handleAdd('ready_to_eat')}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all"
          style={{ background: addedReady ? '#00C896' : '#635BFF' }}
        >
          {addedReady ? '✓ Added!' : '🍽 Ready-to-Eat'}
          <span className="block text-[10px] opacity-75 font-normal">20 min · ₹{dish.price}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => handleAdd('kit')}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all"
          style={{ background: addedKit ? '#00C896' : '#00D4B6' }}
        >
          {addedKit ? '✓ Added!' : '📦 Fresh Kit'}
          <span className="block text-[10px] opacity-75 font-normal">9 min · ₹{dish.price + 20}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Cart Sidebar ─── */
function CartSidebar({ onClose }: { onClose?: () => void }) {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const router = useRouter();
  const deliveryFee = total < 500 ? 30 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
        <h2 className="font-bold text-slate-800 text-lg">🛒 Cart ({itemCount})</h2>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-slate-400"
            >
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-sm">Your cart is empty</p>
              <p className="text-xs mt-1">Add meals to get started!</p>
            </motion.div>
          ) : (
            items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="bg-slate-50 rounded-xl p-3 flex items-center gap-3"
              >
                <span className="text-2xl">{item.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-slate-400">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] text-slate-600 text-sm flex items-center justify-center hover:border-[#635BFF] hover:text-[#635BFF] transition-colors"
                  >−</button>
                  <span className="text-xs font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] text-slate-600 text-sm flex items-center justify-center hover:border-[#635BFF] hover:text-[#635BFF] transition-colors"
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-300 hover:text-[#FF5E5B] transition-colors text-sm"
                >✕</button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t border-[#E2E8F0] space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>₹{total}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            {total < 500 && (
              <p className="text-[11px] text-[#635BFF] bg-indigo-50 rounded-lg px-2.5 py-1.5">
                Add ₹{500 - total} more for free delivery!
              </p>
            )}
            <div className="flex justify-between font-bold text-slate-800 text-base pt-1 border-t border-[#E2E8F0]">
              <span>Total</span><span>₹{total + deliveryFee}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/checkout')}
            className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)' }}
          >
            Proceed to Checkout →
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function StorePage() {
  const { itemCount } = useCart();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  const dishes = knowledgeBase.dishes as Dish[];
  const filtered = filterDishes(dishes, activeFilter);

  const scrollToCart = () => {
    setCartOpen(true);
    setTimeout(() => cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 font-bold text-slate-800 text-lg">
            <span className="text-2xl">🌿</span>
            <span className="bg-gradient-to-r from-[#635BFF] to-[#00D4B6] bg-clip-text text-transparent">MacroMint</span>
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">Quick Store</span>
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToCart}
              className="text-sm text-[#635BFF] font-semibold hover:underline hidden sm:inline"
            >
              View Cart
            </button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setCartOpen(v => !v)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
              style={{ background: '#635BFF' }}
            >
              🛒
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF5E5B] text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="hidden sm:inline">Cart</span>
            </motion.button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="max-w-7xl mx-auto px-4 pb-2.5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max">
            {FILTER_TABS.map(tab => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeFilter === tab.key
                    ? 'text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                style={activeFilter === tab.key ? { background: '#635BFF' } : {}}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Meal Grid ── */}
        <main className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">
              {activeFilter === 'all' ? '🍽 All Meals' : FILTER_TABS.find(t => t.key === activeFilter)?.label}
            </h1>
            <span className="text-sm text-slate-400">{filtered.length} items</span>
          </div>

          <motion.div layout className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map(dish => (
                <MealCard key={dish.id} dish={dish} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-24 text-slate-400">
                <div className="text-5xl mb-3">🔍</div>
                <p>No meals found for this filter</p>
              </div>
            )}
          </motion.div>
        </main>

        {/* ── Desktop Cart Sidebar ── */}
        <aside
          ref={cartRef}
          className="hidden lg:flex flex-col w-80 flex-shrink-0"
        >
          <div className="sticky top-28 bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden h-[calc(100vh-9rem)] flex flex-col">
            <CartSidebar />
          </div>
        </aside>
      </div>

      {/* ── Mobile Cart Bottom Sheet ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden lg:hidden"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
              <CartSidebar onClose={() => setCartOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
