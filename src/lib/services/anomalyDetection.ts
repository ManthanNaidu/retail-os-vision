import { Sale, Customer } from '@/types';
import { AnalyticsEngine } from './analyticsEngine';

export interface Anomaly {
  id: string;
  type: 'negative' | 'positive' | 'warning';
  title: string;
  description: string;
}

export class AnomalyDetectionEngine {
  /**
   * Detects statistical anomalies in the business data.
   */
  static detectAnomalies(sales: Sale[], customers: Customer[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // 1. Sales Anomaly (Sudden drop)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const todaySales = AnalyticsEngine.filterSalesByDate(sales, today, new Date());
    const yesterdaySales = AnalyticsEngine.filterSalesByDate(sales, yesterday, new Date(today.getTime() - 1));

    const todayRev = AnalyticsEngine.calculateMetrics(todaySales).totalRevenue;
    const yestRev = AnalyticsEngine.calculateMetrics(yesterdaySales).totalRevenue;

    // Check if it's late in the day and sales are still abnormally low
    if (yestRev > 0 && new Date().getHours() > 17) {
      const drop = (yestRev - todayRev) / yestRev;
      if (drop > 0.4) {
        anomalies.push({
          id: `anomaly-sales-drop-${Date.now()}`,
          type: 'negative',
          title: 'Unusual Sales Drop',
          description: `Today's revenue (₹${todayRev}) is ${Math.round(drop * 100)}% lower than yesterday. Consider running an evening promotion.`
        });
      }
    }

    // 2. Credit Anomaly (Spike in credit)
    const highCreditCustomers = customers.filter(c => c.creditBalance > 5000);
    if (highCreditCustomers.length > 3) {
       anomalies.push({
         id: `anomaly-credit-${Date.now()}`,
         type: 'warning',
         title: 'High Credit Exposure',
         description: `${highCreditCustomers.length} customers have balances over ₹5,000. Recommend pausing credit lines for these accounts.`
       });
    }

    return anomalies;
  }
}
