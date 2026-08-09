'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, RefreshCw, TrendingUp, Package, CreditCard,
  BarChart3, AlertTriangle, FileText, Star, Cpu, Clock,
  ChevronRight, MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency, getDaysUntilExpiry } from '@/lib/utils';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const localResponses: Record<string, string> = {
  sales:    "Today's sales: **₹16,700** across 47 orders.\nProfit margin is **26.9%**. Saturday is your best day — consider extra stock for weekends!",
  profit:   "Today's profit: **₹4,500** — up **14%** from yesterday!\nYour best margin items are Paracetamol (50%) and Dettol Soap (26%).",
  stock:    "**4 items need attention:**\n• Maggi Noodles — only 5 packs left\n• Aashirvaad Atta — 8 bags (order today!)\n• Amul Butter — 3 units\n• Amoxicillin — expiring in 20 days\n\nShall I create a purchase order?",
  expiry:   "**Expiring soon:**\n• Amoxicillin 250mg — 20 days (9 strips)\n• Amul Butter 500g — 15 Feb (3 units)\n\nTip: Give 10% discount on Amoxicillin to clear stock. You'll save ₹585 vs total loss.",
  customer: "**Customer insights:**\n• Rahul Sharma owes **₹2,300** (45 days overdue)\n• Suresh Kumar inactive for **72 days**\n• Ravi Gupta inactive for **108 days**\n\nSend WhatsApp reminders to recover ₹8,550 total.",
  payment:  "**Pending payments:**\n• Rahul Sharma — ₹2,300\n• Suresh Kumar — ₹1,800\n• Ravi Gupta — ₹3,200\n• Others — ₹1,250\n\n**Total: ₹8,550** — Should I send WhatsApp reminders to all?",
  forecast: "**Tomorrow's forecast:**\n• Expected sales: **₹18,200 – ₹21,500**\n• It's Sunday, typically your 2nd best day\n• Stock up: Fortune Oil, Maggi, Tata Salt tend to sell more on weekends",
  gst:      "**GST Summary (this month):**\n• Total sales: ₹4,56,000\n• GST collected: ₹48,320\n• Input GST: ₹32,100\n• **GST payable: ₹16,220**\n\nNext filing due: 20th. Want me to generate the full report?",
  suggest:  "**Top 3 profit moves for today:**\n1. Raise Maggi price by ₹2 → +₹480/month\n2. Remind Rahul Sharma about ₹2,300 → immediate cash\n3. Order Aashirvaad Atta before stockout → avoid ₹3,000 lost sales",
  best:     "**Top selling products this month:**\n1. Tata Salt 1kg — 420 units — ₹9,240\n2. Aashirvaad Atta 5kg — 185 units — ₹38,850\n3. Maggi 70g — 312 units — ₹4,680\n4. Fortune Oil 1L — 94 units — ₹15,510\n\nFocus reorder on items 2 and 3 — both running low!",
};

function findLocalResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('sale') || q.includes('today') || q.includes('aaj')) return localResponses.sales;
  if (q.includes('profit') || q.includes('munafa'))                    return localResponses.profit;
  if (q.includes('stock') || q.includes('inventory') || q.includes('low')) return localResponses.stock;
  if (q.includes('expir') || q.includes('khatam'))                    return localResponses.expiry;
  if (q.includes('payment') || q.includes('pending') || q.includes('credit') || q.includes('baki')) return localResponses.payment;
  if (q.includes('customer') || q.includes('grahak'))                 return localResponses.customer;
  if (q.includes('forecast') || q.includes('tomorrow') || q.includes('kal')) return localResponses.forecast;
  if (q.includes('gst') || q.includes('tax'))                         return localResponses.gst;
  if (q.includes('suggest') || q.includes('advice') || q.includes('improve') || q.includes('tip')) return localResponses.suggest;
  if (q.includes('best') || q.includes('top') || q.includes('popular')) return localResponses.best;
  return "Based on your store data, I can see **4 low-stock items** and **₹8,550** in pending credit.\n\nAsk me anything specific about sales, stock, customers, or profits!";
}

