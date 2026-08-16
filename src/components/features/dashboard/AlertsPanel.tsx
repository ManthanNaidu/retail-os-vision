'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CreditCard, Package } from 'lucide-react';
import { formatCurrency, getDaysUntilExpiry } from '@/lib/utils';
import { Product, Customer } from '@/types';
import Link from 'next/link';

interface AlertsPanelProps {
  lowStockProducts: Product[];
  expiringProducts: Product[];
  creditCustomers: Customer[];
}

export function AlertsPanel({ lowStockProducts, expiringProducts, creditCustomers }: AlertsPanelProps) {
  const hasAlerts = lowStockProducts.length > 0 || expiringProducts.length > 0 || creditCustomers.length > 0;

  if (!hasAlerts) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-100">
          <AlertTriangle size={16} className="text-amber-600" />
        </div>
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Alerts & Actions</h2>
        <span className="ml-auto text-xs font-semibold bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
          {lowStockProducts.length + expiringProducts.length + creditCustomers.filter(c => c.creditBalance > 0).length} items
        </span>
      </div>

      <div className="space-y-2">
        {lowStockProducts.slice(0, 3).map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
            <Link href="/inventory">
              <div className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Only {p.stock} {p.baseUnit || 'items'} left</p>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Low Stock</span>
              </div>
            </Link>
          </motion.div>
        ))}

        {expiringProducts.slice(0, 2).map((p, i) => {
          const days = getDaysUntilExpiry(p.expiryDate!);
          return (
            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
              <Link href="/inventory">
                <div className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-red-50 transition-colors">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Expires in {days} days</p>
                  </div>
                  <span className="text-[10px] font-bold bg-red-100 text-red-500 px-2 py-0.5 rounded-full">Expiring</span>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {creditCustomers.filter(c => c.creditBalance > 0).slice(0, 2).map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }}>
            <Link href="/customers">
              <div className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard size={14} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Credit due</p>
                </div>
                <span className="text-[11px] font-bold text-red-500">{formatCurrency(c.creditBalance)}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
