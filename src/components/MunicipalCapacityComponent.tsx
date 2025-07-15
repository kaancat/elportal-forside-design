import React, { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Map, BarChart3, Download, Filter } from 'lucide-react'

// Types
interface MunicipalCapacityData {
  municipalityNo: number
  month: string
  totalCapacity: number
  renewableCapacity: number
  capacityBreakdown: {
    solar: number
    onshoreWind: number
    offshoreWind: number
    conventional: number
  }
  generationUnits: {
    total: number
    solar: number
    onshoreWind: number
    offshoreWind: number
    conventional: number
  }
  renewablePercentage: number
}

interface MunicipalCapacityAPIResponse {
  success: boolean
  data?: {
    municipalities: MunicipalCapacityData[]
    topMunicipalities: MunicipalCapacityData[]
    totalStats: {
      totalCapacity: number
      totalRenewable: number
      renewablePercentage: number
      totalMunicipalities: number
    }
    lastUpdated: string
  }
  error?: string
  warning?: string
}

interface MunicipalCapacityComponentProps {
  title: string
  subtitle?: string
  viewType: 'map' | 'chart' | 'combined'
  selectedMonth?: string
  showMunicipalityFilter: boolean
  showCapacityTypes: boolean
  enableDataExport: boolean
  description?: string
}

// Chart colors
const COLORS = {
  solar: '#f59e0b',
  onshoreWind: '#10b981',
  offshoreWind: '#3b82f6',
  conventional: '#6b7280'
}

// Municipality names mapping (simplified - in production, use a complete mapping)
const MUNICIPALITY_NAMES: { [key: number]: string } = {
  101: 'København',
  147: 'Frederiksberg',
  151: 'Ballerup',
  153: 'Brøndby',
  157: 'Gentofte',
  159: 'Gladsaxe',
  161: 'Glostrup',
  163: 'Herlev',
  165: 'Albertslund',
  167: 'Hvidovre',
  169: 'Høje-Taastrup',
  173: 'Lyngby-Taarbæk',
  175: 'Rødovre',
  183: 'Ishøj',
  185: 'Tårnby',
  187: 'Vallensbæk',
  190: 'Furesø',
  // Add more as needed
}

