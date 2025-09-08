'use client'

import React, { useState } from 'react'
import { Plus, Search, Zap } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Appliance } from '@/types/appliance'

interface ApplianceSelectorProps {
  appliances: Appliance[]
  onSelect: (appliance: Appliance) => void
  isLoading?: boolean
}

const categoryLabels = {
  kitchen: 'Køkken',
  entertainment: 'Underholdning',
  lighting: 'Belysning',
  cooling: 'Køl og frys',
  cooking: 'Madlavning',
  cleaning: 'Vask og rengøring',
  heating: 'Varme og køl',
  standby: 'Standby',
  other: 'Andet',
}

const categoryColors = {
  kitchen: 'bg-blue-50 text-blue-700 border-blue-200',
  entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
  lighting: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  cooling: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  cooking: 'bg-orange-50 text-orange-700 border-orange-200',
  cleaning: 'bg-green-50 text-green-700 border-green-200',
  heating: 'bg-red-50 text-red-700 border-red-200',
  standby: 'bg-gray-50 text-gray-700 border-gray-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200',
}

export function ApplianceSelector({
  appliances,
  onSelect,
  isLoading = false,
}: ApplianceSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Group appliances by category
  const groupedAppliances = appliances.reduce((acc, appliance) => {
    const category = appliance.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(appliance)
    return acc
  }, {} as Record<string, Appliance[]>)

  // Sort categories by importance
  const categoryOrder = [
    'kitchen',
    'entertainment',
    'lighting',
    'cooling',
    'cooking',
    'cleaning',
    'heating',
    'standby',
    'other',
  ]

  const handleSelect = (appliance: Appliance) => {
    onSelect(appliance)
    setOpen(false)
    setSearch('')
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="w-full bg-brand-green hover:bg-brand-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="mr-2 h-5 w-5" />
        Tilføj apparat
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 flex flex-col h-[calc(100vh-4rem)] max-h-[600px] md:h-auto md:max-h-[calc(100vh-6rem)]">
          <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-4 flex-shrink-0">
            <DialogTitle className="text-xl md:text-2xl font-bold">Vælg et apparat</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Søg og vælg det apparat du vil tilføje til din beregning
            </DialogDescription>
          </DialogHeader>

          <Command className="border-0 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="px-4 md:px-6 pb-2 md:pb-4 flex-shrink-0">
              <CommandInput
                placeholder="Søg efter apparater..."
                value={search}
                onValueChange={setSearch}
              />
            </div>

            <CommandList className="max-h-none flex-1 px-4 md:px-6 pb-4 md:pb-6 overflow-y-auto">
              <CommandEmpty className="py-12 text-center">
                <div className="space-y-3">
                  <Zap className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">Ingen apparater fundet</p>
                  <p className="text-sm text-gray-400">
                    Prøv at søge efter noget andet
                  </p>
                </div>
              </CommandEmpty>

              {categoryOrder.map((category) => {
                const categoryAppliances = groupedAppliances[category]
                if (!categoryAppliances || categoryAppliances.length === 0) return null

                return (
                  <CommandGroup
                    key={category}
                    heading={
                      <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <span className="font-semibold text-gray-900 text-sm md:text-base">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] md:text-xs ${
                            categoryColors[category as keyof typeof categoryColors]
                          }`}
                        >
                          {categoryAppliances.length}
                        </Badge>
                      </div>
                    }
                  >
                    {categoryAppliances
                      .sort((a, b) => (b.popularityScore || 5) - (a.popularityScore || 5))
                      .map((appliance) => {
                        const Icon = (appliance.icon && Icons[appliance.icon as keyof typeof Icons] as any) || Zap

                        return (
                          <CommandItem
                            key={appliance._id}
                            value={appliance.name}
                            onSelect={() => handleSelect(appliance)}
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="p-1.5 md:p-2 bg-gray-100 rounded-lg flex-shrink-0">
                              <Icon className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                                {appliance.name}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500">
                                {appliance.powerWatts}W
                                {appliance.powerRangeMin &&
                                  appliance.powerRangeMax &&
                                  ` (${appliance.powerRangeMin}-${appliance.powerRangeMax}W)`}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <Badge variant="outline" className="text-[10px] md:text-xs">
                                {appliance.usageUnit === 'hours_per_day' && 'Timer/dag'}
                                {appliance.usageUnit === 'minutes_per_day' && 'Min/dag'}
                                {appliance.usageUnit === 'cycles_per_week' && 'Gange/uge'}
                                {appliance.usageUnit === 'always_on' && 'Altid tændt'}
                              </Badge>
                            </div>
                          </CommandItem>
                        )
                      })}
                  </CommandGroup>
                )
              })}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}