import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  MousePointer, 
  DollarSign, 
  Users, 
  Download,
  RefreshCw,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface DashboardData {
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

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { logout } = useAdminAuth();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Use test admin secret (matches the API endpoint)
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer test123`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('da-DK');
  };

  const exportData = async (type: 'clicks' | 'conversions') => {
    if (!data) return;

    const csvData = type === 'clicks' 
      ? data.recent.clicks.map(click => ({
          click_id: click.clickId,
          partner: click.partner,
          timestamp: formatDateTime(click.timestamp),
          page: click.source?.page || '',
          component: click.source?.component || ''
        }))
      : data.recent.conversions.map(conv => ({
          click_id: conv.clickId,
          partner: conv.partner,
          value: conv.value,
          timestamp: formatDateTime(conv.timestamp)
        }));

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dinelportal-${type}-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DinElportal Admin</h1>
            <p className="text-sm text-gray-600">
              Revenue Tracking Dashboard
              {lastUpdated && (
                <span className="ml-2">
                  • Last updated: {lastUpdated.toLocaleTimeString('da-DK')}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchDashboardData}
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-800">
              {error} - Showing cached data
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clicks Today</p>
                  <p className="text-2xl font-bold">{data?.realtime.clicksToday || 0}</p>
                </div>
                <MousePointer className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversions Today</p>
                  <p className="text-2xl font-bold">{data?.realtime.conversionsToday || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                  <p className="text-2xl font-bold">{formatCurrency(data?.realtime.revenueToday || 0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Partners</p>
                  <p className="text-2xl font-bold">{data?.realtime.activePartners.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList>
            <TabsTrigger value="partners">Partner Performance</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
          </TabsList>

          {/* Partner Performance */}
          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <CardTitle>Partner Performance (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Last Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">
                          {partner.name}
                          {partner.name.toLowerCase().includes('vindstod') && (
                            <Badge className="ml-2 bg-green-100 text-green-800">Primary</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{partner.clicksLast30d}</TableCell>
                        <TableCell className="text-right">{partner.conversionsLast30d}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={partner.conversionRate > 5 ? "default" : "outline"}>
                            {partner.conversionRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(partner.revenueLast30d)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600">
                          {partner.lastConversion 
                            ? new Date(partner.lastConversion).toLocaleDateString('da-DK')
                            : 'Never'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {(!data?.partners || data.partners.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No partner data available yet. Start tracking some clicks!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity */}
          <TabsContent value="recent">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Clicks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {data?.recent.clicks.slice(0, 20).map((click) => (
                      <div key={click.clickId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{click.partner}</p>
                          <p className="text-xs text-gray-600">
                            {click.source?.component || 'unknown'} • {formatDateTime(click.timestamp)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {click.clickId.split('_')[1]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Conversions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {data?.recent.conversions.map((conversion) => (
                      <div key={conversion.clickId} className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{conversion.partner}</p>
                          <p className="text-xs text-gray-600">
                            {formatDateTime(conversion.timestamp)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(conversion.value)}</p>
                          <p className="text-xs text-gray-600">{conversion.clickId.split('_')[1]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Export */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>
                  Download tracking data for accounting and analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => exportData('clicks')}
                    className="h-16"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Export Clicks</div>
                      <div className="text-sm text-gray-600">Last 30 days</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => exportData('conversions')}
                    className="h-16"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Export Conversions</div>
                      <div className="text-sm text-gray-600">All time</div>
                    </div>
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Exported data contains click IDs and timestamps but no personal information. 
                    Safe for accounting and tax purposes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;