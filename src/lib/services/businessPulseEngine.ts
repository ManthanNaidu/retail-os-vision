import { AIInsight, CommunicationStyle, InsightTone, Sale, Product, Customer } from '@/types';
import { AnalyticsEngine } from './analyticsEngine';

export class MessagePersonalityEngine {
  static selectTone(priority: 'high' | 'medium' | 'low', userPref: CommunicationStyle): InsightTone {
    if (userPref === 'Professional') return 'PROFESSIONAL';
    
    if (priority === 'high') {
      return userPref === 'Playful' ? 'URGENT' : 'PROFESSIONAL';
    }

    if (priority === 'medium') {
      return userPref === 'Playful' ? 'SMART_WITTY' : 'ANALYTICAL';
    }

    // Low priority
    if (userPref === 'Friendly' || userPref === 'Balanced') return 'FRIENDLY';
    if (userPref === 'Playful') return 'PLAYFUL';
    
    return 'CALM';
  }
}

export class FactValidationService {
  /**
   * Prevents LLM hallucinations by injecting verified numbers into text templates.
   */
  static hydrateTemplate(template: string, vars: Record<string, string | number>): string {
    let hydrated = template;
    for (const [key, value] of Object.entries(vars)) {
      hydrated = hydrated.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return hydrated;
  }
}

export class BusinessPulseEngine {
  /**
   * Generates a 2-hour change summary without hallucinating numbers.
   */
  static generateTwoHourSummary(
    sales: Sale[], 
    products: Product[],
    currentTime: Date = new Date()
  ): { title: string, message: string, hasMeaningfulChange: boolean } | null {
    
    const twoHoursAgo = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(currentTime.getTime() - 4 * 60 * 60 * 1000);

    const currentWindowSales = sales.filter(s => {
      const d = new Date(s.createdAt);
      return d >= twoHoursAgo && d <= currentTime;
    });

    const previousWindowSales = sales.filter(s => {
      const d = new Date(s.createdAt);
      return d >= fourHoursAgo && d < twoHoursAgo;
    });

    if (currentWindowSales.length === 0) {
      return null; // No meaningful change
    }

    const currentMetrics = AnalyticsEngine.calculateMetrics(currentWindowSales, products);
    const prevMetrics = AnalyticsEngine.calculateMetrics(previousWindowSales, products);

    const revDiff = currentMetrics.totalRevenue - prevMetrics.totalRevenue;
    
    let title = "Midday Pulse";
    const hour = currentTime.getHours();
    if (hour < 12) title = "Morning Check";
    else if (hour >= 17) title = "Evening Check";

    const diffStr = revDiff > 0 ? `+₹${revDiff}` : `-₹${Math.abs(revDiff)}`;
    const msg = `Since the last pulse:
Revenue ${diffStr}
${currentMetrics.totalOrders} new bills generated.`;

    return {
      title,
      message: msg,
      hasMeaningfulChange: true
    };
  }

  /**
   * Given a raw insight, generates a personality-driven presentation.
   * In a full implementation, this calls an LLM with instructions to output a template.
   * For immediate deterministic offline use, it maps fallback templates.
   */
  static presentInsight(insight: AIInsight, userTone: CommunicationStyle): { title: string, body: string, tone: InsightTone } {
    const tone = MessagePersonalityEngine.selectTone(insight.priority, userTone);

    let title = insight.title;
    let body = insight.description;

    if (tone === 'SMART_WITTY' || tone === 'PLAYFUL') {
      if (insight.category === 'inventory') {
        title = "Shelf getting nervous 😅";
        body = `Your ${insight.title.split(' ')[1] || 'product'} is having a very busy day. ${insight.description}`;
      } else if (insight.category === 'record') {
        title = "Someone's having a good day! 🎉";
      } else if (insight.category === 'customer') {
        title = "Money sitting on the table 💸";
      }
    } else if (tone === 'URGENT') {
      title = "Action Required 🚨";
    }

    return {
      title,
      body,
      tone
    };
  }
}
