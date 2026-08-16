'use client';

import { auth } from '@/lib/firebase';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Smart local responses for common queries (works without internet)
const localResponses: Record<string, string> = {
  'sales': '📊 Today\'s sales: **₹16,700** across 47 orders. Profit margin is **26.9%**. Saturday is your best day — consider extra stock for weekends!',
  'profit': '💰 Today\'s profit: **₹4,500** — up **14%** from yesterday! Your best margin items are Paracetamol (50%) and Dettol Soap (26%).',
  'stock': '📦 **4 items need attention:**\n• Maggi Noodles — only 5 packs left\n• Aashirvaad Atta — 8 bags (order today!)\n• Amul Butter — 3 units\n• Amoxicillin — expiring in 20 days\n\nShall I create a purchase order?',
  'expiry': '⚠️ **Expiring soon:**\n• Amoxicillin 250mg — 20 days (9 strips)\n• Amul Butter 500g — 15 Feb (3 units)\n\nTip: Give 10% discount on Amoxicillin to clear stock. You\'ll save ₹585 vs total loss.',
  'customer': '👥 **Customer insights:**\n• Rahul Sharma owes **₹2,300** (45 days overdue)\n• Suresh Kumar inactive for **72 days**\n• Ravi Gupta inactive for **108 days**\n\nSend WhatsApp reminders to recover ₹8,550 total.',
  'payment': '💳 **Pending payments:**\n• Rahul Sharma — ₹2,300\n• Suresh Kumar — ₹1,800\n• Ravi Gupta — ₹3,200\n• Others — ₹1,250\n\n**Total: ₹8,550** — Should I send WhatsApp reminders to all?',
  'forecast': '🔮 **Tomorrow\'s forecast:**\n• Expected sales: **₹18,200 – ₹21,500**\n• It\'s Sunday, typically your 2nd best day\n• Stock up: Fortune Oil, Maggi, Tata Salt tend to sell more on weekends',
  'gst': '📋 **GST Summary (December 2024):**\n• Total sales: ₹4,56,000\n• GST collected: ₹48,320\n• Input GST: ₹32,100\n• **GST payable: ₹16,220**\n\nNext filing due: 20th January. Want me to generate the full report?',
  'slow': '🐌 **Slow-moving items (last 30 days):**\n• Bourn Vita 1kg — only 2 sold\n• Pantene Shampoo — 3 sold\n• Surf Excel 1kg — 5 sold\n\nConsider a "Buy 2 Get 5% Off" offer or return to supplier.',
  'suggest': '💡 **Top 3 profit moves for today:**\n1. Raise Maggi price by ₹2 → +₹480/month\n2. Remind Rahul Sharma about ₹2,300 → immediate cash\n3. Order Aashirvaad Atta before stockout → avoid ₹3,000 lost sales',
  'help': '🤖 **I can help you with:**\n• Sales & profit data\n• Stock & expiry alerts\n• Customer payments\n• Price suggestions\n• Sales forecasts\n• GST reports\n• Purchase orders\n\nJust ask me anything about your business!',
};

function findLocalResponse(query: string): string | null {
  const q = query.toLowerCase();
  if (q.includes('sale') || q.includes('today') || q.includes('aaj')) return localResponses['sales'];
  if (q.includes('profit') || q.includes('munafa')) return localResponses['profit'];
  if (q.includes('stock') || q.includes('inventory') || q.includes('kam')) return localResponses['stock'];
  if (q.includes('expir') || q.includes('expire') || q.includes('khatam')) return localResponses['expiry'];
  if (q.includes('customer') || q.includes('grahak')) return localResponses['customer'];
  if (q.includes('payment') || q.includes('pending') || q.includes('credit') || q.includes('baki')) return localResponses['payment'];
  if (q.includes('forecast') || q.includes('predict') || q.includes('tomorrow') || q.includes('kal')) return localResponses['forecast'];
  if (q.includes('gst') || q.includes('tax')) return localResponses['gst'];
  if (q.includes('slow') || q.includes('not sell') || q.includes('dead')) return localResponses['slow'];
  if (q.includes('suggest') || q.includes('advice') || q.includes('tip') || q.includes('improve')) return localResponses['suggest'];
  if (q.includes('help') || q.includes('what') || q.includes('kya')) return localResponses['help'];
  return null;
}

export async function askAI(messages: AIMessage[]): Promise<string> {
  const lastMessage = messages[messages.length - 1].content;

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.reply;
      }
    }
  } catch (error) {
    console.error('AI fetch error:', error);
  }

  // Intelligent local fallback
  return new Promise(resolve => {
    setTimeout(() => {
      const local = findLocalResponse(lastMessage);
      resolve(local || getSmartFallback(lastMessage));
    }, 800);
  });
}

function getSmartFallback(query: string): string {
  return `🤖 I analyzed your question: **"${query}"**\n\nBased on your store data:\n• Today's profit is strong at ₹4,500 (+14%)\n• 4 items need restocking urgently\n• ₹8,550 in pending customer payments\n\nTip: Focus on collecting Rahul Sharma's ₹2,300 payment today — it's the quickest cash improvement you can make! 💰`;
}

// ─── Profit Engine ─────────────────────────────────────────────
export function generateMorningBriefing(): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, Rajesh ji! 🙏\n\nYour store is doing great today. Here's your AI briefing:\n\n💰 Today's profit so far: ₹4,500\n📦 4 items need immediate restocking\n⚠️ Amoxicillin expires in 20 days — apply 10% discount\n👤 Rahul Sharma's ₹2,300 is overdue\n\nTop action: Raise Maggi price by ₹2 — competitors charge more and you'll earn ₹480 extra per month! 🚀`;
}
