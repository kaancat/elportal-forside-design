import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

/**
 * Improved dashboard endpoint with session token authentication
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const sessionToken = authHeader.replace('Bearer ', '');
    
    // Validate session token
    const sessionData = await kv.get(`admin_session:${sessionToken}`);
    
    if (!sessionData || !(sessionData as any).authenticated) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Check if session is still valid
    const session = sessionData as any;
    if (Date.now() > session.expiresAt) {
      await kv.del(`admin_session:${sessionToken}`);
      return res.status(401).json({ error: 'Session expired' });
    }

    // Get dashboard metrics
    const metrics = await getDashboardMetrics();
    
    return res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}

/**
 * Get dashboard metrics from KV storage
 */
async function getDashboardMetrics() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all click keys
    const clickKeys = await kv.keys('click:dep_*');
    const recentClicks: Array<{
      clickId: string;
      partner: string;
      timestamp: string;
      source: string;
    }> = [];
    
    // Process clicks in batches to avoid timeout
    for (const key of clickKeys.slice(-100)) {
      try {
        const clickData = await kv.get(key);
        if (clickData) {
          recentClicks.push({
            clickId: (clickData as any).click_id,
            partner: (clickData as any).partner_id,
            timestamp: (clickData as any).timestamp,
            source: (clickData as any).source
          });
        }
      } catch (error) {
        console.error('Error processing click:', key, error);
      }
    }
    
    // Get conversion keys
    const conversionKeys = await kv.keys('conversion:*');
    const recentConversions: Array<{
      clickId: string;
      partner: string;
      value: number;
      timestamp: string;
    }> = [];
    
    for (const key of conversionKeys.slice(-50)) {
      try {
        const conversionData = await kv.get(key);
        if (conversionData) {
          recentConversions.push({
            clickId: (conversionData as any).click_id,
            partner: (conversionData as any).partner_id,
            value: (conversionData as any).contract_value || 0,
            timestamp: (conversionData as any).conversion_timestamp || (conversionData as any).timestamp
          });
        }
      } catch (error) {
        console.error('Error processing conversion:', key, error);
      }
    }
    
    // Calculate partner stats
    const partnerStats = new Map();
    
    recentClicks.forEach(click => {
      if (!partnerStats.has(click.partner)) {
        partnerStats.set(click.partner, {
          id: click.partner,
          name: click.partner,
          clicks: 0,
          conversions: 0,
          revenue: 0
        });
      }
      partnerStats.get(click.partner).clicks++;
    });
    
    recentConversions.forEach(conversion => {
      if (partnerStats.has(conversion.partner)) {
        const partner = partnerStats.get(conversion.partner);
        partner.conversions++;
        partner.revenue += conversion.value;
      }
    });
    
    const partners = Array.from(partnerStats.values()).map(partner => ({
      ...partner,
      clicksLast30d: partner.clicks,
      conversionsLast30d: partner.conversions,
      conversionRate: partner.clicks > 0 ? (partner.conversions / partner.clicks) * 100 : 0,
      revenueLast30d: partner.revenue
    }));

    return {
      realtime: {
        clicksToday: recentClicks.filter(c => 
          new Date(c.timestamp).toDateString() === new Date().toDateString()
        ).length,
        conversionsToday: recentConversions.filter(c => 
          new Date(c.timestamp).toDateString() === new Date().toDateString()
        ).length,
        revenueToday: recentConversions
          .filter(c => new Date(c.timestamp).toDateString() === new Date().toDateString())
          .reduce((sum, c) => sum + c.value, 0),
        activePartners: Array.from(new Set(recentClicks.map(c => c.partner)))
      },
      partners,
      recent: {
        clicks: recentClicks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50),
        conversions: recentConversions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20)
      }
    };
  } catch (error) {
    console.error('Metrics calculation error:', error);
    return {
      realtime: { clicksToday: 0, conversionsToday: 0, revenueToday: 0, activePartners: [] },
      partners: [],
      recent: { clicks: [], conversions: [] }
    };
  }
}