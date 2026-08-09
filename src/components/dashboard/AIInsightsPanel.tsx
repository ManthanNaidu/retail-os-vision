'use client';

import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, ChevronRight,
  TrendingUp, Package, Tag, User, BarChart3, AlertTriangle
} from 'lucide-react';
import { AIInsight } from '@/types';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  profit: TrendingUp,
  pricing: Tag,
  inventory: Package,
  customer: User,
  forecast: BarChart3,
};

const priorityColors = {
  high:   { border: '#fecaca', bg: '#fff5f5',  dot: '#dc2626', label: 'Urgent' },
  medium: { border: '#fde68a', bg: '#fffbeb',  dot: '#d97706', label: 'This Week' },
  low:    { border: '#bfdbfe', bg: '#eff6ff',  dot: '#2563eb', label: 'Suggestion' },
};

export function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>AI Profit Engine</h2>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Personalized for your store</p>
          </div>
        </div>
        <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          className="text-[10px] font-semibold px-2 py-1 rounded-full text-blue-600 bg-blue-50">
          ● LIVE
        </motion.span>
      </div>

      {/* Insights */}
      <div className="space-y-2.5">
        {insights.map((insight, i) => {
          const colors = priorityColors[insight.priority];
          const Icon = CATEGORY_ICONS[insight.category] || AlertTriangle;
          return (
            <motion.div key={insight.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm"
              style={{ borderColor: colors.border, background: colors.bg }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: colors.border }}>
                <Icon size={15} style={{ color: colors.dot }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {insight.title}
                  </p>
                  <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: colors.dot }}>
                    {colors.label}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {insight.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  {insight.expectedImpact && (
                    <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {insight.expectedImpact}
                    </span>
                  )}
                  <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                    {insight.action} <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
        View All AI Insights <ArrowRight size={15} />
      </motion.button>
    </motion.div>
  );
}
