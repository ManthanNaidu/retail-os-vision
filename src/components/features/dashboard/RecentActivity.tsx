'use client';

import { motion } from 'framer-motion';
import { Sale } from '@/types';
import { formatCurrency, formatTime } from '@/lib/utils';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RecentActivityProps {
  sales: Sale[];
}

const paymentIcons = {
  cash: '💵',
  upi: '📱',
  card: '💳',
  credit: '📋',
  split: '✂️',
};

export function RecentActivity({ sales }: RecentActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center">
            <ShoppingBag size={15} className="text-white" />
          </div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Sales</h2>
        </div>
        <Link href="/billing" className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
          View All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-2">
        {sales.slice(0, 5).map((sale, i) => (
          <motion.div
            key={sale.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.06 }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'var(--bg-pearl)' }}>
              {paymentIcons[sale.paymentMethod]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {sale.customerName || 'Walk-in Customer'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} · {formatTime(sale.createdAt)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(sale.total)}</p>
              <p className="text-[10px] capitalize font-medium" style={{ color: 'var(--accent)' }}>{sale.paymentMethod}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
