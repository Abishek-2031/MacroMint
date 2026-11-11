'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/providers/CartProvider';

/* ─── Types ─── */
type PaymentMethod = 'upi' | 'card' | 'cod';
type UpiStep = 'idle' | 'connecting' | 'verifying' | 'authorized';

interface DeliveryAddress {
  fullName: string;
  phone: string;
  flat: string;
  street: string;
  landmark: string;
  city: string;
  pincode: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  flat?: string;
  street?: string;
  city?: string;
  pincode?: string;
  upiId?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardName?: string;
}

/* ─── QR Code SVG ─── */
function QRCodeSVG() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Top-left finder */}
      <rect x="10" y="10" width="60" height="60" rx="4" fill="#0A2540"/>
      <rect x="20" y="20" width="40" height="40" rx="2" fill="white"/>
      <rect x="28" y="28" width="24" height="24" rx="1" fill="#0A2540"/>
      {/* Top-right finder */}
      <rect x="130" y="10" width="60" height="60" rx="4" fill="#0A2540"/>
      <rect x="140" y="20" width="40" height="40" rx="2" fill="white"/>
      <rect x="148" y="28" width="24" height="24" rx="1" fill="#0A2540"/>
      {/* Bottom-left finder */}
      <rect x="10" y="130" width="60" height="60" rx="4" fill="#0A2540"/>
      <rect x="20" y="140" width="40" height="40" rx="2" fill="white"/>
      <rect x="28" y="148" width="24" height="24" rx="1" fill="#0A2540"/>
      {/* Data pattern rows */}
      {[85,95,105,115,125,135,145,155,165,175].map((y, i) =>
        [85,95,105,115,125,135,145,155,165,175].map((x, j) =>
          ((i + j + i * j) % 3 === 0) ? (
            <rect key={`${i}-${j}`} x={x} y={y} width="8" height="8" rx="1" fill="#0A2540"/>
          ) : null
        )
      )}
      {[10,20,30,40,50,60,70,80].map((y, i) =>
        [85,95,105,115,125].map((x, j) =>
          ((i + j) % 2 === 0) ? (
            <rect key={`m-${i}-${j}`} x={x} y={y} width="8" height="8" rx="1" fill="#0A2540"/>
          ) : null
        )
      )}
      {/* Logo centre */}
      <rect x="88" y="88" width="24" height="24" rx="4" fill="#635BFF"/>
      <text x="100" y="104" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">M</text>
    </svg>
  );
}

/* ─── Utility: format card number ─── */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
}

/* ─── Utility: format expiry ─── */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

