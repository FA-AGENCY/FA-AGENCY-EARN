import FraudEvent from '../models/FraudEvent.js';

const highRiskLevels = ['HIGH', 'CRITICAL'];

export class FraudService {
  static async record({ userId, type, riskLevel = 'LOW', description, evidence = {}, metadata = {}, session }) {
    return FraudEvent.create([{
      userId,
      eventType: type,
      riskLevel,
      status: 'OPEN',
      description,
      evidence,
      metadata,
      details: { evidence, metadata }
    }], session ? { session } : undefined).then(([event]) => event);
  }

  static async hasOpenHighRisk(userId) {
    return FraudEvent.exists({ userId, status: { $in: ['OPEN', 'REVIEWING'] }, riskLevel: { $in: highRiskLevels } });
  }

  static async countRecent(userId, type, since) {
    return FraudEvent.countDocuments({ userId, eventType: type, createdAt: { $gte: since } });
  }
}