async function callGemini(messages: AIMessage[], systemContext: string): Promise<string> {
  if (!GEMINI_API_KEY) return '';
  const conversation = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemContext }] },
      contents: conversation,
      generationConfig: { temperature: 0.75, maxOutputTokens: 400 },
    }),
  });
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const QUICK_PROMPTS = [
  { label: "Today's sales",      icon: TrendingUp  },
  { label: 'Low stock items',    icon: Package     },
  { label: 'Pending payments',   icon: CreditCard  },
  { label: 'Predict tomorrow',   icon: BarChart3   },
  { label: 'Increase profit',    icon: Star        },
  { label: 'Expiring medicines', icon: Clock       },
  { label: 'GST report',         icon: FileText    },
  { label: 'Best selling products', icon: ChevronRight },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: AIMessage }) {
  const parts = msg.content.split(/(\*\*[^*]+\*\*)/g);
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 25 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${isUser ? 'gradient-primary text-white' : ''}`}
        style={!isUser ? { background: 'var(--primary-light)' } : {}}>
        {isUser ? 'R' : <Cpu size={16} style={{ color: 'var(--primary)' }} />}
      </div>
      <div className="max-w-[80%]">
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${isUser ? 'rounded-br-sm text-white' : 'rounded-bl-sm'}`}
          style={{
            background: isUser ? 'var(--primary)' : 'white',
            border: isUser ? 'none' : '1px solid var(--border)',
            color: isUser ? 'white' : 'var(--text-primary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={i}>{part.slice(2, -2)}</strong>
              : <span key={i}>{part}</span>
          )}
        </div>
        {msg.timestamp && (
          <p className="text-[10px] mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
            {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function AIAssistantPage() {
  const { products, customers, sales } = useAppStore();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [usingGemini, setUsingGemini] = useState(!!GEMINI_API_KEY);
  const bottomRef = useRef<HTMLDivElement>(null);

  const storeContext = useMemo(() => {
    const todaySales   = sales.slice(0, 10).reduce((s, sale) => s + sale.total, 0);
    const lowStock     = products.filter(p => p.stock > 0 && p.stock < p.minStock);
    const expiring     = products.filter(p => p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 30 && getDaysUntilExpiry(p.expiryDate) > 0);
    const pendingCredit = customers.filter(c => c.creditBalance > 0);
    const totalCredit  = customers.reduce((s, c) => s + c.creditBalance, 0);
    return `You are RetailOS AI — a smart, friendly business assistant for Indian retail stores.
Store: Shree Ram Medical & General Stores, Bangalore.
LIVE DATA (${new Date().toLocaleDateString('en-IN')}):
- Today's sales: ₹${todaySales > 0 ? todaySales.toFixed(0) : '16,700'} | Profit margin: ~27%
- Monthly revenue: ₹4,56,000
- Total products: ${products.length} | Low stock: ${lowStock.map(p => p.name).join(', ') || 'None'}
- Expiring products: ${expiring.map(p => `${p.name} (${getDaysUntilExpiry(p.expiryDate!)}d)`).join(', ') || 'None'}
- Customers: ${customers.length} | Credit outstanding: ₹${totalCredit.toFixed(0)} from ${pendingCredit.length} customers
- Recent sales: ${sales.slice(0, 3).map(s => `${s.customerName} ₹${s.total}`).join(', ')}
Rules: Respond in simple, friendly English or Hindi. Use ₹ for currency. Be specific and actionable. Max 5 lines per response. Do NOT use emojis in your response. Use ** for bold text.`;
  }, [products, customers, sales]);

  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const totalCredit = customers.reduce((s, c) => s + c.creditBalance, 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < p.minStock).length;
    setMessages([{
      role: 'assistant',
      content: `${greeting}, Rajesh ji!\n\nI'm your AI business partner. Here's what needs attention today:\n\n**Today's sales target:** ₹20,000\n**${lowStockCount} items** are running low on stock\n**Pending credit:** ${formatCurrency(totalCredit)} from ${customers.filter(c => c.creditBalance > 0).length} customers\n\nWhat would you like help with? ${GEMINI_API_KEY ? 'Real Gemini AI is active.' : 'Smart offline mode — add Gemini key for real AI.'}`,
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: AIMessage = { role: 'user', content: text, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    try {
      let response = '';
      if (GEMINI_API_KEY) {
        try {
          response = await callGemini(newMessages, storeContext);
          setUsingGemini(true);
        } catch { setUsingGemini(false); }
      }
      if (!response) {
        await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
        response = findLocalResponse(text);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again!', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat cleared. What can I help you with today, Rajesh ji?', timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col page-enter" style={{ height: 'calc(100dvh - 56px)' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center"
              style={{ boxShadow: 'var(--shadow-blue)' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>AI Business Assistant</h1>
              <div className="flex items-center gap-1.5">
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-1.5 h-1.5 rounded-full ${usingGemini && GEMINI_API_KEY ? 'bg-green-400' : 'bg-amber-400'}`} />
                <span className={`text-[11px] font-medium ${usingGemini && GEMINI_API_KEY ? 'text-green-600' : 'text-amber-600'}`}>
                  {usingGemini && GEMINI_API_KEY ? 'Gemini AI Active' : 'Smart Offline Mode'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={clearChat}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--bg-pearl)', color: 'var(--text-secondary)' }}>
            <RefreshCw size={12} /> Clear
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {QUICK_PROMPTS.map((p, i) => (
            <motion.button key={i}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => sendMessage(p.label)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all hover:border-blue-300 hover:bg-blue-50"
              style={{ borderColor: 'var(--border)', background: 'white', color: 'var(--text-secondary)' }}>
              <p.icon size={12} style={{ color: 'var(--primary)' }} /> {p.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 py-4" style={{ overscrollBehavior: 'contain' }}>
        <AnimatePresence>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
              <Cpu size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="rounded-2xl rounded-bl-sm border" style={{ background: 'white', borderColor: 'var(--border)' }}>
              <TypingDots />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 pb-safe flex-shrink-0 border-t" style={{ borderColor: 'var(--border)', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2 items-center pt-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about your business..."
            className="input-premium flex-1 text-sm" disabled={isTyping} />
          <motion.button type="submit" disabled={!input.trim() || isTyping}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: input.trim() && !isTyping ? 'var(--primary)' : 'var(--bg-pearl)',
              color: input.trim() && !isTyping ? 'white' : 'var(--text-muted)',
            }}>
            <Send size={18} />
          </motion.button>
        </form>
        <p className="text-center text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
          {GEMINI_API_KEY
            ? 'Powered by Google Gemini AI · Ask in English or Hindi'
            : 'Smart offline mode · Add Gemini key in Settings for real AI'}
        </p>
      </div>
    </div>
  );
}
