# RetailOS AI — Business Operating System for Indian Retailers

> **An AI-powered Business OS** — not just billing software. Built to help retail shop owners increase profits, reduce losses, save time, and automate repetitive work.

---

## 🚀 Live Demo

**Login:** Use `9876543200` as phone number, OTP: `123456`

**Admin Panel:** `/admin` → Password: `RETAILOS@MASTER2024`

---

## ✨ Features

### 🧠 AI-Powered
- **AI Business Assistant** — Ask anything about your store (inventory, sales, customers)
- **Invoice Scanner** — Take a photo of any distributor bill → AI extracts all products automatically
- **Smart Recommendations** — AI detects pricing gaps, expiry risks, reorder needs

### 📦 Inventory Management
- Add/edit/delete products with purchase price, MRP, selling price
- Low stock alerts, expiry date tracking
- Category + brand organization
- **Scan Invoice** → bulk import from distributor bills (AI OCR)
- Profit margin calculator per product

### 💰 Billing & POS
- Fast checkout with product search
- GST calculation (0%, 5%, 12%, 18%, 28%)
- Multiple payment methods (cash, UPI, card, credit)
- Invoice generation & print/share
- Credit/Khata tracking

### 👥 Customer Management
- Customer profiles with segment (VIP, Regular, New, Inactive)
- Loyalty points, credit balance tracking
- **WhatsApp Direct Chat** — one-tap message any customer
- **WhatsApp Broadcast** — send offers to multiple customers with personalized messages
- 5 built-in offer templates (Weekend Sale, New Stock, Festive, Birthday, Credit Reminder)

### 📊 Reports & Analytics
- Daily/weekly/monthly sales charts
- Profit tracking
- Category performance

### 🏢 Supplier & Employee Management
- Supplier directory with WhatsApp integration
- Employee attendance & payroll tracking

### 👑 Super Admin Control Panel (`/admin`)
- View all registered stores with trial/paid status
- **Suspend any store** instantly (blocks their login)
- **Restore access** after payment received
- Activate paid plans (1/3/6/12 months)
- Send WhatsApp payment reminders
- Monthly Recurring Revenue (MRR) dashboard

### 🔐 License System
- 14-day free trial for each new store
- Trial days displayed in app header
- Automatic license check on login
- "Access suspended" error when license expired

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Zustand + localStorage | State management |
| Gemini 1.5 Flash API | AI features |
| Recharts | Analytics charts |
| Lucide React | Icons |

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Add your Gemini API key to .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
npm install -g vercel
vercel --prod
```

Add environment variable `NEXT_PUBLIC_GEMINI_API_KEY` in Vercel dashboard.

---

## 📱 Demo Accounts

| Phone | OTP | Store |
|-------|-----|-------|
| 9876543200 | 123456 | Shree Ram Medical & General |
| 9845001234 | 123456 | Patel Kirana Store |
| 9900112233 | 123456 | Sri Venkateshwara Medicals |

---

## 💼 Business Model

- **Free Trial:** 14 days full access
- **Basic Plan:** ₹999/month
- **Pro Plan:** ₹1,999/month

---

*Built for Indian retailers — Supports GST, UPI, Hindi business names, local categories*
