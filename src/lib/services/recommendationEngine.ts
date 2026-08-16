import { Sale, Product, Customer } from '@/types';
import { AnalyticsEngine } from './analyticsEngine';
import { BIEngine } from './biEngine';
import { ForecastingEngine } from './forecastingEngine';

export interface StructuredInsight {
  id: string;
  category: 'inventory' | 'customer' | 'profit' | 'anomaly';
  what: string;
  why: string;
  evidence: string;
  action: string;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
}

export class RecommendationEngine {
  /**
   * Generates structured, deterministic business insights adhering to:
   * WHAT -> WHY -> EVIDENCE -> ACTION -> IMPACT
   */
  static generateInsights(sales: Sale[], products: Product[], customers: Customer[]): StructuredInsight[] {
    const insights: StructuredInsight[] = [];
    
    // 1. Inventory Insights (Stockouts)
    const inventoryForecast = ForecastingEngine.forecastInventory(products, sales);
    
    // Find products running out soon (in next 3 days)
    const criticalStock = inventoryForecast.filter(f => f.daysUntilStockout <= 3 && f.dailyRunRate > 0);
    
    criticalStock.slice(0, 2).forEach(f => {
      insights.push({
        id: `rec-stock-${f.product.id}`,
        category: 'inventory',
        priority: 'high',
        what: `Reorder ${f.product.name} immediately.`,
        why: `Current stock (${f.currentStock}) will run out in ${f.daysUntilStockout} days.`,
        evidence: `Daily run rate is ${f.dailyRunRate} units/day based on last 30 days.`,
        action: `Create PO for ${f.suggestedReorderQty} units.`,
        expectedImpact: `Prevent ₹${Math.round(f.dailyRunRate * f.product.sellingPrice * 7)} in lost sales over next week.`
      });
    });

    // 2. Dead Stock Insights
    const deadStock = BIEngine.identifyDeadStock(products, sales, 45); // 45 days no sale
    if (deadStock.length > 0) {
      const item = deadStock[0];
      insights.push({
        id: `rec-dead-${item.product.id}`,
        category: 'inventory',
        priority: 'medium',
        what: `Liquidate ${item.product.name} stock.`,
        why: `It has not sold in ${item.daysSinceLastSale} days, tying up working capital.`,
        evidence: `You hold ${item.product.stock} units (₹${Math.round(item.product.stock * item.product.purchasePrice)} cost value).`,
        action: `Apply a 20% discount or bundle with a high-moving item.`,
        expectedImpact: `Recover ₹${Math.round(item.product.stock * item.product.purchasePrice * 0.8)} cash.`
      });
    }

    // 3. Customer Recovery Insights
    const highCreditCustomers = [...customers].sort((a, b) => b.creditBalance - a.creditBalance);
    if (highCreditCustomers.length > 0 && highCreditCustomers[0].creditBalance > 2000) {
      const topDebtor = highCreditCustomers[0];
      insights.push({
        id: `rec-credit-${topDebtor.id}`,
        category: 'customer',
        priority: 'high',
        what: `Recover credit from ${topDebtor.name}.`,
        why: `Outstanding balance is ₹${topDebtor.creditBalance}, which hurts cash flow.`,
        evidence: `Customer is a ${topDebtor.segment} segment customer with high outstanding limit.`,
        action: `Send a polite WhatsApp payment link today.`,
        expectedImpact: `Improve cash balance by ₹${topDebtor.creditBalance}.`
      });
    }

    // 4. Profit Optimization
    // If a product is selling very fast, suggest a small price bump.
    if (criticalStock.length > 0) {
       const fastMover = criticalStock[0];
       insights.push({
        id: `rec-price-${fastMover.product.id}`,
        category: 'profit',
        priority: 'medium',
        what: `Increase price of ${fastMover.product.name} by 5%.`,
        why: `It is selling extremely fast indicating high demand.`,
        evidence: `Run rate is ${fastMover.dailyRunRate} units/day.`,
        action: `Update selling price to ₹${Math.round(fastMover.product.sellingPrice * 1.05)}.`,
        expectedImpact: `+₹${Math.round(fastMover.dailyRunRate * 30 * (fastMover.product.sellingPrice * 0.05))} profit/month.`
       });
    }

    return insights;
  }
}