const MunicipalCapacityComponent: React.FC<MunicipalCapacityComponentProps> = ({
  title,
  subtitle,
  viewType,
  selectedMonth,
  showMunicipalityFilter,
  showCapacityTypes,
  enableDataExport,
  description
}) => {
  const [data, setData] = useState<MunicipalCapacityData[]>([])
  const [topMunicipalities, setTopMunicipalities] = useState<MunicipalCapacityData[]>([])
  const [totalStats, setTotalStats] = useState<{
    totalCapacity: number
    totalRenewable: number
    renewablePercentage: number
    totalMunicipalities: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [activeView, setActiveView] = useState(viewType)
  const [selectedMunicipality, setSelectedMunicipality] = useState<number | null>(null)
  const [capacityFilter, setCapacityFilter] = useState<string>('all')
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        setWarning(null)

        let apiUrl = '/api/municipal-capacity'
        const params = new URLSearchParams()
        
        if (selectedMonth) {
          params.append('month', selectedMonth)
        }
        
        if (selectedMunicipality) {
          params.append('municipalityNo', selectedMunicipality.toString())
        }

        if (params.toString()) {
          apiUrl += `?${params.toString()}`
        }

        const response = await fetch(apiUrl)
        const result: MunicipalCapacityAPIResponse = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch data')
        }

        if (result.data) {
          setData(result.data.municipalities)
          setTopMunicipalities(result.data.topMunicipalities)
          setTotalStats(result.data.totalStats)
          setLastUpdated(result.data.lastUpdated)
        }

        if (result.warning) {
          setWarning(result.warning)
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedMonth, selectedMunicipality])

  // Filter data based on capacity type
  const filteredData = useMemo(() => {
    if (capacityFilter === 'all') return data
    
    return data.filter(municipality => {
      switch (capacityFilter) {
        case 'solar':
          return municipality.capacityBreakdown.solar > 0
        case 'onshoreWind':
          return municipality.capacityBreakdown.onshoreWind > 0
        case 'offshoreWind':
          return municipality.capacityBreakdown.offshoreWind > 0
        case 'renewable':
          return municipality.renewableCapacity > 0
        default:
          return true
      }
    })
  }, [data, capacityFilter])

  // Chart data preparation
  const chartData = useMemo(() => {
    return topMunicipalities.map(municipality => ({
      name: MUNICIPALITY_NAMES[municipality.municipalityNo] || `Municipality ${municipality.municipalityNo}`,
      municipalityNo: municipality.municipalityNo,
      totalCapacity: municipality.totalCapacity,
      renewableCapacity: municipality.renewableCapacity,
      solar: municipality.capacityBreakdown.solar,
      onshoreWind: municipality.capacityBreakdown.onshoreWind,
      offshoreWind: municipality.capacityBreakdown.offshoreWind,
      conventional: municipality.capacityBreakdown.conventional,
      renewablePercentage: municipality.renewablePercentage
    }))
  }, [topMunicipalities])

  // Pie chart data for renewable energy breakdown
  const pieData = useMemo(() => {
    if (!totalStats) return []
    
    const totalRenewable = data.reduce((sum, municipality) => ({
      solar: sum.solar + municipality.capacityBreakdown.solar,
      onshoreWind: sum.onshoreWind + municipality.capacityBreakdown.onshoreWind,
      offshoreWind: sum.offshoreWind + municipality.capacityBreakdown.offshoreWind,
    }), { solar: 0, onshoreWind: 0, offshoreWind: 0 })

    return [
      { name: 'Solar', value: totalRenewable.solar, color: COLORS.solar },
      { name: 'Onshore Wind', value: totalRenewable.onshoreWind, color: COLORS.onshoreWind },
      { name: 'Offshore Wind', value: totalRenewable.offshoreWind, color: COLORS.offshoreWind }
    ].filter(item => item.value > 0)
  }, [data, totalStats])

  // Export data function
  const exportData = () => {
    if (!enableDataExport) return

    const csvData = data.map(municipality => ({
      Municipality: MUNICIPALITY_NAMES[municipality.municipalityNo] || municipality.municipalityNo,
      Month: municipality.month,
      'Total Capacity (MW)': municipality.totalCapacity,
      'Renewable Capacity (MW)': municipality.renewableCapacity,
      'Solar (MW)': municipality.capacityBreakdown.solar,
      'Onshore Wind (MW)': municipality.capacityBreakdown.onshoreWind,
      'Offshore Wind (MW)': municipality.capacityBreakdown.offshoreWind,
      'Conventional (MW)': municipality.capacityBreakdown.conventional,
      'Renewable Percentage': municipality.renewablePercentage.toFixed(1)
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `municipal-capacity-${selectedMonth || 'latest'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-gray-600">Loading municipal capacity data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error loading data</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && <p className="text-lg text-gray-600 mb-4">{subtitle}</p>}
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'map' | 'chart' | 'combined')}>
            <TabsList>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="combined">Combined</TabsTrigger>
            </TabsList>
          </Tabs>

          {showMunicipalityFilter && (
            <Select value={selectedMunicipality?.toString() || ''} onValueChange={(value) => setSelectedMunicipality(value ? parseInt(value) : null)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All municipalities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All municipalities</SelectItem>
                {Object.entries(MUNICIPALITY_NAMES).map(([no, name]) => (
                  <SelectItem key={no} value={no}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showCapacityTypes && (
            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All capacity types</SelectItem>
                <SelectItem value="renewable">Renewable only</SelectItem>
                <SelectItem value="solar">Solar only</SelectItem>
                <SelectItem value="onshoreWind">Onshore Wind only</SelectItem>
                <SelectItem value="offshoreWind">Offshore Wind only</SelectItem>
              </SelectContent>
            </Select>
          )}

          {enableDataExport && (
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>

        {warning && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{warning}</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {totalStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalCapacity.toLocaleString()} MW</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Renewable Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalRenewable.toLocaleString()} MW</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Renewable Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.renewablePercentage.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Municipalities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalMunicipalities}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'map' | 'chart' | 'combined')}>
        <TabsContent value="map" className="space-y-6">
          {/* Map placeholder - in production, integrate with Denmark SVG map */}
          <Card>
            <CardHeader>
              <CardTitle>Municipal Capacity Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Map className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Interactive Denmark map will be implemented here</p>
                <p className="text-sm text-gray-500 mt-2">Click municipalities to view detailed capacity data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          {/* Top Municipalities Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Municipalities by Renewable Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="solar" fill={COLORS.solar} name="Solar" />
                  <Bar dataKey="onshoreWind" fill={COLORS.onshoreWind} name="Onshore Wind" />
                  <Bar dataKey="offshoreWind" fill={COLORS.offshoreWind} name="Offshore Wind" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Renewable Energy Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Renewable Energy Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combined" className="space-y-6">
          {/* Combined view with both map and charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Municipal Capacity Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <Map className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Interactive map</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Municipalities</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="renewableCapacity" fill={COLORS.onshoreWind} name="Renewable Capacity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Renewable Energy Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Description */}
      {description && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{description}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>Data source: EnergiDataService.dk</p>
        {lastUpdated && (
          <p>Last updated: {new Date(lastUpdated).toLocaleString('da-DK')}</p>
        )}
      </div>
    </div>
  )
}

export default MunicipalCapacityComponent