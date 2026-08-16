import { Sale, Product } from '@/types';

export interface AnalyticsMetrics {
  totalRevenue: number;
  netRevenue: number;
  totalProfit: number;
  grossMarginPercent: number;
  cogs: number;
  totalItemsSold: number;
  avgOrderValue: number;
  totalOrders: number;
  totalGstCollected: number;
}

export class AnalyticsEngine {
  /**
   * Deterministically calculates core business metrics for a given set of sales.
   * This serves as the single source of truth for financial calculations.
   * 
   * @param sales - Array of sales to analyze
   * @param productsCatalog - Optional catalog to lookup purchase prices if missing from historical sale items (e.g. mock data)
   */
  static calculateMetrics(sales: Sale[], productsCatalog?: Product[]): AnalyticsMetrics {
    if (!sales || sales.length === 0) {
      return {
        totalRevenue: 0,
        netRevenue: 0,
        totalProfit: 0,
        grossMarginPercent: 0,
        cogs: 0,
        totalItemsSold: 0,
        avgOrderValue: 0,
        totalOrders: 0,
        totalGstCollected: 0,
      };
    }

    let totalRevenue = 0;
    let totalCogs = 0;
    let totalItemsSold = 0;
    let totalGstCollected = 0;

    // Create a lookup map for faster access if catalog is provided
    const productMap = new Map<string, Product>();
    if (productsCatalog) {
      productsCatalog.forEach(p => productMap.set(p.id, p));
    }

    sales.forEach(sale => {
      totalRevenue += (sale.total || 0);
      totalGstCollected += (sale.gstAmount || 0);

      if (sale.items) {
        sale.items.forEach(item => {
          totalItemsSold += (item.quantity || 0);
          
          let costPrice = item.purchasePrice;
          
          // Fallback to product catalog if purchasePrice wasn't saved on the sale item (legacy/mock data support)
          if (typeof costPrice !== 'number' && productMap.has(item.productId)) {
            costPrice = productMap.get(item.productId)?.purchasePrice;
          }
          
          // If still undefined, fallback to an estimated 70% of selling price to prevent infinite margins
          if (typeof costPrice !== 'number') {
             costPrice = item.sellingPrice * 0.7; 
          }

          totalCogs += (costPrice * item.quantity);
        });
      }
    });

    // Net Revenue excludes GST
    const netRevenue = totalRevenue - totalGstCollected;
    
    // Gross Profit = Net Revenue - Cost of Goods Sold
    const totalProfit = netRevenue - totalCogs;
    
    const grossMarginPercent = netRevenue > 0 ? (totalProfit / netRevenue) * 100 : 0;
    const avgOrderValue = totalRevenue / sales.length;

    return {
      totalRevenue,
      netRevenue,
      totalProfit,
      grossMarginPercent,
      cogs: totalCogs,
      totalItemsSold,
      avgOrderValue,
      totalOrders: sales.length,
      totalGstCollected,
    };
  }

  /**
   * Filters sales by a specific date range.
   */
  static filterSalesByDate(sales: Sale[], startDate: Date, endDate: Date): Sale[] {
    return sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }
}
