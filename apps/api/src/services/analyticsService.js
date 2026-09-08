import { AdminService } from './adminService.js';

export class AnalyticsService {
  constructor() {
    this.adminService = new AdminService();
  }

  async getDashboardSummary() {
    return await this.adminService.getAdminDashboard();
  }
}
