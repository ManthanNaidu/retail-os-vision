'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, RotateCcw, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';

interface PhonePreviewProps {
  url?: string;
}

export function PhonePreview({ url = 'http://localhost:3000/dashboard' }: PhonePreviewProps) {
  const [open, setOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [zoom, setZoom] = useState(0.75);

  const pages = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Billing',   path: '/billing' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Customers', path: '/customers' },
    { label: 'AI Chat',   path: '/ai-assistant' },
    { label: 'Reports',   path: '/reports' },
    { label: 'Login',     path: '/login' },
  ];

  const setPage = (path: string) => {
    setCurrentUrl(`http://localhost:3000${path}`);
  };

  return (
    <>
      {/* Floating trigger button — only on large screens */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white text-sm font-bold shadow-lg"
          style={{ background: 'var(--primary)', boxShadow: 'var(--shadow-blue)' }}
        >
          <Smartphone size={18} />
          Mobile Preview
        </motion.button>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            onClick={e => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative flex gap-8 items-start"
            >
              {/* Controls sidebar */}
              <div className="flex flex-col gap-3 min-w-[140px]">
                {/* Close */}
                <button onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-medium transition-colors">
                  <X size={14} /> Close Preview
                </button>

                {/* Page links */}
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">Pages</p>
                  {pages.map(p => (
                    <button key={p.path} onClick={() => setPage(p.path)}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/15 transition-all block">
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Zoom controls */}
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">Zoom {Math.round(zoom * 100)}%</p>
                  <div className="flex gap-2">
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                      className="flex-1 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors">
                      <ZoomOut size={13} />
                    </button>
                    <button onClick={() => setZoom(z => Math.min(1, z + 0.1))}
                      className="flex-1 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors">
                      <ZoomIn size={13} />
                    </button>
                  </div>
                </div>

                {/* Open in new tab */}
                <a href={currentUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium transition-colors">
                  <ExternalLink size={13} /> Open in browser
                </a>
              </div>

              {/* Phone frame */}
              <div
                className="relative"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                }}
              >
                {/* Phone shell */}
                <div
                  className="relative rounded-[52px] overflow-hidden"
                  style={{
                    width: 390,
                    height: 844,
                    background: '#1a1a2e',
                    boxShadow: '0 0 0 2px #333, 0 0 0 8px #111, 0 30px 80px rgba(0,0,0,0.8)',
                    padding: '12px',
                  }}
                >
                  {/* Dynamic island */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 rounded-full z-10"
                    style={{ background: '#000' }} />

                  {/* Screen */}
                  <div className="rounded-[42px] overflow-hidden w-full h-full relative bg-white">
                    <iframe
                      src={currentUrl}
                      className="w-full h-full border-0"
                      title="Mobile Preview"
                      style={{
                        width: '390px',
                        height: '844px',
                        transform: 'scale(1)',
                        transformOrigin: 'top left',
                      }}
                    />
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-white/30" />
                </div>

                {/* Side buttons */}
                <div className="absolute -left-1.5 top-28 w-1 h-10 rounded-l bg-gray-700" />
                <div className="absolute -left-1.5 top-44 w-1 h-16 rounded-l bg-gray-700" />
                <div className="absolute -left-1.5 top-64 w-1 h-16 rounded-l bg-gray-700" />
                <div className="absolute -right-1.5 top-36 w-1 h-20 rounded-r bg-gray-700" />

                {/* URL bar overlay at bottom */}
                <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 max-w-xs">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-white/70 text-[10px] font-mono truncate">
                      {currentUrl.replace('http://localhost:3000', '')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
