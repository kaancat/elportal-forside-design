import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, 
  Shield, 
  RefreshCw, 
  LogOut, 
  TrendingUp, 
  MousePointer, 
  DollarSign, 
  Users,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAdminAuthV2 } from '@/hooks/useAdminAuthV2';

const AdminV2: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, login, logout, getAuthHeaders } = useAdminAuthV2();
  const [credentials, setCredentials] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Fetch debug info on mount
  useEffect(() => {
    fetch('/api/admin/debug')
      .then(res => res.json())
      .then(setDebugInfo)
      .catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const result = await login(credentials);
    
    if (!result.success) {
      setLoginError(result.error || 'Login failed');
    }
    
    setIsLoggingIn(false);
  };

  const fetchDashboardData = async () => {
    setIsDashboardLoading(true);
    setDashboardError('');
    
    try {
      const response = await fetch('/api/admin/dashboard-v2', {
        headers: getAuthHeaders()
      });

      const result = await response.json();
      
      if (response.ok) {
        setDashboardData(result.data);
      } else {
        setDashboardError(result.error || 'Failed to load dashboard');
      }
    } catch (error) {
      setDashboardError('Network error: ' + String(error));
    } finally {
      setIsDashboardLoading(false);
    }
  };

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

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Login Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-brand-green rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Admin Dashboard v2</CardTitle>
              <CardDescription>
                Enter your admin credentials to access tracking metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="credentials">Access Code</Label>
                  <Input
                    id="credentials"
                    type="text"
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                    placeholder="Enter admin access code"
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                
                {loginError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoggingIn || !credentials.trim()}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Access Dashboard'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Debug Info */}
          {debugInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Dashboard interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DinElportal Admin v2</h1>
            <p className="text-sm text-gray-600">Revenue Tracking Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchDashboardData}
              disabled={isDashboardLoading}
            >
              {isDashboardLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Load Data
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Dashboard Content */}
        {!dashboardData ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="mb-4">Click "Load Data" to fetch tracking metrics</p>
              <Button onClick={fetchDashboardData} disabled={isDashboardLoading}>
                {isDashboardLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load Dashboard Data'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {dashboardError && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {dashboardError}
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
                      <p className="text-2xl font-bold">{dashboardData.realtime?.clicksToday || 0}</p>
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
                      <p className="text-2xl font-bold">{dashboardData.realtime?.conversionsToday || 0}</p>
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
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.realtime?.revenueToday || 0)}</p>
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
                      <p className="text-2xl font-bold">{dashboardData.realtime?.activePartners?.length || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Partner Performance */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Partner Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.partners?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Conversions</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.partners.map((partner: any) => (
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No partner data yet. Track some clicks first!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashboardData.recent?.clicks?.slice(0, 10).map((click: any) => (
                      <div key={click.clickId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{click.partner}</p>
                          <p className="text-xs text-gray-600">
                            {formatDateTime(click.timestamp)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {click.clickId.split('_')[1]}
                        </Badge>
                      </div>
                    )) || <div className="text-sm text-gray-500">No recent clicks</div>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashboardData.recent?.conversions?.slice(0, 10).map((conversion: any) => (
                      <div key={conversion.clickId} className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{conversion.partner}</p>
                          <p className="text-xs text-gray-600">
                            {formatDateTime(conversion.timestamp)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(conversion.value)}</p>
                        </div>
                      </div>
                    )) || <div className="text-sm text-gray-500">No conversions yet</div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminV2;