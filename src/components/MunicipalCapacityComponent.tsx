import React, { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Map, BarChart3, Download, Filter } from 'lucide-react'
import { Municipalities } from 'react-denmark-map'

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

// Comprehensive Danish municipality names mapping
const MUNICIPALITY_NAMES: { [key: number]: string } = {
  // Capital Region (Region Hovedstaden)
  101: 'København',
  147: 'Frederiksberg',
  151: 'Ballerup',
  153: 'Brøndby',
  155: 'Dragør',
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
  210: 'Fredensborg',
  217: 'Helsingør',
  219: 'Hillerød',
  223: 'Hørsholm',
  230: 'Rudersdal',
  240: 'Egedal',
  250: 'Allerød',
  253: 'Frederiksborg',
  259: 'Gribskov',
  260: 'Halsnæs',
  
  // Zealand Region (Region Sjælland)
  306: 'Odsherred',
  316: 'Holbæk',
  320: 'Faxe',
  326: 'Kalundborg',
  329: 'Ringsted',
  330: 'Glostrup',
  336: 'Stevns',
  340: 'Sorø',
  350: 'Lejre',
  360: 'Lolland',
  370: 'Næstved',
  376: 'Guldborgsund',
  390: 'Vordingborg',
  400: 'Bornholm',
  
  // Southern Denmark Region (Region Syddanmark)
  410: 'Middelfart',
  420: 'Assens',
  430: 'Faaborg-Midtfyn',
  440: 'Kerteminde',
  450: 'Nyborg',
  461: 'Odense',
  479: 'Svendborg',
  480: 'Nordfyns',
  482: 'Langeland',
  492: 'Ærø',
  510: 'Haderslev',
  530: 'Billund',
  540: 'Sønderborg',
  550: 'Tønder',
  561: 'Esbjerg',
  563: 'Fanø',
  573: 'Varde',
  575: 'Vejen',
  580: 'Aabenraa',
  607: 'Fredericia',
  615: 'Horsens',
  621: 'Kolding',
  630: 'Vejle',
  
  // Central Denmark Region (Region Midtjylland)
  657: 'Herning',
  661: 'Holstebro',
  665: 'Lemvig',
  671: 'Struer',
  706: 'Syddjurs',
  707: 'Norddjurs',
  710: 'Favrskov',
  727: 'Odder',
  730: 'Randers',
  740: 'Silkeborg',
  741: 'Samsø',
  746: 'Skanderborg',
  751: 'Aarhus',
  756: 'Ikast-Brande',
  760: 'Ringkøbing-Skjern',
  766: 'Hedensted',
  779: 'Skive',
  787: 'Viborg',
  
  // North Denmark Region (Region Nordjylland)
  825: 'Brovst',
  840: 'Rebild',
  846: 'Mariagerfjord',
  849: 'Jammerbugt',
  851: 'Aalborg',
  860: 'Hjørring',
  861: 'Frederikshavn',
  863: 'Vesthimmerlands',
  865: 'Læsø',
  
  // Additional municipalities
  411: 'Christiansø' // Administered directly by the state
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
          throw new Error(result.error || 'Kunne ikke hente data')
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
        setError(err instanceof Error ? err.message : 'Kunne ikke indlæse data')
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
      name: MUNICIPALITY_NAMES[municipality.municipalityNo] || `Kommune ${municipality.municipalityNo}`,
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
      { name: 'Solenergi', value: totalRenewable.solar, color: COLORS.solar },
      { name: 'Landvind', value: totalRenewable.onshoreWind, color: COLORS.onshoreWind },
      { name: 'Havvind', value: totalRenewable.offshoreWind, color: COLORS.offshoreWind }
    ].filter(item => item.value > 0)
  }, [data, totalStats])

  // Export data function
  const exportData = () => {
    if (!enableDataExport) return

    const csvData = data.map(municipality => ({
      Kommune: MUNICIPALITY_NAMES[municipality.municipalityNo] || municipality.municipalityNo,
      Måned: municipality.month,
      'Total Kapacitet (MW)': municipality.totalCapacity,
      'Vedvarende Kapacitet (MW)': municipality.renewableCapacity,
      'Solenergi (MW)': municipality.capacityBreakdown.solar,
      'Landvind (MW)': municipality.capacityBreakdown.onshoreWind,
      'Havvind (MW)': municipality.capacityBreakdown.offshoreWind,
      'Konventionel (MW)': municipality.capacityBreakdown.conventional,
      'Vedvarende Procent': municipality.renewablePercentage.toFixed(1)
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
        <p className="text-gray-600">Indlæser kommunal kapacitetsdata...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Fejl ved indlæsning af data</h3>
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
                Kort
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Diagrammer
              </TabsTrigger>
              <TabsTrigger value="combined">Combined</TabsTrigger>
            </TabsList>
          </Tabs>

          {showMunicipalityFilter && (
            <Select value={selectedMunicipality?.toString() || ''} onValueChange={(value) => setSelectedMunicipality(value ? parseInt(value) : null)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle kommuner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle kommuner</SelectItem>
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
                <SelectItem value="all">Alle kapacitetstyper</SelectItem>
                <SelectItem value="renewable">Kun vedvarende</SelectItem>
                <SelectItem value="solar">Kun solenergi</SelectItem>
                <SelectItem value="onshoreWind">Kun landvind</SelectItem>
                <SelectItem value="offshoreWind">Kun havvind</SelectItem>
              </SelectContent>
            </Select>
          )}

          {enableDataExport && (
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Eksportér CSV
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Kapacitet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalCapacity.toLocaleString()} MW</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vedvarende Kapacitet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalRenewable.toLocaleString()} MW</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vedvarende Andel</CardTitle>
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
          {/* Interactive Denmark Municipality Map */}
          <Card>
            <CardHeader>
              <CardTitle>Kommunalt Kapacitetskort</CardTitle>
              <p className="text-sm text-gray-600 mt-2">Klik på kommuner for at se detaljerede kapacitetsdata</p>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-2xl mx-auto px-4">
                <div style={{ position: 'relative', paddingBottom: '75%' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <Municipalities
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        maxWidth: '100%'
                      }}
                      onClick={(municipality) => {
                    // Find municipality data by matching name or code
                    const municipalityData = data.find(d => 
                      d.municipalityNo.toString() === municipality.lau1 ||
                      MUNICIPALITY_NAMES[d.municipalityNo] === municipality.label_dk
                    )
                    if (municipalityData) {
                      setSelectedMunicipality(municipalityData.municipalityNo)
                    }
                  }}
                  customizeAreas={(municipality) => {
                    // Find data for this municipality
                    const municipalityData = data.find(d => 
                      d.municipalityNo.toString() === municipality.lau1 ||
                      MUNICIPALITY_NAMES[d.municipalityNo] === municipality.label_dk
                    )
                    
                    if (!municipalityData) {
                      return {
                        style: {
                          fill: '#f3f4f6',
                          stroke: '#d1d5db',
                          strokeWidth: 1,
                          cursor: 'pointer'
                        }
                      }
                    }
                    
                    // Color based on renewable percentage
                    const renewablePercent = municipalityData.renewablePercentage
                    let fillColor = '#f3f4f6' // Default gray
                    
                    if (renewablePercent > 80) {
                      fillColor = '#10b981' // High renewable - green
                    } else if (renewablePercent > 60) {
                      fillColor = '#34d399' // Good renewable - light green
                    } else if (renewablePercent > 40) {
                      fillColor = '#fbbf24' // Medium renewable - yellow
                    } else if (renewablePercent > 20) {
                      fillColor = '#f59e0b' // Low renewable - orange
                    } else {
                      fillColor = '#ef4444' // Very low renewable - red
                    }
                    
                    return {
                      style: {
                        fill: selectedMunicipality === municipalityData.municipalityNo ? '#3b82f6' : fillColor,
                        stroke: '#374151',
                        strokeWidth: selectedMunicipality === municipalityData.municipalityNo ? 2 : 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }
                    }
                  }}
                  tooltip={(municipality) => {
                    const municipalityData = data.find(d => 
                      d.municipalityNo.toString() === municipality.lau1 ||
                      MUNICIPALITY_NAMES[d.municipalityNo] === municipality.label_dk
                    )
                    
                    if (!municipalityData) {
                      return `${municipality.label_dk || municipality.label_en}: Ingen data`
                    }
                    
                    return `${municipality.label_dk || municipality.label_en}
Vedvarende: ${municipalityData.renewablePercentage.toFixed(1)}%
Total: ${municipalityData.totalCapacity.toFixed(0)} MW`
                  }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Vedvarende Energi Andel:</h4>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                    <span>80%+ (Høj)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#34d399' }}></div>
                    <span>60-80% (God)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
                    <span>40-60% (Mellem)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span>20-40% (Lav)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>0-20% (Meget lav)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f3f4f6' }}></div>
                    <span>Ingen data</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          {/* Top Municipalities Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Kommuner efter Vedvarende Kapacitet</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="solar" fill={COLORS.solar} name="Solenergi" />
                  <Bar dataKey="onshoreWind" fill={COLORS.onshoreWind} name="Landvind" />
                  <Bar dataKey="offshoreWind" fill={COLORS.offshoreWind} name="Havvind" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Renewable Energy Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Vedvarende Energi Fordeling</CardTitle>
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
                <CardTitle>Kommunalt Kapacitetskort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <Map className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Interaktivt kort</p>
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
                    <Bar dataKey="renewableCapacity" fill={COLORS.onshoreWind} name="Vedvarende Kapacitet" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vedvarende Energi Distribution</CardTitle>
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
        <p>Datakilde: EnergiDataService.dk</p>
        {lastUpdated && (
          <p>Sidst opdateret: {new Date(lastUpdated).toLocaleString('da-DK')}</p>
        )}
      </div>
    </div>
  )
}

export default MunicipalCapacityComponent