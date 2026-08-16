import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    
    // Check if the user has AI permission. E.g., maybe Cashiers can't ask AI.
    if (decodedToken.role === 'CASHIER') {
       return NextResponse.json({ error: 'Forbidden: Cashiers cannot access AI Insights' }, { status: 403 });
    }

    const tenantId = decodedToken.tenant_id || decodedToken.uid;
    
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Retrieve the tenant's data safely on the backend
    const tenantRef = getAdminDb().collection('users').doc(tenantId);
    const tenantDoc = await tenantRef.get();
    const tenantData = tenantDoc.data() || {};
    
    // Data Minimization for AI (Phase 14)
    // Only send aggregate data, not full customer PI (Phone numbers, addresses)
    const products = tenantData.products || [];
    const sales = tenantData.sales || [];
    const customers = tenantData.customers || [];
    
    const todaySales = sales.filter((s: any) => new Date(s.createdAt).toDateString() === new Date().toDateString());
    const totalToday = todaySales.reduce((sum: number, s: any) => sum + s.total, 0);
    const totalOrders = todaySales.length;
    
    const lowStockItems = products.filter((p: any) => p.stock < 10).map((p: any) => `${p.name} (${p.stock})`);
    
    // Aggregated context
    const SYSTEM_CONTEXT = `You are RetailOS AI - an intelligent business assistant for Indian retail stores.
You help shopkeepers increase profits, reduce losses, manage inventory, and make better business decisions.
Current data context (DO NOT EXPOSE SENSITIVE INFO):
- Today's sales: ₹${totalToday} | Orders: ${totalOrders}
- Low stock items: ${lowStockItems.join(', ')}
- Total Customers: ${customers.length}

Always respond in simple, friendly language. Use ₹ for currency. 
Give specific, actionable advice. Keep responses concise (max 3-4 lines).
Add relevant emojis.`;

    const conversation = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (!GEMINI_API_KEY) {
      // Fallback if no API key
      return NextResponse.json({ reply: 'AI is currently in fallback mode. Please configure API keys.' });
    }

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
        contents: conversation,
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not process that request.';
      return NextResponse.json({ reply });
    } else {
      const errData = await response.text();
      console.error('Gemini error:', errData);
      return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
    }

  } catch (error: any) {
    console.error('AI route error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
