import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { 
  Lightbulb, 
  Home, 
  Thermometer, 
  Zap, 
  Shield, 
  Smartphone,
  TrendingDown,
  Filter,
  ArrowRight,
  Power,
  Clock,
  ChefHat,
  Shirt,
  Coffee,
  Tv,
  Gamepad2,
  Wifi,
  PowerOff
} from 'lucide-react'
import { ApplianceCalculator } from '@/components/appliance-calculator/ApplianceCalculator'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { client } from '@/lib/sanity'
import { Appliance, EnergyTip } from '@/types/appliance'
import { useScrollAnimation, fadeInAnimation, animationClasses } from '@/hooks/useScrollAnimation'

// Mock data for now - will be replaced with Sanity data
const mockAppliances: Appliance[] = [
  {
    _id: '1',
    name: 'Kaffemaskine',
    slug: { current: 'kaffemaskine' },
    category: 'kitchen',
    powerWatts: 1000,
    usageUnit: 'minutes_per_day',
    defaultUsage: 15,
    icon: 'Coffee',
    energyTip: 'Sluk kaffemaskinen efter brug. En tænd kaffemaskine bruger strøm hele dagen.',
    popularityScore: 9
  },
  {
    _id: '2',
    name: 'Smart TV (55")',
    slug: { current: 'smart-tv-55' },
    category: 'entertainment',
    powerWatts: 150,
    powerRangeMin: 100,
    powerRangeMax: 200,
    usageUnit: 'hours_per_day',
    defaultUsage: 4,
    icon: 'Tv',
    energyTip: 'Reducer lysstyrken og sluk for TV\'et helt i stedet for standby.',
    popularityScore: 10
  },
  {
    _id: '3',
    name: 'Gaming Computer',
    slug: { current: 'gaming-computer' },
    category: 'entertainment',
    powerWatts: 500,
    powerRangeMin: 300,
    powerRangeMax: 800,
    usageUnit: 'hours_per_day',
    defaultUsage: 3,
    icon: 'Gamepad2',
    energyTip: 'Aktiver strømsparetilstand når du ikke gamer aktivt.',
    popularityScore: 8
  },
  {
    _id: '4',
    name: 'LED Pære (10W)',
    slug: { current: 'led-paere-10w' },
    category: 'lighting',
    powerWatts: 10,
    usageUnit: 'hours_per_day',
    defaultUsage: 5,
    icon: 'Lightbulb',
    energyTip: 'LED pærer bruger 75% mindre strøm end glødepærer.',
    popularityScore: 10
  },
  {
    _id: '5',
    name: 'Vaskemaskine',
    slug: { current: 'vaskemaskine' },
    category: 'cleaning',
    powerWatts: 2000,
    usageUnit: 'cycles_per_week',
    defaultUsage: 3,
    icon: 'Shirt',
    energyTip: 'Vask ved lavere temperaturer og fyld maskinen helt op.',
    popularityScore: 9
  },
  {
    _id: '6',
    name: 'Køleskab',
    slug: { current: 'koeleskab' },
    category: 'cooling',
    powerWatts: 150,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Snowflake',
    energyTip: 'Hold køleskabet ved 5°C og fryseren ved -18°C for optimal energiforbrug.',
    popularityScore: 10
  },
  {
    _id: '7',
    name: 'Airfryer',
    slug: { current: 'airfryer' },
    category: 'cooking',
    powerWatts: 1400,
    usageUnit: 'minutes_per_day',
    defaultUsage: 20,
    icon: 'ChefHat',
    energyTip: 'En airfryer bruger op til 50% mindre energi end en almindelig ovn.',
    popularityScore: 7
  },
  {
    _id: '8',
    name: 'Router/Modem',
    slug: { current: 'router-modem' },
    category: 'standby',
    powerWatts: 10,
    usageUnit: 'always_on',
    defaultUsage: 24,
    icon: 'Wifi',
    energyTip: 'Overvej at slukke WiFi om natten med en timer-funktion.',
    popularityScore: 9
  }
]

