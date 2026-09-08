import AuditLog from '../models/AuditLog.js';

export class AuditService {
  static async record({ actorUserId = null, action, entityType = '', entityId = '', details = {}, req, session }) {
    return AuditLog.create([{
      actorUserId,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req?.ip || ''
    }], session ? { session } : undefined).then(([log]) => log);
  }
}