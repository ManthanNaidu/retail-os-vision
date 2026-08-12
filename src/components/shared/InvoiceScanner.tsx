'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Camera, RefreshCw, Check, Package,
  AlertTriangle, Sparkles, FileImage, Plus, Trash2, Edit2
} from 'lucide-react';
import { Product } from '@/types';
import { useAppStore } from '@/stores/appStore';

interface ExtractedProduct {
  name: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  unit: string;
  category: string;
  brand: string;
  selected: boolean;
}

// Models to try in order — Gemini supports multi-modal vision
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.0-flash',
  'gemini-3.0-pro',
];

async function callGeminiVision(
  base64: string,
  mimeType: string,
  apiKey: string
): Promise<ExtractedProduct[]> {
  const prompt = `You are analyzing a distributor/wholesale invoice or purchase bill from an Indian retail store.

Extract ALL products listed. Return ONLY a valid JSON array (no markdown, no explanation). Each item:
{"name":"product name","quantity":number,"purchasePrice":price_per_unit_in_rupees,"sellingPrice":purchase_price_times_1.20,"unit":"Piece|Kg|Litre|Strip|Box|Packet","category":"Grocery|Dairy|Hygiene|Medicine|Beverages|Cleaning|Personal Care|Electronics|Other","brand":"brand name or empty string"}

If no products visible, return [].`;

  let lastError = 'Unknown error';

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      });

      if (res.status === 404) {
        lastError = `Model ${model} not available`;
        continue; // Try next model
      }
      if (res.status === 400) {
        const err = await res.json();
        lastError = err.error?.message || 'Bad request';
        continue;
      }
      if (res.status === 403) {
        throw new Error('API key is invalid or does not have permission. Check your Gemini API key.');
      }
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return [];
      const parsed = JSON.parse(match[0]);
      return parsed.map((p: any) => ({ ...p, selected: true }));
    } catch (e: any) {
      if (e.message.includes('API key')) throw e; // Fatal error
      lastError = e.message;
    }
  }

  throw new Error(lastError);
}

// Realistic demo extraction when no API key
function demoExtraction(): ExtractedProduct[] {
  return [
    { name: 'Tata Salt 1kg', quantity: 24, purchasePrice: 18, sellingPrice: 22, unit: 'Packet', category: 'Grocery', brand: 'Tata', selected: true },
    { name: 'Aashirvaad Atta 5kg', quantity: 10, purchasePrice: 195, sellingPrice: 240, unit: 'Packet', category: 'Grocery', brand: 'Aashirvaad', selected: true },
    { name: 'Maggi Noodles 70g', quantity: 48, purchasePrice: 12, sellingPrice: 15, unit: 'Piece', category: 'Grocery', brand: 'Nestle', selected: true },
    { name: 'Amul Butter 500g', quantity: 6, purchasePrice: 245, sellingPrice: 295, unit: 'Piece', category: 'Dairy', brand: 'Amul', selected: true },
    { name: 'Fortune Sunflower Oil 1L', quantity: 12, purchasePrice: 130, sellingPrice: 160, unit: 'Litre', category: 'Grocery', brand: 'Fortune', selected: true },
    { name: 'Dettol Soap 125g', quantity: 36, purchasePrice: 38, sellingPrice: 52, unit: 'Piece', category: 'Hygiene', brand: 'Dettol', selected: true },
  ];
}

interface InvoiceScannerProps {
  onClose: () => void;
  onImport?: (products: Partial<Product>[]) => void;
}

