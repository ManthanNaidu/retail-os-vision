import { Sale, Product, Customer } from '@/types';
import { AnalyticsEngine } from './analyticsEngine';
import { BIEngine } from './biEngine';

export interface HealthScoreResult {
  score: number; // 0-100
  financialScore: number; // out of 40
  inventoryScore: number; // out of 30
  customerScore: number; // out of 30
  insights: string[];
}

export class HealthScoreEngine {
  /**
   * Deterministically calculates a Business Health Score (0-100).
   * 40% Financial Health, 30% Inventory Health, 30% Customer Health
   */
  static calculateHealth(sales: Sale[], products: Product[], customers: Customer[]): HealthScoreResult {
    const insights: string[] = [];
    
    // 1. Financial Health (Max 40)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(thirtyDaysAgo);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30);

    const currentSales = AnalyticsEngine.filterSalesByDate(sales, thirtyDaysAgo, new Date());
    const previousSales = AnalyticsEngine.filterSalesByDate(sales, sixtyDaysAgo, thirtyDaysAgo);

    const currentMetrics = AnalyticsEngine.calculateMetrics(currentSales, products);
    const previousMetrics = AnalyticsEngine.calculateMetrics(previousSales, products);

    let financialScore = 20; // Base score

    if (previousMetrics.totalRevenue > 0) {
      const revenueGrowth = (currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue;
      if (revenueGrowth > 0.1) financialScore += 10;
      else if (revenueGrowth > 0) financialScore += 5;
      else if (revenueGrowth < -0.1) financialScore -= 10;
      
      if (revenueGrowth < 0) {
        insights.push(`Revenue declined by ${Math.abs(Math.round(revenueGrowth * 100))}% over the last 30 days.`);
      }
    }

    if (currentMetrics.grossMarginPercent > 20) financialScore += 10;
    else if (currentMetrics.grossMarginPercent < 10) financialScore -= 5;
    
    financialScore = Math.max(0, Math.min(40, financialScore));

    // 2. Inventory Health (Max 30)
    let inventoryScore = 30;
    const deadStock = BIEngine.identifyDeadStock(products, sales, 30);
    const deadStockRatio = products.length > 0 ? deadStock.length / products.length : 0;
    
    if (deadStockRatio > 0.2) {
      inventoryScore -= 10;
      insights.push(`High dead stock: ${Math.round(deadStockRatio * 100)}% of your products haven't sold in 30 days.`);
    }

    const stockouts = products.filter(p => p.stock <= 0).length;
    if (stockouts > 0) {
      inventoryScore -= Math.min(10, stockouts * 2);
      insights.push(`${stockouts} items are currently out of stock, causing lost sales.`);
    }
    
    inventoryScore = Math.max(0, Math.min(30, inventoryScore));

    // 3. Customer Health (Max 30)
    let customerScore = 30;
    const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);
    const creditToRevenueRatio = currentMetrics.totalRevenue > 0 ? totalCredit / currentMetrics.totalRevenue : 0;

    if (creditToRevenueRatio > 0.5) {
      customerScore -= 15;
      insights.push(`Warning: Outstanding credit is very high (${Math.round(creditToRevenueRatio * 100)}% of monthly revenue).`);
    } else if (creditToRevenueRatio > 0.2) {
      customerScore -= 5;
    }

    const inactiveCustomers = customers.filter(c => c.segment === 'Inactive').length;
    if (customers.length > 0 && (inactiveCustomers > customers.length * 0.3)) {
      customerScore -= 10;
      insights.push(`Over 30% of your customers are inactive. Consider a retention campaign.`);
    }

    customerScore = Math.max(0, Math.min(30, customerScore));

    const totalScore = financialScore + inventoryScore + customerScore;

    if (totalScore >= 80 && insights.length === 0) {
      insights.push("Your business is extremely healthy across all metrics.");
    }

    return {
      score: Math.round(totalScore),
      financialScore: Math.round(financialScore),
      inventoryScore: Math.round(inventoryScore),
      customerScore: Math.round(customerScore),
      insights
    };
  }
}
