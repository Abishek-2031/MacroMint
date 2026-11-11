'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';

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
  tags: string[];
  description: string;
}

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  currentDish: Dish | null;
  alternatives: Dish[];
  onSwap: (dish: Dish) => void;
}

export function SwapModal({ open, onClose, currentDish, alternatives, onSwap }: SwapModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900">Swap Dish</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pick a macro-equivalent alternative</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Current dish */}
              {currentDish && (
                <div className="mx-6 mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Current Dish</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currentDish.image}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{currentDish.name}</p>
                      <p className="text-xs text-slate-500">{currentDish.calories} kcal · {currentDish.protein}g P · ₹{currentDish.price}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alternatives */}
              <div className="p-6 space-y-3">
                <p className="text-xs font-semibold text-slate-500 mb-3">Choose Alternative</p>
                {alternatives.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No alternatives available</p>
                ) : (
                  alternatives.map((dish, i) => (
                    <motion.button
                      key={dish.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { onSwap(dish); onClose(); }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left"
                    >
                      <span className="text-2xl">{dish.image}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{dish.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{dish.calories} kcal · {dish.protein}g P · {dish.carbs}g C · ₹{dish.price}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {dish.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: '#635BFF' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <RefreshCw className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