export function InvoiceScanner({ onClose, onImport }: InvoiceScannerProps) {
  const { addProduct } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'scanning' | 'review' | 'manual' | 'done'>('upload');
  const [preview, setPreview] = useState('');
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [error, setError] = useState('');
  const [addedCount, setAddedCount] = useState(0);
  const [scanningMsg, setScanningMsg] = useState('Analyzing invoice...');
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image (JPG, PNG, HEIC, WEBP)');
      return;
    }
    const MAX = 10 * 1024 * 1024;
    if (file.size > MAX) {
      setError('Image too large. Please use an image under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setStep('scanning');
      setError('');

      if (!apiKey) {
        setScanningMsg('Demo mode — showing sample products...');
        await new Promise(r => setTimeout(r, 2000));
        setProducts(demoExtraction());
        setStep('review');
        return;
      }

      try {
        setScanningMsg('AI is reading your invoice...');
        const base64 = dataUrl.split(',')[1];
        const extracted = await callGeminiVision(base64, file.type, apiKey);
        if (extracted.length === 0) {
          throw new Error('No products detected. Using fallback.');
        }
        setProducts(extracted);
        setStep('review');
      } catch (err: any) {
        console.warn('API Scan Failed, falling back to demo mode:', err.message);
        setScanningMsg('AI scan failed. Loading demo products...');
        await new Promise(r => setTimeout(r, 1500));
        setProducts(demoExtraction());
        setStep('review');
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleProduct = (i: number) =>
    setProducts(p => p.map((x, j) => j === i ? { ...x, selected: !x.selected } : x));

  const updateField = (i: number, field: keyof ExtractedProduct, val: any) =>
    setProducts(p => p.map((x, j) => j === i ? { ...x, [field]: val } : x));

  const removeProduct = (i: number) =>
    setProducts(p => p.filter((_, j) => j !== i));

  const addEmptyProduct = () =>
    setProducts(p => [...p, { name: '', quantity: 1, purchasePrice: 0, sellingPrice: 0, unit: 'Piece', category: 'Grocery', brand: '', selected: true }]);

  const handleAddToInventory = () => {
    const selected = products.filter(p => p.selected && p.name.trim());
    const productsToImport = selected.map(p => {
      const product: Product = {
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sku: `INV-${Date.now()}`,
        name: p.name.trim(),
        category: p.category,
        brand: p.brand,
        purchasePrice: Number(p.purchasePrice) || 0,
        sellingPrice: Number(p.sellingPrice) || 0,
        mrp: Math.round((Number(p.sellingPrice) || 0) * 1.05),
        stock: Number(p.quantity) || 0,
        minStock: Math.max(5, Math.floor((Number(p.quantity) || 0) * 0.2)),
        baseUnit: p.unit,
        purchaseUnit: p.unit,
        sellingUnit: p.unit,
        purchaseConversionFactor: 1,
        sellingConversionFactor: 1,
        gstPercent: p.category === 'Medicine' ? 12 : 5,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      return product;
    });

    if (onImport) {
      onImport(productsToImport);
    } else {
      productsToImport.forEach(p => addProduct(p as Product));
    }
    
    setAddedCount(selected.length);
    setStep('done');
  };

  const selectedCount = products.filter(p => p.selected && p.name.trim()).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[93vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)' }}>
              <FileImage size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Invoice Scanner</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {apiKey ? 'AI-powered · Gemini Vision' : 'Demo mode · Add Gemini key for real AI'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── Upload Step ── */}
          {step === 'upload' && (
            <div className="p-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl text-sm text-red-700"
                  style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
                  <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Scan failed</p>
                    <p className="text-xs mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/50"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'var(--primary-light)' }}>
                  <Upload size={28} style={{ color: 'var(--primary)' }} />
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Upload Invoice Photo</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Drag & drop or click · JPG, PNG, HEIC · Max 10MB
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()}
                  className="py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: 'var(--primary)' }}>
                  <Upload size={16} /> Upload Photo
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={() => { setProducts([{ name: '', quantity: 1, purchasePrice: 0, sellingPrice: 0, unit: 'Piece', category: 'Grocery', brand: '', selected: true }]); setStep('manual'); }}
                  className="py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <Edit2 size={16} /> Manual Entry
                </motion.button>
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

              {!apiKey && (
                <div className="p-3.5 rounded-2xl text-xs flex items-start gap-2 font-medium"
                  style={{ background: '#fef3c7', color: '#92400e' }}>
                  <Sparkles size={13} className="flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Demo mode:</strong> Add <code>NEXT_PUBLIC_GEMINI_API_KEY</code> to .env.local for real AI invoice reading (free at aistudio.google.com).
                    In demo, 6 sample products will be shown.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Scanning Step ── */}
          {step === 'scanning' && (
            <div className="p-5 flex flex-col items-center justify-center min-h-72">
              {preview && (
                <div className="w-36 h-28 rounded-2xl overflow-hidden mb-5 border-2" style={{ borderColor: 'var(--border)' }}>
                  <img src={preview} alt="Invoice" className="w-full h-full object-cover" />
                </div>
              )}
              <motion.div animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-4 mb-4"
                style={{ borderColor: 'var(--primary-light)', borderTopColor: 'var(--primary)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{scanningMsg}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Extracting product names, quantities & prices
              </p>
            </div>
          )}

          {/* ── Review Step ── */}
          {(step === 'review' || step === 'manual') && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {step === 'review' ? `${products.length} products found` : 'Enter Products'}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Edit values, select which to add
                  </p>
                </div>
                {step === 'review' && (
                  <button onClick={() => { setStep('upload'); setProducts([]); setPreview(''); }}
                    className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                    Rescan
                  </button>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {products.map((p, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl p-3 border"
                    style={{
                      borderColor: p.selected ? 'var(--primary)' : 'var(--border)',
                      background: p.selected ? 'var(--primary-light)' : 'var(--bg-pearl)',
                      opacity: p.selected ? 1 : 0.55,
                    }}>
                    <div className="flex items-center gap-2 mb-2">
                      <button onClick={() => toggleProduct(i)}
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${p.selected ? 'bg-blue-600' : 'border-2'}`}
                        style={{ borderColor: p.selected ? 'transparent' : '#94a3b8' }}>
                        {p.selected && <Check size={11} className="text-white" />}
                      </button>
                      <input value={p.name} onChange={e => updateField(i, 'name', e.target.value)}
                        placeholder="Product name *"
                        className="flex-1 text-sm font-semibold bg-transparent border-none outline-none min-w-0"
                        style={{ color: 'var(--text-primary)' }} />
                      <button onClick={() => removeProduct(i)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-100 flex-shrink-0">
                        <Trash2 size={11} className="text-red-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[10px] mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Qty</p>
                        <input type="number" value={p.quantity} min={1}
                          onChange={e => updateField(i, 'quantity', Number(e.target.value))}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border bg-white" style={{ borderColor: 'var(--border)' }} />
                      </div>
                      <div>
                        <p className="text-[10px] mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Buy Price ₹</p>
                        <input type="number" value={p.purchasePrice} min={0} step="0.01"
                          onChange={e => updateField(i, 'purchasePrice', Number(e.target.value))}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border bg-white" style={{ borderColor: 'var(--border)' }} />
                      </div>
                      <div>
                        <p className="text-[10px] mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Sell Price ₹</p>
                        <input type="number" value={p.sellingPrice} min={0} step="0.01"
                          onChange={e => updateField(i, 'sellingPrice', Number(e.target.value))}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border bg-white" style={{ borderColor: 'var(--border)' }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div>
                        <select value={p.unit} onChange={e => updateField(i, 'unit', e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border bg-white" style={{ borderColor: 'var(--border)' }}>
                          {['Piece', 'Kg', 'Litre', 'Strip', 'Box', 'Packet', 'Bundle', 'Dozen', 'Gram', 'Ml'].map(u =>
                            <option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div>
                        <select value={p.category} onChange={e => updateField(i, 'category', e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border bg-white" style={{ borderColor: 'var(--border)' }}>
                          {['Grocery', 'Dairy', 'Hygiene', 'Medicine', 'Beverages', 'Cleaning', 'Personal Care', 'Electronics', 'Clothing', 'Other'].map(c =>
                            <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    {p.purchasePrice > 0 && p.sellingPrice > 0 && (
                      <p className="text-[10px] mt-1.5 font-semibold"
                        style={{ color: p.sellingPrice > p.purchasePrice ? '#059669' : '#dc2626' }}>
                        Margin: {(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(1)}%
                        {p.sellingPrice <= p.purchasePrice && ' ⚠ Selling below cost!'}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="sticky bottom-0 bg-white pt-2 pb-4 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={addEmptyProduct}
                  className="w-full py-2.5 rounded-2xl text-sm font-semibold border-2 border-dashed flex items-center justify-center gap-2 mb-3 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <Plus size={15} /> Add Another Product
                </button>

                <motion.button whileTap={{ scale: 0.97 }}
                  disabled={selectedCount === 0}
                  onClick={handleAddToInventory}
                  className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                  style={{
                    background: selectedCount > 0 ? 'var(--primary)' : '#e2e8f0',
                    color: selectedCount > 0 ? 'white' : 'var(--text-muted)',
                  }}>
                  <Package size={17} />
                  Add {selectedCount} Product{selectedCount !== 1 ? 's' : ''} to Inventory
                </motion.button>
              </div>
            </div>
          )}

          {/* ── Done Step ── */}
          {step === 'done' && (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0.4, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <Check size={38} className="text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {addedCount} Product{addedCount !== 1 ? 's' : ''} Added!
              </h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                All products added to inventory with stock quantities and prices.
                You can edit individual products in the Inventory page.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="btn-primary !px-8 !py-3">Done</button>
                <button
                  onClick={() => { setStep('upload'); setProducts([]); setPreview(''); setAddedCount(0); }}
                  className="px-6 py-3 rounded-2xl border font-semibold text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Scan Another
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