/* ─── Progress bar animation ─── */
function UpiProgressBar({ step }: { step: UpiStep }) {
  const steps: UpiStep[] = ['connecting', 'verifying', 'authorized'];
  const idx = steps.indexOf(step);

  const stepLabels: Record<UpiStep, string> = {
    idle: '',
    connecting: '🔗 Connecting to bank...',
    verifying: '🔍 Verifying...',
    authorized: '✅ Authorized!',
  };

  if (step === 'idle') return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: step === 'authorized' ? '#00D4B6' : '#635BFF' }}
          initial={{ width: '0%' }}
          animate={{ width: step === 'authorized' ? '100%' : step === 'verifying' ? '65%' : '30%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>
      <motion.p
        key={step}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm font-semibold text-center ${step === 'authorized' ? 'text-[#00D4B6]' : 'text-[#635BFF]'}`}
      >
        {stepLabels[step]}
      </motion.p>
    </div>
  );
}

/* ─── Success Overlay ─── */
function SuccessOverlay({ orderId }: { orderId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="text-center px-8 py-10 max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
          className="text-7xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Placed!</h2>
        <p className="text-slate-500 text-sm mb-4">
          Your delicious meal is being prepared. Redirecting to tracking...
        </p>
        <div className="bg-slate-50 rounded-xl px-4 py-3 inline-block">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
          <p className="font-mono font-bold text-[#635BFF] text-sm">{orderId}</p>
        </div>
        <div className="mt-5">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-48 mx-auto">
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#635BFF' }}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'linear' }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">Redirecting in 2s...</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const deliveryFee = total < 500 ? 30 : 0;
  const grandTotal = total + deliveryFee;

  /* Redirect if cart empty */
  useEffect(() => {
    if (items.length === 0) router.replace('/store');
  }, [items.length, router]);

  /* Form state */
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: '', phone: '', flat: '', street: '', landmark: '', city: '', pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [upiStep, setUpiStep] = useState<UpiStep>('idle');
  const [loading, setLoading] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  /* ─── Validation ─── */
  function validateAddress(): boolean {
    const e: FormErrors = {};
    if (!address.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(address.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!address.flat.trim()) e.flat = 'Flat/House number is required';
    if (!address.street.trim()) e.street = 'Street is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(prev => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  }

  function validatePayment(): boolean {
    const e: FormErrors = {};
    if (paymentMethod === 'upi') {
      if (!/^[\w.\-]+@(okicici|paytm|ybl|okhdfcbank|okaxis|apl|ibl|upi|sbi|kotak|rbl|jsb)$/.test(upiId)) {
        e.upiId = 'Enter a valid UPI ID (e.g. name@okicici)';
      }
    } else if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Enter a valid 16-digit card number';
      if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = 'Enter expiry as MM/YY';
      else {
        const [mm, yy] = expiry.split('/').map(Number);
        const now = new Date();
        const expDate = new Date(2000 + yy, mm - 1);
        if (mm < 1 || mm > 12 || expDate < now) e.expiry = 'Card has expired or invalid month';
      }
      if (!/^\d{3}$/.test(cvv)) e.cvv = 'Enter a valid 3-digit CVV';
      if (!cardName.trim()) e.cardName = 'Cardholder name is required';
    }
    setErrors(prev => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  }

  /* ─── UPI Pay flow ─── */
  async function handleUpiPay() {
    if (!validateAddress() || !validatePayment()) return;
    setUpiStep('connecting');
    await delay(1000);
    setUpiStep('verifying');
    await delay(1000);
    setUpiStep('authorized');
    await delay(400);
    await submitOrder();
  }

  /* ─── Generic Place Order ─── */
  async function handlePlaceOrder() {
    if (paymentMethod === 'upi') { handleUpiPay(); return; }
    if (!validateAddress() || !validatePayment()) return;
    setLoading(true);
    await submitOrder();
    setLoading(false);
  }

  async function submitOrder() {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            id: i.id, name: i.name, price: i.price, quantity: i.quantity,
            calories: i.calories, protein: i.protein, carbs: i.carbs, fat: i.fat,
          })),
          totalAmount: grandTotal,
          paymentMethod,
          deliveryAddress: address,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setSuccessOrderId(data.order.id);
        clearCart();
        setTimeout(() => router.push(`/order/${data.order.id}`), 2000);
      } else {
        alert(data.error ?? 'Failed to place order. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
  }

  function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

  /* ─── Input helper ─── */
  function inputClass(err?: string) {
    return `w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 transition-all ${
      err
        ? 'border-red-400 bg-red-50 focus:ring-red-200'
        : 'border-[#E2E8F0] bg-white focus:ring-[#635BFF]/20 focus:border-[#635BFF]'
    }`;
  }

  if (items.length === 0) return null;

  return (
    <>
      {successOrderId && <SuccessOverlay orderId={successOrderId} />}

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Nav */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600">←</button>
          <h1 className="font-bold text-slate-800 text-lg">Checkout</h1>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

          {/* ── LEFT: Order Summary ── */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sticky top-6">
              <h2 className="font-bold text-slate-800 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400">x{item.quantity} · ₹{item.price}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E2E8F0] mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span><span>₹{total}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 text-base pt-1 border-t border-[#E2E8F0]">
                  <span>Total</span><span>₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── RIGHT: Forms ── */}
          <main className="flex-1 space-y-5">

            {/* Delivery Address */}
            <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📍</span> Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name *</label>
                  <input
                    className={inputClass(errors.fullName)}
                    placeholder="Rahul Sharma"
                    value={address.fullName}
                    onChange={e => { setAddress(a => ({ ...a, fullName: e.target.value })); setErrors(er => ({ ...er, fullName: undefined })); }}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Phone *</label>
                  <input
                    className={inputClass(errors.phone)}
                    placeholder="9876543210"
                    maxLength={10}
                    value={address.phone}
                    onChange={e => { setAddress(a => ({ ...a, phone: e.target.value.replace(/\D/g, '') })); setErrors(er => ({ ...er, phone: undefined })); }}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Flat */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Flat / House No. *</label>
                  <input
                    className={inputClass(errors.flat)}
                    placeholder="B-204, Sunrise Apt."
                    value={address.flat}
                    onChange={e => { setAddress(a => ({ ...a, flat: e.target.value })); setErrors(er => ({ ...er, flat: undefined })); }}
                  />
                  {errors.flat && <p className="text-xs text-red-500 mt-1">{errors.flat}</p>}
                </div>

                {/* Street */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Street / Area *</label>
                  <input
                    className={inputClass(errors.street)}
                    placeholder="MG Road, Indiranagar"
                    value={address.street}
                    onChange={e => { setAddress(a => ({ ...a, street: e.target.value })); setErrors(er => ({ ...er, street: undefined })); }}
                  />
                  {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                </div>

                {/* Landmark */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Landmark <span className="text-slate-300">(optional)</span></label>
                  <input
                    className={inputClass()}
                    placeholder="Near Metro Station"
                    value={address.landmark}
                    onChange={e => setAddress(a => ({ ...a, landmark: e.target.value }))}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">City *</label>
                  <input
                    className={inputClass(errors.city)}
                    placeholder="Bengaluru"
                    value={address.city}
                    onChange={e => { setAddress(a => ({ ...a, city: e.target.value })); setErrors(er => ({ ...er, city: undefined })); }}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>

                {/* Pincode */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Pincode *</label>
                  <input
                    className={inputClass(errors.pincode)}
                    placeholder="560001"
                    maxLength={6}
                    value={address.pincode}
                    onChange={e => { setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '') })); setErrors(er => ({ ...er, pincode: undefined })); }}
                  />
                  {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-lg">💳</span> Payment Method
              </h2>

              {/* Payment tabs */}
              <div className="flex gap-2 mb-5">
                {(['upi', 'card', 'cod'] as PaymentMethod[]).map(m => (
                  <button
                    key={m}
                    onClick={() => { setPaymentMethod(m); setErrors({}); setUpiStep('idle'); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      paymentMethod === m
                        ? 'border-[#635BFF] text-[#635BFF] bg-indigo-50'
                        : 'border-[#E2E8F0] text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {m === 'upi' ? '📲 UPI' : m === 'card' ? '💳 Card' : '💵 COD'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* ── UPI ── */}
                {paymentMethod === 'upi' && (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-4"
                  >
                    {/* QR Code */}
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-44 h-44 bg-white border-2 border-[#E2E8F0] rounded-2xl p-3 flex-shrink-0">
                        <QRCodeSVG />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-semibold text-slate-700 mb-1">Scan to Pay ₹{grandTotal}</p>
                        <p className="text-xs text-slate-400 mb-3">Use any UPI app — GPay, PhonePe, Paytm, BHIM</p>
                        <div className="bg-indigo-50 rounded-xl px-3 py-2 inline-block">
                          <p className="text-xs text-slate-500">Merchant UPI</p>
                          <p className="font-mono text-sm font-bold text-[#635BFF]">macromint@okicici</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">— or enter your UPI ID below —</p>
                      </div>
                    </div>

                    {/* UPI ID input */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Your UPI ID *</label>
                      <input
                        className={inputClass(errors.upiId)}
                        placeholder="yourname@okicici"
                        value={upiId}
                        onChange={e => { setUpiId(e.target.value); setErrors(er => ({ ...er, upiId: undefined })); setUpiStep('idle'); }}
                      />
                      {errors.upiId && <p className="text-xs text-red-500 mt-1">{errors.upiId}</p>}
                    </div>

                    <UpiProgressBar step={upiStep} />

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={upiStep !== 'idle' && upiStep !== 'authorized'}
                      onClick={handleUpiPay}
                      className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: upiStep === 'authorized' ? '#00D4B6' : '#635BFF' }}
                    >
                      {upiStep === 'idle'       && '🔐 Verify & Pay'}
                      {upiStep === 'connecting' && <><Spinner /> Connecting...</>}
                      {upiStep === 'verifying'  && <><Spinner /> Verifying...</>}
                      {upiStep === 'authorized' && '✅ Authorized — Place Order'}
                    </motion.button>
                  </motion.div>
                )}

                {/* ── Card ── */}
                {paymentMethod === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-3"
                  >
                    {/* Card preview */}
                    <div
                      className="rounded-2xl p-5 text-white relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #0A2540 0%, #635BFF 100%)' }}
                    >
                      <div className="absolute top-4 right-4 opacity-20 text-6xl">◎</div>
                      <p className="text-xs opacity-60 mb-3">Card Number</p>
                      <p className="font-mono text-lg tracking-widest">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between mt-4">
                        <div>
                          <p className="text-[10px] opacity-60">Cardholder</p>
                          <p className="text-sm font-semibold uppercase">{cardName || 'YOUR NAME'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-60">Expires</p>
                          <p className="text-sm font-semibold">{expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Card Number *</label>
                      <input
                        className={inputClass(errors.cardNumber)}
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setErrors(er => ({ ...er, cardNumber: undefined })); }}
                      />
                      {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Expiry */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Expiry (MM/YY) *</label>
                        <input
                          className={inputClass(errors.expiry)}
                          placeholder="12/27"
                          value={expiry}
                          onChange={e => { setExpiry(formatExpiry(e.target.value)); setErrors(er => ({ ...er, expiry: undefined })); }}
                        />
                        {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                      </div>
                      {/* CVV */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">CVV *</label>
                        <input
                          className={inputClass(errors.cvv)}
                          placeholder="•••"
                          type="password"
                          maxLength={3}
                          value={cvv}
                          onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 3)); setErrors(er => ({ ...er, cvv: undefined })); }}
                        />
                        {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                      </div>
                    </div>

                    {/* Card Name */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Cardholder Name *</label>
                      <input
                        className={inputClass(errors.cardName)}
                        placeholder="RAHUL SHARMA"
                        value={cardName}
                        onChange={e => { setCardName(e.target.value.toUpperCase()); setErrors(er => ({ ...er, cardName: undefined })); }}
                      />
                      {errors.cardName && <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ background: '#635BFF' }}
                    >
                      {loading ? <><Spinner /> Processing...</> : `🔒 Pay ₹${grandTotal}`}
                    </motion.button>
                  </motion.div>
                )}

                {/* ── COD ── */}
                {paymentMethod === 'cod' && (
                  <motion.div
                    key="cod"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-4"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                      <div className="text-5xl mb-3">💵</div>
                      <h3 className="font-bold text-slate-800 mb-1">Cash on Delivery</h3>
                      <p className="text-sm text-slate-500">
                        Pay <strong className="text-slate-700">₹{grandTotal}</strong> in cash when your order arrives.
                        Please keep exact change handy.
                      </p>
                      <div className="mt-3 text-xs text-amber-700 bg-amber-100 rounded-xl px-3 py-2 inline-block">
                        🕐 Estimated delivery: 20 minutes
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ background: '#635BFF' }}
                    >
                      {loading ? <><Spinner /> Placing Order...</> : '📦 Place Order — Pay on Delivery'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}
