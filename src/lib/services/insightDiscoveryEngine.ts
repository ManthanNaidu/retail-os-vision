import { Sale, Product, AIInsight } from '@/types';
import { AnalyticsEngine } from './analyticsEngine';

export class InsightDiscoveryEngine {
  
  static detectRecords(sales: Sale[]): AIInsight | null {
    if (sales.length < 5) return null; // Need some data

    // Group sales by day
    const dailyRevenue: Record<string, number> = {};
    sales.forEach(s => {
      const day = new Date(s.createdAt).toISOString().split('T')[0];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + s.total;
    });

    const sortedDays = Object.entries(dailyRevenue).sort((a, b) => b[1] - a[1]);
    const bestDay = sortedDays[0];
    const today = new Date().toISOString().split('T')[0];

    // If today is the best day ever, trigger a record!
    if (bestDay[0] === today && bestDay[1] > 0 && sortedDays.length > 2) {
      return {
        id: `record-revenue-${today}`,
        category: 'record',
        priority: 'high',
        title: 'NEW RECORD',
        description: `Today is your strongest day on record. Revenue: ₹${bestDay[1].toLocaleString()}`,
        action: 'Celebrate with your team!',
        icon: 'Trophy'
      };
    }
    return null;
  }

  static detectProductCombinations(sales: Sale[]): AIInsight | null {
    if (sales.length < 20) return null; // Need sufficient data for confidence
    
    // Naive association rule mining
    const pairs: Record<string, number> = {};
    sales.forEach(sale => {
      for (let i = 0; i < sale.items.length; i++) {
        for (let j = i + 1; j < sale.items.length; j++) {
          const item1 = sale.items[i].productName;
          const item2 = sale.items[j].productName;
          const pairKey = [item1, item2].sort().join(' + ');
          pairs[pairKey] = (pairs[pairKey] || 0) + 1;
        }
      }
    });

    const sortedPairs = Object.entries(pairs).sort((a, b) => b[1] - a[1]);
    if (sortedPairs.length > 0 && sortedPairs[0][1] >= 3) {
      const bestPair = sortedPairs[0];
      const items = bestPair[0].split(' + ');
      
      // Calculate what % of baskets with Item1 also have Item2
      const item1Sales = sales.filter(s => s.items.some(i => i.productName === items[0])).length;
      const coOccurrence = Math.round((bestPair[1] / item1Sales) * 100);

      if (coOccurrence >= 20) {
        return {
          id: `combo-${items[0]}-${items[1]}`,
          category: 'discovery',
          priority: 'low',
          title: 'Interesting pattern',
          description: `${items[0]} and ${items[1]} are frequently purchased together (in ${coOccurrence}% of ${items[0]} sales).`,
          action: 'Consider placing them closer together on the shelf.',
          icon: 'Lightbulb'
        };
      }
    }
    return null;
  }

  static getQuietProfitChampion(sales: Sale[], products: Product[]): AIInsight | null {
    if (sales.length === 0 || products.length === 0) return null;
    
    // Find category with highest margin
    const categoryStats: Record<string, { rev: number, profit: number }> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const cat = prod.category;
          const profit = item.total - ((prod.purchasePrice || 0) * item.quantity);
          if (!categoryStats[cat]) categoryStats[cat] = { rev: 0, profit: 0 };
          categoryStats[cat].rev += item.total;
          categoryStats[cat].profit += profit;
        }
      });
    });

    let bestCat = '';
    let bestMargin = 0;
    Object.entries(categoryStats).forEach(([cat, stats]) => {
      if (stats.rev > 500) { // minimum volume threshold
        const margin = (stats.profit / stats.rev) * 100;
        if (margin > bestMargin) {
          bestMargin = margin;
          bestCat = cat;
        }
      }
    });

    if (bestCat && bestMargin > 30) {
      return {
        id: `champion-${bestCat}`,
        category: 'discovery',
        priority: 'low',
        title: 'Your quiet profit champion',
        description: `The ${bestCat} category has your highest average margin at ${Math.round(bestMargin)}%.`,
        action: 'Consider expanding your inventory in this category.',
        icon: 'TrendingUp'
      };
    }
    return null;
  }
}
