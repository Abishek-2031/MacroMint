'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';

/* ─── Types ─── */
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DeliveryAddress {
  fullName: string;
  phone: string;
  flat: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
}

interface Order {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  estimatedTime: number;
  items: string | OrderItem[];
  deliveryAddress: string | DeliveryAddress;
  createdAt: string;
}

/* ─── Delivery stages ─── */
const STAGES = [
  { key: 'placed',    label: 'Order Placed',       icon: '📋', color: '#635BFF' },
  { key: 'confirmed', label: 'Confirmed',           icon: '✅', color: '#635BFF' },
  { key: 'preparing', label: 'Preparing',           icon: '👨‍🍳', color: '#00D4B6' },
  { key: 'out',       label: 'Out for Delivery',    icon: '🛵', color: '#00D4B6' },
  { key: 'delivered', label: 'Delivered',           icon: '🎉', color: '#22C55E' },
];

function getStageIndex(orderStatus: string): number {
  switch (orderStatus) {
    case 'placed':    return 0;
    case 'confirmed': return 1;
    case 'preparing': return 2;
    case 'out':       return 3;
    case 'delivered': return 4;
    default:          return 1; // 'confirmed' from API default
  }
}

/* ─── Progress Tracker ─── */
function DeliveryProgress({ currentStageIdx }: { currentStageIdx: number }) {
  return (
    <div className="relative flex items-start justify-between px-2 py-4">
      {/* Connecting lines */}
      <div className="absolute top-9 left-10 right-10 flex" style={{ zIndex: 0 }}>
        {STAGES.slice(0, -1).map((_, i) => (
          <div key={i} className="flex-1 h-1 mx-1 rounded-full overflow-hidden bg-slate-100">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: i < currentStageIdx
                  ? 'linear-gradient(90deg, #635BFF, #00D4B6)'
                  : 'transparent',
              }}
              initial={{ width: 0 }}
              animate={{ width: i < currentStageIdx ? '100%' : '0%' }}
              transition={{ duration: 0.8, delay: i * 0.3, ease: 'easeOut' }}
            />
          </div>
        ))}
      </div>

      {/* Stage dots */}
      {STAGES.map((stage, i) => {
        const done    = i <= currentStageIdx;
        const active  = i === currentStageIdx;

        return (
          <div key={stage.key} className="flex flex-col items-center gap-2 relative z-10">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 24 }}
              className="flex items-center justify-center rounded-full text-lg"
              style={{
                width: active ? 52 : 44,
                height: active ? 52 : 44,
                background: done ? stage.color : '#E2E8F0',
                boxShadow: active ? `0 0 0 6px ${stage.color}22` : 'none',
                transition: 'all 0.4s',
              }}
            >
              {done ? stage.icon : <span style={{ opacity: 0.3 }}>{stage.icon}</span>}
            </motion.div>
            <span
              className="text-[11px] font-semibold text-center w-14 leading-tight"
              style={{ color: done ? '#0A2540' : '#94A3B8' }}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Countdown Timer ─── */
function CountdownTimer({ initialSeconds }: { initialSeconds: number }) {
  const [secs, setSecs] = useState(initialSeconds);

  useEffect(() => {
    if (secs <= 0) return;
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secs]);

  const mins = Math.floor(secs / 60);
  const ss   = secs % 60;
  const done = secs === 0;

  return (
    <div className="text-center py-6">
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">
        {done ? 'Delivered!' : 'Estimated Delivery In'}
      </p>
      <AnimatePresence mode="popLayout">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl"
          >
            🎉
          </motion.div>
        ) : (
          <motion.div
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono font-black text-6xl text-[#0A2540]"
            style={{ letterSpacing: '-0.03em' }}
          >
            {String(mins).padStart(2, '0')}
            <span className="text-[#635BFF] animate-pulse">:</span>
            {String(ss).padStart(2, '0')}
          </motion.div>
        )}
      </AnimatePresence>
      {!done && (
        <p className="text-xs text-slate-400 mt-2">
          Your food is being freshly prepared 🍽
        </p>
      )}
    </div>
  );
}

/* ─── Receipt generator ─── */
function generateReceipt(order: Order, items: OrderItem[], address: DeliveryAddress): string {
  const divider = '─'.repeat(44);
  const line = (l: string, r: string) => `${l.padEnd(28)}${r.padStart(14)}`;

  const totalCalories = items.reduce((s, i) => s + i.calories * i.quantity, 0);
  const totalProtein  = items.reduce((s, i) => s + i.protein  * i.quantity, 0);
  const totalCarbs    = items.reduce((s, i) => s + i.carbs    * i.quantity, 0);
  const totalFat      = items.reduce((s, i) => s + i.fat      * i.quantity, 0);

  return [
    '       MACROMINT — ORDER RECEIPT       ',
    divider,
    `Order ID : ${order.id}`,
    `Date     : ${new Date(order.createdAt).toLocaleString('en-IN')}`,
    `Payment  : ${order.paymentMethod.toUpperCase()} · ${order.paymentStatus.toUpperCase()}`,
    divider,
    'DELIVER TO:',
    `  ${address.fullName}`,
    `  ${address.flat}, ${address.street}`,
    address.landmark ? `  ${address.landmark}` : '',
    `  ${address.city} — ${address.pincode}`,
    `  📞 ${address.phone}`,
    divider,
    'ITEMS ORDERED:',
    ...items.map(i => line(`  ${i.name.slice(0, 24)} x${i.quantity}`, `₹${i.price * i.quantity}`)),
    divider,
    line('TOTAL', `₹${order.totalAmount}`),
    divider,
    'NUTRITION SUMMARY:',
    `  Calories : ${totalCalories} kcal`,
    `  Protein  : ${totalProtein}g`,
    `  Carbs    : ${totalCarbs}g`,
    `  Fat      : ${totalFat}g`,
    divider,
    '  Thank you for choosing MacroMint!  ',
    '  Eat smart. Live healthy. 🌿        ',
    divider,
  ].filter(Boolean).join('\n');
}

/* ─── Payment method label ─── */
function paymentLabel(method: string): string {
  switch (method) {
    case 'upi':  return '📲 UPI';
    case 'card': return '💳 Card';
    case 'cod':  return '💵 Cash on Delivery';
    default:     return method;
  }
}

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const color = status === 'delivered' ? 'bg-green-500' : status === 'confirmed' ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <span className={`${color} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
      {status}
    </span>
  );
}

/* ─── Main Page ─── */
export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? '';

  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(data => {
        if (data.order) setOrder(data.order);
        else setError(data.error ?? 'Order not found');
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  /* Parse JSON fields from API */
  const items: OrderItem[] = (() => {
    if (!order) return [];
    if (typeof order.items === 'string') {
      try { return JSON.parse(order.items); } catch { return []; }
    }
    return order.items as OrderItem[];
  })();

  const address: DeliveryAddress | null = (() => {
    if (!order) return null;
    if (typeof order.deliveryAddress === 'string') {
      try { return JSON.parse(order.deliveryAddress); } catch { return null; }
    }
    return order.deliveryAddress as DeliveryAddress;
  })();

  const stageIdx = order ? getStageIndex(order.status) : 1;

  /* Download receipt */
  const handleDownload = useCallback(() => {
    if (!order || !address) return;
    const text = generateReceipt(order, items, address);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `macromint-receipt-${order.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [order, items, address]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="text-5xl inline-block"
          >
            🍽
          </motion.div>
          <p className="text-slate-500 text-sm">Loading your order...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-6xl">😕</div>
          <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
          <p className="text-slate-500 text-sm">{error ?? 'This order does not exist or you are not authorised.'}</p>
          <button
            onClick={() => router.push('/store')}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-bold"
            style={{ background: '#635BFF' }}
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden py-10 px-4 text-white"
        style={{ background: '#0A2540' }}
      >
        {/* Background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 rounded-full bg-[#635BFF] -top-16 -left-16 blur-3xl" />
          <div className="absolute w-64 h-64 rounded-full bg-[#00D4B6] -bottom-16 -right-16 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="text-white/60 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
          >
            ← Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">Order Tracking</p>
              <h1 className="text-2xl font-black tracking-tight">
                Your food is on its way! 🛵
              </h1>
              <p className="text-white/50 text-xs mt-1 font-mono">#{order.id}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* ── Body Card ── */}
      <div className="max-w-3xl mx-auto px-4 -mt-5 pb-10 space-y-5">

        {/* Countdown + Progress */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <CountdownTimer initialSeconds={(order.estimatedTime ?? 20) * 60} />
          <div className="px-4 pb-6">
            <DeliveryProgress currentStageIdx={stageIdx} />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🧾</span> Items Ordered
          </h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#E2E8F0] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 line-clamp-1">{item.name}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-[11px] text-slate-400">{item.calories * item.quantity} kcal</span>
                    <span className="text-[11px] text-slate-400">{item.protein * item.quantity}g protein</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">₹{item.price * item.quantity}</p>
                  <p className="text-xs text-slate-400">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-1">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>₹{items.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800">
              <span>Total Paid</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📊</span> Meal Nutrition Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Calories', value: items.reduce((s, i) => s + i.calories * i.quantity, 0), unit: 'kcal', color: 'bg-amber-50 text-amber-700' },
              { label: 'Protein',  value: items.reduce((s, i) => s + i.protein  * i.quantity, 0), unit: 'g',    color: 'bg-blue-50 text-blue-700'   },
              { label: 'Carbs',    value: items.reduce((s, i) => s + i.carbs    * i.quantity, 0), unit: 'g',    color: 'bg-purple-50 text-purple-700'},
              { label: 'Fat',      value: items.reduce((s, i) => s + i.fat      * i.quantity, 0), unit: 'g',    color: 'bg-rose-50 text-rose-700'   },
            ].map(m => (
              <div key={m.label} className={`${m.color} rounded-xl p-3 text-center`}>
                <p className="text-xl font-black">{m.value}<span className="text-sm font-normal ml-0.5">{m.unit}</span></p>
                <p className="text-xs opacity-70 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address + Payment */}
        {address && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 grid sm:grid-cols-2 gap-5">
            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <span>📍</span> Delivery Address
              </h3>
              <div className="text-sm text-slate-600 space-y-0.5">
                <p className="font-semibold">{address.fullName}</p>
                <p>{address.flat}, {address.street}</p>
                {address.landmark && <p className="text-slate-400">{address.landmark}</p>}
                <p>{address.city} — {address.pincode}</p>
                <p className="text-slate-400">📞 {address.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <span>💳</span> Payment
              </h3>
              <p className="text-sm text-slate-600">{paymentLabel(order.paymentMethod)}</p>
              <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 border-[#635BFF] text-[#635BFF] hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            📄 Download Receipt
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: '#0A2540' }}
          >
            🏠 Back to Dashboard
          </motion.button>
        </div>
      </div>
    </div>
  );
}
