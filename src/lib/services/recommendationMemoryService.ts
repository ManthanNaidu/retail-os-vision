import { AIInsight, RecommendationOutcome, EscalationStatus } from '@/types';

export class RecommendationMemoryService {
  /**
   * Checks if a new insight is semantically identical to a recent one.
   * Based on the user's rule: "Do NOT rely only on exact string matching. Treat them as duplicates if they are based on the same underlying condition."
   */
  static isDuplicate(newInsight: AIInsight, memory: RecommendationOutcome[], cooldownHours: number = 24): boolean {
    const cutoffTime = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);

    return memory.some(mem => {
      if (new Date(mem.shownAt) < cutoffTime) return false;

      // Same underlying condition check
      // For example, if it's the same category and the exact same underlying entity (e.g., product ID in the insight ID)
      if (mem.category === newInsight.category && mem.recommendationId === newInsight.id) {
        return true;
      }

      return false;
    });
  }

  /**
   * Identifies if this is an escalation of a previously unresolved recommendation.
   */
  static getEscalationState(insightId: string, memory: RecommendationOutcome[]): EscalationStatus {
    const pastInstances = memory.filter(m => m.recommendationId === insightId).sort((a, b) => new Date(b.shownAt).getTime() - new Date(a.shownAt).getTime());

    if (pastInstances.length === 0) return 'UNRESOLVED';
    
    const latest = pastInstances[0];
    if (latest.status === 'ACTIONED' || latest.status === 'RESOLVED') return 'RESOLVED';
    
    // If it's been shown before and not resolved, it's escalating
    return 'ESCALATING';
  }

  /**
   * Suppress notification if conditions aren't met.
   */
  static shouldSuppress(insight: AIInsight, memory: RecommendationOutcome[]): boolean {
    // Suppress if it's low confidence/info and it's quiet hours (e.g. 11 PM to 6 AM)
    const hour = new Date().getHours();
    if (insight.priority === 'low' && (hour >= 23 || hour < 6)) return true;

    if (this.isDuplicate(insight, memory, 12)) return true; // Suppress identical conditions within 12 hours

    return false;
  }
}
