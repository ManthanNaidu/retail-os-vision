import { Sale, Product } from '@/types';
import { AnalyticsEngine } from './analyticsEngine';

export interface SalesForecast {
  nextDayPredictedRevenue: number;
  nextWeekPredictedRevenue: number;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface InventoryForecast {
  product: Product;
  currentStock: number;
  dailyRunRate: number; // units sold per day
  daysUntilStockout: number; // DIO (Days Inventory Outstanding)
  suggestedReorderQty: number;
}

export class ForecastingEngine {
  /**
   * Predicts future sales based on historical 30-day moving average and 7-day seasonality.
   */
  static forecastSales(sales: Sale[]): SalesForecast {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const last30DaysSales = AnalyticsEngine.filterSalesByDate(sales, thirtyDaysAgo, today);
    const metrics30 = AnalyticsEngine.calculateMetrics(last30DaysSales);
    const avgDailyRevenue30 = metrics30.totalRevenue / 30;

    // Calculate recent 7 day trend for more immediate weighting
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const last7DaysSales = AnalyticsEngine.filterSalesByDate(sales, sevenDaysAgo, today);
    const metrics7 = AnalyticsEngine.calculateMetrics(last7DaysSales);
    const avgDailyRevenue7 = metrics7.totalRevenue / 7;

    // Blend: 60% recent week trend, 40% 30-day history
    const nextDayPredictedRevenue = (avgDailyRevenue7 * 0.6) + (avgDailyRevenue30 * 0.4);
    
    let confidence: 'High' | 'Medium' | 'Low' = 'Low';
    if (sales.length > 50) confidence = 'Medium';
    if (sales.length > 150) confidence = 'High';

    return {
      nextDayPredictedRevenue: Math.round(nextDayPredictedRevenue),
      nextWeekPredictedRevenue: Math.round(nextDayPredictedRevenue * 7),
      confidence
    };
  }

  /**
   * Forecasts inventory depletion (Days Inventory Outstanding)
   */
  static forecastInventory(products: Product[], sales: Sale[]): InventoryForecast[] {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const recentSales = AnalyticsEngine.filterSalesByDate(sales, thirtyDaysAgo, today);
    
    // Calculate units sold in last 30 days per product
    const unitsSoldMap = new Map<string, number>();
    recentSales.forEach(sale => {
      (sale.items || []).forEach(item => {
        const current = unitsSoldMap.get(item.productId) || 0;
        unitsSoldMap.set(item.productId, current + item.quantity);
      });
    });

    const forecasts: InventoryForecast[] = [];

    products.forEach(product => {
      const unitsSold30Days = unitsSoldMap.get(product.id) || 0;
      const dailyRunRate = unitsSold30Days / 30;
      
      let daysUntilStockout = 999; // Infinite
      if (dailyRunRate > 0) {
        daysUntilStockout = Math.floor(product.stock / dailyRunRate);
      } else if (product.stock <= 0) {
        daysUntilStockout = 0;
      }

      // Reorder quantity: Enough to cover 30 days of sales + safety stock (20%)
      // Minimum order should at least meet minStock requirements
      let suggestedReorderQty = Math.max(0, Math.ceil(dailyRunRate * 30 * 1.2) - product.stock);
      if (product.stock + suggestedReorderQty < product.minStock) {
          suggestedReorderQty = product.minStock - product.stock;
      }

      forecasts.push({
        product,
        currentStock: product.stock,
        dailyRunRate: Number(dailyRunRate.toFixed(2)),
        daysUntilStockout,
        suggestedReorderQty
      });
    });

    return forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  }
}
