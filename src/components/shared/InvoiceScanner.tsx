'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Camera, RefreshCw, Check, Package,
  AlertTriangle, Sparkles, FileImage, Plus, Trash2
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

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

async function extractProductsFromInvoice(imageBase64: string, mimeType: string): Promise<ExtractedProduct[]> {
  if (!GEMINI_API_KEY) throw new Error('No API key');

  const prompt = `You are analyzing a distributor/wholesale invoice or bill image from an Indian retail store.

Extract ALL products listed in this invoice. For each product, return a JSON array with these fields:
- name: product name (string)
- quantity: quantity purchased (number)
- purchasePrice: price per unit in rupees (number, cost to retailer)
- sellingPrice: suggested selling price (number, estimate purchasePrice * 1.20 for 20% margin)
- unit: unit of measurement like "Piece", "Kg", "Litre", "Strip", "Box", "Packet" (string)
- category: one of ["Grocery", "Dairy", "Hygiene", "Medicine", "Beverages", "Cleaning", "Personal Care", "Other"] (string)
- brand: brand name if visible (string, empty string if not visible)

IMPORTANT: Return ONLY a valid JSON array, no explanation, no markdown, just the raw JSON array starting with [ and ending with ].
If no products are visible, return [].

Example output format:
[{"name":"Tata Salt 1kg","quantity":24,"purchasePrice":18,"sellingPrice":22,"unit":"Packet","category":"Grocery","brand":"Tata"},{"name":"Amul Butter 500g","quantity":12,"purchasePrice":240,"sellingPrice":290,"unit":"Piece","category":"Dairy","brand":"Amul"}]`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
      })
    }
  );

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]).map((p: any) => ({ ...p, selected: true }));
}

// Mock extraction for demo when no API key
function mockExtraction(): ExtractedProduct[] {
  return [
    { name: 'Tata Salt 1kg', quantity: 24, purchasePrice: 18, sellingPrice: 22, unit: 'Packet', category: 'Grocery', brand: 'Tata', selected: true },
    { name: 'Aashirvaad Atta 5kg', quantity: 10, purchasePrice: 195, sellingPrice: 240, unit: 'Packet', category: 'Grocery', brand: 'Aashirvaad', selected: true },
    { name: 'Maggi Noodles 70g', quantity: 48, purchasePrice: 12, sellingPrice: 15, unit: 'Piece', category: 'Grocery', brand: 'Nestle', selected: true },
    { name: 'Amul Butter 500g', quantity: 6, purchasePrice: 245, sellingPrice: 295, unit: 'Piece', category: 'Dairy', brand: 'Amul', selected: true },
    { name: 'Fortune Oil 1L', quantity: 12, purchasePrice: 130, sellingPrice: 160, unit: 'Litre', category: 'Grocery', brand: 'Fortune', selected: true },
    { name: 'Dettol Soap 125g', quantity: 36, purchasePrice: 38, sellingPrice: 52, unit: 'Piece', category: 'Hygiene', brand: 'Dettol', selected: true },
  ];
}

interface InvoiceScannerProps {
  onClose: () => void;
}

