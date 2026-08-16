import { Sale, Product, Customer } from '@/types';
import { AnalyticsEngine, AnalyticsMetrics } from './analyticsEngine';

export interface CategoryPerformance {
  name: string;
  revenue: number;
  qty: number;
}

export interface DeadStockItem {
  product: Product;
  daysSinceLastSale: number;
}

export class BIEngine {
  /**
   * Generates category performance data sorted by revenue.
   */
  static getCategoryPerformance(sales: Sale[], products: Product[]): CategoryPerformance[] {
    const map: Record<string, CategoryPerformance> = {};
    const productMap = new Map<string, Product>();
    products.forEach(p => productMap.set(p.id, p));

    sales.forEach(sale => {
      (sale.items || []).forEach(item => {
        const product = productMap.get(item.productId);
        const cat = product?.category || 'Others';
        
        if (!map[cat]) {
          map[cat] = { name: cat, revenue: 0, qty: 0 };
        }
        map[cat].revenue += item.total;
        map[cat].qty += item.quantity;
      });
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Identifies dead stock (items with stock but no recent sales).
   */
  static identifyDeadStock(products: Product[], sales: Sale[], daysThreshold: number = 30): DeadStockItem[] {
    const lastSaleDateMap = new Map<string, Date>();
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      (sale.items || []).forEach(item => {
        const existing = lastSaleDateMap.get(item.productId);
        if (!existing || saleDate > existing) {
          lastSaleDateMap.set(item.productId, saleDate);
        }
      });
    });

    const now = new Date();
    const deadStock: DeadStockItem[] = [];

    products.forEach(product => {
      if (product.stock <= 0) return;
      
      const lastSale = lastSaleDateMap.get(product.id);
      let daysSinceLastSale = -1;
      
      if (lastSale) {
        daysSinceLastSale = Math.floor((now.getTime() - lastSale.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        const created = new Date(product.createdAt || now.toISOString());
        daysSinceLastSale = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (daysSinceLastSale >= daysThreshold) {
        deadStock.push({ product, daysSinceLastSale });
      }
    });

    return deadStock.sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale);
  }

  /**
   * Generates deterministic diagnostic insights comparing two periods.
   */
  static comparePeriods(currentMetrics: AnalyticsMetrics, previousMetrics: AnalyticsMetrics) {
    const revenueGrowth = previousMetrics.totalRevenue > 0 
      ? ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100 
      : 0;
      
    const profitGrowth = previousMetrics.totalProfit > 0
      ? ((currentMetrics.totalProfit - previousMetrics.totalProfit) / previousMetrics.totalProfit) * 100
      : 0;

    const marginDiff = currentMetrics.grossMarginPercent - previousMetrics.grossMarginPercent;

    return {
      revenueGrowth,
      profitGrowth,
      marginDiff,
      isHealthy: revenueGrowth >= 0 && profitGrowth >= 0,
      diagnosticMessage: marginDiff < 0 
        ? "Profit margins compressed, possibly due to discounts or increased COGS." 
        : "Profit margins are stable or growing."
    };
  }
}
