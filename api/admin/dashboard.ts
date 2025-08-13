import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface DashboardMetrics {
  realtime: {
    clicksToday: number;
    conversionsToday: number;
    revenueToday: number;
    activePartners: string[];
  };
  partners: Array<{
    id: string;
    name: string;
    clicksLast30d: number;
    conversionsLast30d: number;
    conversionRate: number;
    revenueLast30d: number;
    lastConversion?: string;
  }>;
  recent: {
    clicks: Array<{
      clickId: string;
      partner: string;
      timestamp: number;
      source: any;
    }>;
    conversions: Array<{
      clickId: string;
      partner: string;
      value: number;
      timestamp: number;
    }>;
  };
}

/**
 * Get dashboard metrics from Vercel KV
 */
async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's stats
  const clicksToday = await kv.get(`clicks:daily:${today}:*`) || 0;
  const conversionsToday = await kv.get(`conversions:daily:${today}:*`) || 0;
  const revenueToday = await kv.get(`revenue:daily:${today}:*`) || 0;
  
  // Get recent clicks (last 100)
  const recentClickKeys = await kv.keys('click:dep_*');
  const recentClicks = [];
  
  for (const key of recentClickKeys.slice(-100)) {
    const clickData = await kv.get(key);
    if (clickData) {
      recentClicks.push({
        clickId: (clickData as any).click_id,
        partner: (clickData as any).partner_id,
        timestamp: (clickData as any).timestamp,
        source: (clickData as any).source
      });
    }
  }
  
  // Get recent conversions
  const conversionKeys = await kv.keys('conversion:*');
  const recentConversions = [];
  
  for (const key of conversionKeys.slice(-50)) {
    const conversionData = await kv.get(key);
    if (conversionData) {
      recentConversions.push({
        clickId: (conversionData as any).click_id,
        partner: (conversionData as any).partner_id,
        value: (conversionData as any).contract_value || 0,
        timestamp: (conversionData as any).conversion_timestamp
      });
    }
  }
  
  // Calculate partner performance
  const partnerStats = new Map();
  
  // Process clicks
  recentClicks.forEach(click => {
    if (!partnerStats.has(click.partner)) {
      partnerStats.set(click.partner, {
        id: click.partner,
        name: click.partner,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        lastConversion: null
      });
    }
    partnerStats.get(click.partner).clicks++;
  });
  
  // Process conversions
  recentConversions.forEach(conversion => {
    if (partnerStats.has(conversion.partner)) {
      const partner = partnerStats.get(conversion.partner);
      partner.conversions++;
      partner.revenue += conversion.value;
      partner.lastConversion = new Date(conversion.timestamp).toISOString();
    }
  });
  
  // Convert to array and calculate rates
  const partners = Array.from(partnerStats.values()).map(partner => ({
    ...partner,
    clicksLast30d: partner.clicks,
    conversionsLast30d: partner.conversions,
    conversionRate: partner.clicks > 0 ? (partner.conversions / partner.clicks) * 100 : 0,
    revenueLast30d: partner.revenue
  }));

  return {
    realtime: {
      clicksToday: typeof clicksToday === 'number' ? clicksToday : 0,
      conversionsToday: typeof conversionsToday === 'number' ? conversionsToday : 0,
      revenueToday: typeof revenueToday === 'number' ? revenueToday : 0,
      activePartners: partners.map(p => p.name)
    },
    partners,
    recent: {
      clicks: recentClicks.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50),
      conversions: recentConversions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20)
    }
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth check via header
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;
  
  if (!adminSecret) {
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const metrics = await getDashboardMetrics();
    
    return res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch metrics'
    });
  }
}