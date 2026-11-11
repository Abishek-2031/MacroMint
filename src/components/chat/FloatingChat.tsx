'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Brain, Plus, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 I\'m MacroMint AI. Ask me anything about nutrition, Indian diets, or your meal plan!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [trainForm, setTrainForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', price: '', description: '' });
  const [training, setTraining] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  }

  async function trainKnowledge() {
    if (!trainForm.name.trim()) return;
    setTraining(true);
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'dish',
          name: trainForm.name,
          data: {
            id: trainForm.name.toLowerCase().replace(/\s+/g, '-'),
            name: trainForm.name,
            calories: parseInt(trainForm.calories) || 0,
            protein: parseInt(trainForm.protein) || 0,
            carbs: parseInt(trainForm.carbs) || 0,
            fat: parseInt(trainForm.fat) || 0,
            price: parseInt(trainForm.price) || 0,
            description: trainForm.description,
            type: 'lunch',
            diet: ['veg'],
            category: 'Custom',
            image: '🍽️',
            tags: ['Custom'],
          },
        }),
      });
      setTrainForm({ name: '', calories: '', protein: '', carbs: '', fat: '', price: '', description: '' });
      setShowTraining(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ I've learned about **${trainForm.name}**! I can now answer questions about it in our conversation.`,
      }]);
    } catch {
      alert('Failed to train knowledge base');
    } finally {
      setTraining(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #635BFF, #00D4B6)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0A2540, #1a1060)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,91,255,0.3)' }}>
                  <Brain className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">MacroMint AI</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-slate-400 text-xs">Nutrition Expert • Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTraining(!showTraining)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Train AI Knowledge Base"
              >
                <Plus className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            {/* Training Panel */}
            <AnimatePresence>
              {showTraining && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-700 mb-3">🧠 Train AI Knowledge Base</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Dish name *"
                        value={trainForm.name}
                        onChange={e => setTrainForm(p => ({ ...p, name: e.target.value }))}
                        className="col-span-2 text-xs p-2 border border-indigo-200 rounded-lg bg-white focus:ring-2 ring-indigo-300"
                      />
                      <input placeholder="Calories" value={trainForm.calories} onChange={e => setTrainForm(p => ({ ...p, calories: e.target.value }))} className="text-xs p-2 border border-indigo-200 rounded-lg bg-white" />
                      <input placeholder="Protein (g)" value={trainForm.protein} onChange={e => setTrainForm(p => ({ ...p, protein: e.target.value }))} className="text-xs p-2 border border-indigo-200 rounded-lg bg-white" />
                      <input placeholder="Carbs (g)" value={trainForm.carbs} onChange={e => setTrainForm(p => ({ ...p, carbs: e.target.value }))} className="text-xs p-2 border border-indigo-200 rounded-lg bg-white" />
                      <input placeholder="Fat (g)" value={trainForm.fat} onChange={e => setTrainForm(p => ({ ...p, fat: e.target.value }))} className="text-xs p-2 border border-indigo-200 rounded-lg bg-white" />
                      <input placeholder="Price (₹)" value={trainForm.price} onChange={e => setTrainForm(p => ({ ...p, price: e.target.value }))} className="text-xs p-2 border border-indigo-200 rounded-lg bg-white" />
                      <input placeholder="Description" value={trainForm.description} onChange={e => setTrainForm(p => ({ ...p, description: e.target.value }))} className="text-xs p-2 border border-indigo-200 rounded-lg bg-white" />
                    </div>
                    <button
                      onClick={trainKnowledge}
                      disabled={training || !trainForm.name}
                      className="mt-2 w-full py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-50"
                      style={{ background: '#635BFF' }}
                    >
                      {training ? 'Training...' : '+ Add to AI Knowledge Base'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-slate-50 text-slate-700 rounded-bl-sm border border-slate-100'
                    }`}
                    style={msg.role === 'user' ? { background: '#635BFF' } : {}}
                  >
                    {msg.content.split('\n').map((line, j) => (
                      <p key={j} className={j > 0 ? 'mt-1' : ''}>
                        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 p-3 rounded-2xl rounded-bl-sm border border-slate-100">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-indigo-400"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about nutrition, meals, macros..."
                  className="flex-1 text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-2 ring-indigo-200 outline-none"
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl text-white disabled:opacity-50"
                  style={{ background: '#635BFF' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

