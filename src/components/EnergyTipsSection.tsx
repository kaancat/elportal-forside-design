import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { 
  Lightbulb, 
  Home, 
  Thermometer, 
  Zap, 
  Shield, 
  Smartphone
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calculator } from 'lucide-react'
import { useScrollAnimation, staggerContainer, animationClasses } from '@/hooks/useScrollAnimation'

// Fallback tips for when no CMS data is available
const FALLBACK_TIPS = [
  {
    _id: 'fallback-1',
    title: 'Udskift til LED-pærer',
    slug: { current: 'udskift-til-led-paerer' },
    category: 'lighting',
    shortDescription: 'LED-pærer bruger op til 85% mindre strøm end traditionelle glødepærer.',
    savingsPotential: 'high',
    difficulty: 'easy',
    icon: 'Lightbulb'
  },
  {
    _id: 'fallback-2',
    title: 'Installer en smart termostat',
    slug: { current: 'installer-smart-termostat' },
    category: 'smart_tech',
    shortDescription: 'En smart termostat kan reducere dit varmeforbrug med op til 20%.',
    savingsPotential: 'high',
    difficulty: 'medium',
    icon: 'Thermometer'
  },
  {
    _id: 'fallback-3',
    title: 'Sluk standby-apparater',
    slug: { current: 'sluk-standby-apparater' },
    category: 'daily_habits',
    shortDescription: 'Standby-forbrug kan udgøre op til 10% af din elregning.',
    savingsPotential: 'medium',
    difficulty: 'easy',
    icon: 'Power'
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

// Type for CMS energy tip
interface CMSEnergyTip {
  _id: string
  title: string
  slug?: { current: string }
  category: string
  shortDescription: string
  savingsPotential?: 'low' | 'medium' | 'high'
  difficulty?: 'easy' | 'medium' | 'hard'
  icon?: string
  estimatedSavings?: string
  implementationTime?: string
  priority?: number
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
    defaultCategory?: 'all' | 'daily_habits' | 'heating' | 'lighting' | 'appliances' | 'insulation' | 'smart_tech'
    tips?: CMSEnergyTip[] // Tips from CMS
  }
}

export function EnergyTipsSection({ block }: EnergyTipsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState(block.defaultCategory || 'daily_habits')
  
  // Use professional animations
  const headerAnimation = useScrollAnimation({ duration: 0.6, type: 'fadeUp' });
  
  // Use CMS tips if available, otherwise use fallback
  const allTipsData = block.tips && block.tips.length > 0 
    ? block.tips 
    : FALLBACK_TIPS

  // Determine which categories to show
  const categoriesToShow = useMemo(() => {
    // If showCategories is defined and has items, use it
    if (block.showCategories && block.showCategories.length > 0) {
      return block.showCategories
    }
    // Otherwise, use all category keys
    return Object.keys(categoryConfig)
  }, [block.showCategories])

  // Filter and organize tips - SIMPLIFIED LOGIC
  const { displayTips, categoryTips } = useMemo(() => {
    // Group all tips by category
    const grouped: Record<string, CMSEnergyTip[]> = {}
    
    // Initialize all categories with empty arrays
    categoriesToShow.forEach(cat => {
      grouped[cat] = []
    })
    
    // Populate groups with actual tips
    allTipsData.forEach(tip => {
      if (categoriesToShow.includes(tip.category)) {
        if (!grouped[tip.category]) {
          grouped[tip.category] = []
        }
        grouped[tip.category].push(tip)
      }
    })
    
    // Determine what to display based on selected category
    let tipsToDisplay: CMSEnergyTip[] = []
    
    if (selectedCategory === 'all') {
      // Show all tips from all categories
      tipsToDisplay = allTipsData.filter(tip => 
        categoriesToShow.includes(tip.category)
      )
    } else {
      // Show tips from selected category only
      tipsToDisplay = grouped[selectedCategory] || []
    }
    
    // Apply max tips limit if needed
    if (block.maxTipsPerCategory && 
        block.maxTipsPerCategory > 0 && 
        selectedCategory !== 'all') {
      tipsToDisplay = tipsToDisplay.slice(0, block.maxTipsPerCategory)
    }
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 EnergyTips Debug:', {
        selectedCategory,
        categoriesToShow,
        allTipsCount: allTipsData.length,
        displayCount: tipsToDisplay.length,
        categoryBreakdown: Object.entries(grouped).map(([cat, tips]) => 
          `${cat}: ${tips.length}`
        ).join(', ')
      })
    }
    
    return { 
      displayTips: tipsToDisplay,
      categoryTips: grouped 
    }
  }, [allTipsData, categoriesToShow, selectedCategory, block.maxTipsPerCategory])

  const renderTipCard = (tip: CMSEnergyTip, index: number) => {
    const Icon = tip.icon && Icons[tip.icon as keyof typeof Icons] 
      ? Icons[tip.icon as keyof typeof Icons] 
      : Lightbulb
      
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
          
          {tip.estimatedSavings && (
            <p className="text-sm font-medium text-green-600 mt-3">
              {tip.estimatedSavings}
            </p>
          )}
        </Card>
      </motion.div>
    )
  }

  const renderContent = () => (
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
          <div>
            {/* Tab List */}
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Alle tips</span>
                  <span className="sm:hidden">Alle</span>
                </button>
                {categoriesToShow.map((categoryKey) => {
                  const category = categoryConfig[categoryKey as keyof typeof categoryConfig]
                  if (!category) return null
                  const Icon = category.icon
                  
                  return (
                    <button
                      key={categoryKey}
                      onClick={() => setSelectedCategory(categoryKey)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === categoryKey 
                          ? 'bg-white shadow-sm text-gray-900' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.label}</span>
                      <span className="sm:hidden text-xs">{category.label.split(' ')[0]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="mt-8">
              {displayTips.length > 0 ? (
                renderContent()
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Ingen tips fundet for denne kategori.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          renderContent()
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
        
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-600">
            <p>Debug: {allTipsData.length} tips loaded</p>
            <p>Categories shown: {categoriesToShow.join(', ')}</p>
            <p>Selected category: {selectedCategory}</p>
            <p>Tips displayed: {displayTips.length}</p>
          </div>
        )}
      </div>
    </section>
  )
}