const mockEnergyTips: EnergyTip[] = [
  {
    _id: '1',
    title: 'Udskift til LED-pærer',
    slug: { current: 'udskift-til-led-paerer' },
    category: 'lighting',
    shortDescription: 'LED-pærer bruger op til 85% mindre strøm end traditionelle glødepærer og holder 25 gange længere.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Lightbulb'
  },
  {
    _id: '2',
    title: 'Installer en smart termostat',
    slug: { current: 'installer-smart-termostat' },
    category: 'smart_tech',
    shortDescription: 'En smart termostat kan reducere dit varmeforbrug med op til 20% ved at tilpasse temperaturen efter dit behov.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Thermometer'
  },
  {
    _id: '3',
    title: 'Sluk standby-apparater',
    slug: { current: 'sluk-standby-apparater' },
    category: 'daily_habits',
    shortDescription: 'Standby-forbrug kan udgøre op til 10% af din elregning. Brug stikdåser med afbryder.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Power'
  },
  {
    _id: '4',
    title: 'Vask tøj ved lavere temperaturer',
    slug: { current: 'vask-toej-lavere-temp' },
    category: 'appliances',
    shortDescription: 'Ved at vaske ved 30°C i stedet for 60°C kan du spare op til 40% af energiforbruget pr. vask.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Shirt'
  },
  {
    _id: '5',
    title: 'Isoler din bolig bedre',
    slug: { current: 'isoler-bolig-bedre' },
    category: 'insulation',
    shortDescription: 'God isolering kan reducere dit varmeforbrug med op til 30% og forbedre indeklimaet.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Home'
  },
  {
    _id: '6',
    title: 'Brug tidsindstillinger',
    slug: { current: 'brug-tidsindstillinger' },
    category: 'smart_tech',
    shortDescription: 'Programmér dine apparater til at køre når elprisen er lavest - typisk om natten.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Clock'
  }
]

// Category configuration
const categories = [
  { id: 'all', label: 'Alle tips', icon: Zap },
  { id: 'daily_habits', label: 'Daglige vaner', icon: Home },
  { id: 'heating', label: 'Opvarmning', icon: Thermometer },
  { id: 'lighting', label: 'Belysning', icon: Lightbulb },
  { id: 'appliances', label: 'Apparater', icon: Zap },
  { id: 'insulation', label: 'Isolering', icon: Shield },
  { id: 'smart_tech', label: 'Smart teknologi', icon: Smartphone },
]

const savingsColors = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
}

const difficultyLabels = {
  easy: 'Let',
  medium: 'Middel',
  hard: 'Svær',
}

function EnergyTips() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')

  // In production, fetch from Sanity
  // const { data: appliances, isLoading: appliancesLoading } = useQuery({
  //   queryKey: ['appliances'],
  //   queryFn: async () => {
  //     const query = `*[_type == "appliance"] | order(popularityScore desc)`
  //     return client.fetch<Appliance[]>(query)
  //   }
  // })

  // const { data: tips, isLoading: tipsLoading } = useQuery({
  //   queryKey: ['energyTips'],
  //   queryFn: async () => {
  //     const query = `*[_type == "energyTip"] | order(order asc)`
  //     return client.fetch<EnergyTip[]>(query)
  //   }
  // })

  const appliances = mockAppliances
  const tips = mockEnergyTips

  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-green/10 via-white to-green-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            {...fadeInAnimation()}
            className={`text-center max-w-4xl mx-auto ${animationClasses}`}
          >
            <Badge className="mb-4 bg-brand-green/20 text-brand-green border-brand-green/30">
              <TrendingDown className="h-3 w-3 mr-1" />
              Spar på elregningen
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Energisparende tips
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Med enkle og effektive vaner kan du reducere dit strømforbrug 
              uden at gå på kompromis med komforten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-brand-green hover:bg-brand-green/90"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start beregner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('tips')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Se alle tips
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-16">
        <ApplianceCalculator 
          appliances={appliances}
          isLoading={false}
        />
      </section>

      {/* Energy Tips Section */}
      <section id="tips" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            {...fadeInAnimation()}
            className={`text-center mb-12 ${animationClasses}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Praktiske energispare tips
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Følg disse simple råd for at reducere dit energiforbrug og spare penge hver måned.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-1 bg-gray-100">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTips.map((tip, index) => {
                  const IconComponent = tip.icon && Icons[tip.icon as keyof typeof Icons] 
                    ? (Icons[tip.icon as keyof typeof Icons] as any)
                    : Lightbulb
                  
                  return (
                    <motion.div
                      key={tip._id}
                      {...fadeInAnimation(index * 0.05)}
                      className={animationClasses}
                    >
                      <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-brand-green/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-brand-green" />
                          </div>
                          <div className="flex gap-2">
                            {tip.savingsPotential && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${savingsColors[tip.savingsPotential]}`}
                              >
                                {tip.savingsPotential === 'low' && '💰'}
                                {tip.savingsPotential === 'medium' && '💰💰'}
                                {tip.savingsPotential === 'high' && '💰💰💰'}
                              </Badge>
                            )}
                            {tip.difficulty && (
                              <Badge variant="outline" className="text-xs">
                                {difficultyLabels[tip.difficulty]}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {tip.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {tip.shortDescription}
                        </p>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-green to-green-600">
        <div className="container mx-auto px-4">
          <motion.div
            {...useScrollAnimation({ duration: 0.5 })}
            className={`text-center text-white ${animationClasses}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Klar til at spare på elregningen?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Sammenlign elpriser fra Danmarks bedste leverandører og find den bedste aftale til dit forbrug.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-brand-green hover:bg-gray-100"
              onClick={() => navigate('/sammenlign-priser')}
            >
              Sammenlign elpriser nu
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
export default EnergyTips;
