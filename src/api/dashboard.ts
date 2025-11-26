import { Router } from 'express';
import { getPool } from '../database/connection';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const dashboardRouter = Router();

// Enable authentication for all routes
dashboardRouter.use(authenticate);

/**
 * Get dashboard metrics
 * Returns high-level metrics for the dashboard overview
 */
dashboardRouter.get(
  '/metrics',
  asyncHandler(async (req: AuthRequest, res) => {
    const pool = getPool();
    const organizationId = req.user!.organization!.id;

    // Get deal metrics
    const dealMetrics = await pool.query(
      `SELECT
        COUNT(*) as total_deals,
        SUM(CASE WHEN stage = 'closed_won' THEN 1 ELSE 0 END) as won_deals,
        SUM(CASE WHEN stage = 'closed_lost' THEN 1 ELSE 0 END) as lost_deals,
        SUM(CASE WHEN stage = 'closed_won' THEN amount ELSE 0 END) as total_value
      FROM public.crm_deals
      WHERE company_id = $1 AND deleted_at IS NULL`,
      [organizationId]
    );

    // Get active contacts count
    const contactMetrics = await pool.query(
      `SELECT COUNT(*) as active_contacts
      FROM public.crm_contacts
      WHERE crm_company_id = $1
        AND deleted_at IS NULL
        AND contact_status = 'active'`,
      [organizationId]
    );

    // Get active companies count
    const companyMetrics = await pool.query(
      `SELECT COUNT(*) as active_companies
      FROM public.crm_companies
      WHERE company_id = $1
        AND deleted_at IS NULL`,
      [organizationId]
    );

    // Get activities this week
    const activityMetrics = await pool.query(
      `SELECT COUNT(*) as activities_this_week
      FROM public.crm_activities
      WHERE company_id = $1
        AND created_at >= DATE_TRUNC('week', NOW())`,
      [organizationId]
    );

    // Calculate conversion rate (won deals / total closed deals)
    const totalDeals = parseInt(dealMetrics.rows[0].total_deals) || 0;
    const wonDeals = parseInt(dealMetrics.rows[0].won_deals) || 0;
    const lostDeals = parseInt(dealMetrics.rows[0].lost_deals) || 0;
    const totalClosed = wonDeals + lostDeals;
    const conversionRate = totalClosed > 0 ? (wonDeals / totalClosed) * 100 : 0;

    res.json({
      totalDeals,
      totalValue: parseFloat(dealMetrics.rows[0].total_value) || 0,
      wonDeals,
      lostDeals,
      activeContacts: parseInt(contactMetrics.rows[0].active_contacts) || 0,
      activeCompanies: parseInt(companyMetrics.rows[0].active_companies) || 0,
      activitiesThisWeek: parseInt(activityMetrics.rows[0].activities_this_week) || 0,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    });
  })
);
