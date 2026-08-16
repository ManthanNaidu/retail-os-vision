'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, TrendingUp as Profit, BarChart3, Wallet, CreditCard, ShoppingCart } from 'lucide-react';
import { CountUp } from '@/components/ui/CountUp';

const ICON_MAP: Record<string, React.ElementType> = {
  sales: DollarSign,
  profit: TrendingUp,
  revenue: BarChart3,
  cash: Wallet,
  credit: CreditCard,
  orders: ShoppingCart,
};

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue:   { bg: '#e8f0fe', text: 'var(--primary)', iconBg: '#c7d7fc' },
  green:  { bg: '#d1fae5', text: '#059669', iconBg: '#a7f3d0' },
  purple: { bg: '#ede9fe', text: '#7c3aed', iconBg: '#ddd6fe' },
  indigo: { bg: '#e0e7ff', text: '#4338ca', iconBg: '#c7d2fe' },
  amber:  { bg: '#fef3c7', text: '#d97706', iconBg: '#fde68a' },
  red:    { bg: '#fee2e2', text: '#dc2626', iconBg: '#fecaca' },
};

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: keyof typeof COLOR_MAP;
  icon: string;
  growth?: number;
  href?: string;
  delay?: number;
  subtitle?: string;
}

export function KPICard({ title, value, prefix = '', suffix = '', color, icon, growth, href, delay = 0, subtitle }: KPICardProps) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;
  const IconComponent = ICON_MAP[icon] || DollarSign;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', damping: 22, stiffness: 260 }}
      whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(15,26,46,0.12)' }}
      className="card p-4 cursor-pointer transition-all"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: colors.iconBg }}>
        <IconComponent size={18} style={{ color: colors.text }} />
      </div>

      {/* Label */}
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{title}</p>

      {/* Value */}
      <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
        {prefix}<CountUp end={value} duration={1.2} />
        {suffix && <span className="text-sm font-semibold ml-0.5" style={{ color: 'var(--text-secondary)' }}>{suffix}</span>}
      </p>

      {/* Subtitle */}
      {subtitle && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}

      {/* Growth badge */}
      {growth !== undefined && (
        <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(growth)}% vs yesterday
        </div>
      )}
    </motion.div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
