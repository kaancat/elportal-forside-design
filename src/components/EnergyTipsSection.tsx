import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  Home, 
  Thermometer, 
  Zap, 
  Shield, 
  Smartphone,
  Power,
  Shirt,
  Clock,
  Sun,
  Snowflake,
  Activity
} from 'lucide-react'
import * as Icons from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calculator } from 'lucide-react'
import { EnergyTip } from '@/types/appliance'
import { useScrollAnimation, staggerContainer, animationClasses } from '@/hooks/useScrollAnimation'

// Hardcoded energy tips data
const ENERGY_TIPS_DATA: EnergyTip[] = [
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
  },
  {
    _id: '7',
    title: 'Luk for radiatorer i ubrugte rum',
    slug: { current: 'luk-radiatorer-ubrugte-rum' },
    category: 'heating',
    shortDescription: 'Spar op til 10% på varmeregningen ved at lukke for radiatorer i rum du ikke bruger.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Thermometer'
  },
  {
    _id: '8',
    title: 'Skift til A+++ hvidevarer',
    slug: { current: 'skift-til-a-plus-hvidevarer' },
    category: 'appliances',
    shortDescription: 'Nye energieffektive hvidevarer kan spare op til 50% strøm sammenlignet med 10 år gamle modeller.',
    savingsPotential: 'high',
    difficulty: 'hard',
    icon: 'Zap'
  },
  {
    _id: '9',
    title: 'Brug naturligt lys',
    slug: { current: 'brug-naturligt-lys' },
    category: 'lighting',
    shortDescription: 'Udnyt dagslyset og sluk kunstigt lys når det ikke er nødvendigt.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Sun'
  },
  {
    _id: '10',
    title: 'Afrim din fryser regelmæssigt',
    slug: { current: 'afrim-fryser-regelmaessigt' },
    category: 'daily_habits',
    shortDescription: 'Is i fryseren reducerer effektiviteten med op til 20%. Afrim hver 3. måned.',
    savingsPotential: 'low',
    difficulty: 'easy',
    icon: 'Snowflake'
  },
  {
    _id: '11',
    title: 'Installer bevægelsessensorer',
    slug: { current: 'installer-bevaegelsessensorer' },
    category: 'smart_tech',
    shortDescription: 'Automatisk tænd/sluk af lys kan spare op til 30% på belysning.',
    savingsPotential: 'medium',
    difficulty: 'medium',
    icon: 'Activity'
  },
  {
    _id: '12',
    title: 'Tætne vinduer og døre',
    slug: { current: 'taetne-vinduer-doere' },
    category: 'insulation',
    shortDescription: 'Stop varmetab gennem utætte vinduer og døre med tætningslister.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Shield'
  }
]

// Category configuration
const categoryConfig = {
  daily_habits: { label: 'Daglige vaner', icon: Home },
  heating: { label: 'Opvarmning', icon: Thermometer },
  lighting: { label: 'Belysning', icon: Lightbulb },
  appliances: { label: 'Apparater', icon: Zap },
  insulation: { label: 'Isolering', icon: Shield },
  smart_tech: { label: 'Smart teknologi', icon: Smartphone },
}

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

interface EnergyTipsSectionProps {
  block: {
    _type: 'energyTipsSection'
    title?: string
    subtitle?: string
    showCategories?: string[]
    displayMode?: 'tabs' | 'grid' | 'list'
    headerAlignment?: 'left' | 'center' | 'right'
    showDifficultyBadges?: boolean
    showSavingsPotential?: boolean
    showSavingsCalculator?: boolean
    maxTipsPerCategory?: number
  }
}

export function EnergyTipsSection({ block }: EnergyTipsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Use professional animations
  const headerAnimation = useScrollAnimation({ duration: 0.6, type: 'fadeUp' });
  
  // Filter tips based on configuration
  const categoriesToShow = block.showCategories && block.showCategories.length > 0 
    ? block.showCategories 
    : Object.keys(categoryConfig)
  
  const allTips = ENERGY_TIPS_DATA.filter(tip => 
    categoriesToShow.includes(tip.category)
  )
  
  const filteredTips = selectedCategory === 'all' 
    ? allTips 
    : allTips.filter(tip => tip.category === selectedCategory)
  
  // Apply max tips limit if set
  const displayTips = block.maxTipsPerCategory && block.maxTipsPerCategory > 0
    ? filteredTips.slice(0, block.maxTipsPerCategory)
    : filteredTips

  const renderTipCard = (tip: EnergyTip, index: number) => {
    const Icon = tip.icon ? Icons[tip.icon as keyof typeof Icons] : Lightbulb
    const cardAnimation = useScrollAnimation({ 
      type: 'stagger', 
      index, 
      duration: 0.5,
      staggerDelay: 0.08 
    });
    
    return (
      <motion.div
        key={tip._id}
        {...cardAnimation}
        className={animationClasses}
      >
        <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-brand-green/10 rounded-lg">
              <Icon className="h-6 w-6 text-brand-green" />
            </div>
            <div className="flex gap-2">
              {block.showSavingsPotential !== false && tip.savingsPotential && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${savingsColors[tip.savingsPotential]}`}
                >
                  {tip.savingsPotential === 'low' && '💰'}
                  {tip.savingsPotential === 'medium' && '💰💰'}
                  {tip.savingsPotential === 'high' && '💰💰💰'}
                </Badge>
              )}
              {block.showDifficultyBadges !== false && tip.difficulty && (
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
  }

  const content = (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {displayTips.map((tip, index) => renderTipCard(tip, index))}
    </motion.div>
  )

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          {...headerAnimation}
          className={`mb-12 ${
            block.headerAlignment === 'center' ? 'text-center' : 
            block.headerAlignment === 'right' ? 'text-right' : 
            'text-left'
          } ${animationClasses}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {block.title || 'Praktiske energispare tips'}
          </h2>
          <p className={`text-lg text-gray-600 ${
            block.headerAlignment === 'center' ? 'max-w-2xl mx-auto' : ''
          }`}>
            {block.subtitle || 'Følg disse simple råd for at reducere dit energiforbrug og spare penge hver måned.'}
          </p>
        </motion.div>

        {block.displayMode === 'tabs' ? (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-1 bg-gray-100">
              <TabsTrigger
                value="all"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Alle tips</span>
              </TabsTrigger>
              {categoriesToShow.map((categoryKey) => {
                const category = categoryConfig[categoryKey as keyof typeof categoryConfig]
                if (!category) return null
                const Icon = category.icon
                
                return (
                  <TabsTrigger
                    key={categoryKey}
                    value={categoryKey}
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-8">
              {content}
            </TabsContent>
          </Tabs>
        ) : (
          content
        )}
        
        {/* Savings Calculator Section */}
        {block.showSavingsCalculator && (
          <motion.div
            {...useScrollAnimation({ duration: 0.7, type: 'fadeUp', delay: 0.3 })}
            className={`mt-12 ${animationClasses}`}
          >
            <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Beregn dine potentielle besparelser
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dit nuværende månedlige elforbrug (kWh)
                  </label>
                  <Input
                    type="number"
                    placeholder="300"
                    className="bg-white"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      const savings = Math.round(value * 0.15 * 2.5) // 15% savings at 2.5 kr/kWh
                      const savingsElement = document.getElementById('estimated-savings')
                      if (savingsElement) {
                        savingsElement.textContent = savings.toString()
                      }
                    }}
                  />
                </div>
                
                <div className="flex flex-col justify-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Estimeret månedlig besparelse
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    <span id="estimated-savings">0</span> kr
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ved implementering af vores energispare tips
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                  Se alle besparelsesmuligheder
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  )
}