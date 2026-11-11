# 🌿 MacroMint — Adaptive Indian Nutrition OS

> **Full-Stack Next.js 15 + Standalone Web App for Indian Household Nutrition**

MacroMint calculates your precise Mifflin-St Jeor BMR & TDEE, dynamically adapting to authentic Indian diets (Ragi Dosa, Paneer Tikka Bowls, Dal Tadka, Grilled Millet) with 10-minute fresh ingredient kits and 20-minute cloud kitchen delivery.

---

## 🚀 Key Features

* **Stripe-Inspired Aesthetics**: Deep Obsidian (`#0A2540`), Royal Indigo (`#635BFF`), Fresh Teal (`#00D4B6`), and Warm Coral (`#FF5E5B`) with smooth physics transitions and mesh gradients.
* **Mifflin-St Jeor Scientific Engine**: Real-time BMR & TDEE calculation with activity level multipliers and goal calorie offsets.
* **Blank Interactive Onboarding Wizard**: Step-by-step guidance starting from clean slate with live macro calculation.
* **Adaptive 7-Day Dashboard**:
  * Starts at 0% logged.
  * Real-time SVG circular progress rings for Calories and Protein.
  * Macro-equalizer dish swap engine (3 alternatives per slot).
  * Slide-over body metrics recalculation drawer.
* **Quick-Commerce Store & Checkout**:
  * Ready-to-Eat (20 mins) & Fresh Ingredient Kits (9 mins).
  * Real working cart with quantity management.
  * Multi-method payment: Dynamic UPI QR Code with bank verification simulation, 16-digit auto-formatting card input, and Cash on Delivery.
  * Live Order Tracking with real-time countdown timer & printable Tax Invoice/Macro Receipt.
* **Grounded AI Nutrition Chatbot + Live Training Studio**:
  * Floating assistant grounded in Indian dietetics.
  * "+ Train" modal to teach the AI new regional recipes on the fly.

---

## 💻 Tech Stack

* **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
* **Database & Auth**: SQLite, Prisma ORM, JWT (httpOnly cookie session), bcryptjs
* **Standalone Version**: Single-file complete web application in `index.html` (zero build step, instant browser preview)

---

## 🛠️ Quick Start

### Option A: Instant Browser Preview (Zero Setup)
Simply open `index.html` in your web browser:
```bash
# Windows
start index.html

# Mac / Linux
open index.html # or xdg-open index.html
```

### Option B: Run Full-Stack Next.js Server
```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma generate
npx prisma db push

# 3. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.