export function InvoiceScanner({ onClose }: InvoiceScannerProps) {
  const { addProduct } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'scanning' | 'review' | 'done'>('upload');
  const [preview, setPreview] = useState<string>('');
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [error, setError] = useState('');
  const [addedCount, setAddedCount] = useState(0);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, HEIC)');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setStep('scanning');
      setError('');

      try {
        let extracted: ExtractedProduct[] = [];
        if (GEMINI_API_KEY) {
          const base64 = dataUrl.split(',')[1];
          extracted = await extractProductsFromInvoice(base64, file.type);
        } else {
          // Simulate scanning delay for demo
          await new Promise(r => setTimeout(r, 2500));
          extracted = mockExtraction();
        }

        if (extracted.length === 0) {
          setError('No products found in the image. Try a clearer photo of the invoice.');
          setStep('upload');
          return;
        }
        setProducts(extracted);
        setStep('review');
      } catch (err: any) {
        setError(err.message || 'Failed to scan invoice. Try again.');
        setStep('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleProduct = (idx: number) => {
    setProducts(prev => prev.map((p, i) => i === idx ? { ...p, selected: !p.selected } : p));
  };

  const updateProduct = (idx: number, field: keyof ExtractedProduct, value: any) => {
    setProducts(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const removeProduct = (idx: number) => {
    setProducts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddToInventory = () => {
    const selected = products.filter(p => p.selected);
    selected.forEach(p => {
      const product: Product = {
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sku: `INV-${Date.now()}`,
        name: p.name,
        category: p.category,
        brand: p.brand,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        mrp: Math.round(p.sellingPrice * 1.05),
        stock: p.quantity,
        minStock: Math.max(5, Math.floor(p.quantity * 0.2)),
        unit: p.unit,
        gstPercent: p.category === 'Medicine' ? 12 : 5,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      addProduct(product);
    });
    setAddedCount(selected.length);
    setStep('done');
  };

  const selectedCount = products.filter(p => p.selected).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <FileImage size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Invoice Scanner</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {GEMINI_API_KEY ? 'AI-powered · Gemini Vision' : 'Demo mode · Add Gemini key for real AI'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* STEP: Upload */}
          {step === 'upload' && (
            <div className="p-5">
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-2xl mb-4 text-sm font-medium text-red-600"
                  style={{ background: '#fee2e2' }}>
                  <AlertTriangle size={15} /> {error}
                </div>
              )}

              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              >
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3">
                  <Upload size={28} className="text-white" />
                </div>
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Upload Invoice Photo
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Take a photo of the distributor's bill or upload from gallery
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Supports JPG, PNG, HEIC · Max 10MB
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: 'var(--primary)' }}>
                  <Upload size={17} /> Upload from Gallery
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => { if (fileRef.current) { fileRef.current.capture = 'environment'; fileRef.current.click(); } }}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <Camera size={17} /> Take Photo
                </motion.button>
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {!GEMINI_API_KEY && (
                <div className="mt-4 p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2"
                  style={{ background: '#fef3c7', color: '#92400e' }}>
                  <Sparkles size={13} className="flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Demo mode:</strong> Add your Gemini API key in Settings for real AI invoice reading.
                    Demo will show sample extracted products.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP: Scanning */}
          {step === 'scanning' && (
            <div className="p-5 flex flex-col items-center justify-center min-h-64">
              {preview && (
                <div className="w-40 h-28 rounded-2xl overflow-hidden mb-6 border" style={{ borderColor: 'var(--border)' }}>
                  <img src={preview} alt="Invoice" className="w-full h-full object-cover" />
                </div>
              )}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-14 h-14 rounded-full border-4 border-t-transparent mb-4"
                style={{ borderColor: 'var(--primary-light)', borderTopColor: 'var(--primary)' }}
              />
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {GEMINI_API_KEY ? 'AI is reading your invoice...' : 'Analyzing invoice...'}
              </p>
              <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Extracting product names, quantities & prices
              </p>
            </div>
          )}

          {/* STEP: Review */}
          {step === 'review' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {products.length} products found
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Review and edit before adding to inventory
                  </p>
                </div>
                <button onClick={() => { setStep('upload'); setProducts([]); setPreview(''); }}
                  className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                  Scan Again
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {products.map((p, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="border rounded-2xl p-3"
                    style={{
                      borderColor: p.selected ? 'var(--primary)' : 'var(--border)',
                      background: p.selected ? 'var(--primary-light)' : 'var(--bg-pearl)',
                      opacity: p.selected ? 1 : 0.5,
                    }}>
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox */}
                      <button onClick={() => toggleProduct(i)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${p.selected ? 'bg-blue-600' : 'border-2'}`}
                        style={{ borderColor: p.selected ? 'transparent' : 'var(--border-strong)' }}>
                        {p.selected && <Check size={12} className="text-white" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Product name */}
                        <input value={p.name} onChange={e => updateProduct(i, 'name', e.target.value)}
                          className="w-full text-sm font-semibold bg-transparent border-none outline-none"
                          style={{ color: 'var(--text-primary)' }} />
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Qty: <strong>{p.quantity}</strong> {p.unit}
                          </span>
                          <span className="text-xs text-green-600 font-semibold">
                            Buy ₹{p.purchasePrice} → Sell ₹{p.sellingPrice}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#e8f0fe', color: 'var(--primary)' }}>
                            {p.category}
                          </span>
                        </div>
                      </div>

                      <button onClick={() => removeProduct(i)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-100 flex-shrink-0">
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <motion.button whileTap={{ scale: 0.97 }}
                  disabled={selectedCount === 0}
                  onClick={handleAddToInventory}
                  className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: selectedCount > 0 ? 'var(--primary)' : '#e2e8f0', color: selectedCount > 0 ? 'white' : 'var(--text-muted)' }}>
                  <Plus size={18} />
                  Add {selectedCount} Product{selectedCount !== 1 ? 's' : ''} to Inventory
                </motion.button>
              </div>
            </div>
          )}

          {/* STEP: Done */}
          {step === 'done' && (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check size={36} className="text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {addedCount} Products Added!
              </h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                All selected products have been added to your inventory with purchase prices and stock quantities.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="btn-primary !px-6">Done</button>
                <button onClick={() => { setStep('upload'); setProducts([]); setPreview(''); setAddedCount(0); }}
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
