import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { RealPriceComparisonTable, ProviderProductBlock } from '../types/sanity';

const formatCurrency = (amount: number) => `${amount.toFixed(2)} kr.`;

interface RealPriceComparisonTableProps {
  block: RealPriceComparisonTable;
}

const RealPriceComparisonTable: React.FC<RealPriceComparisonTableProps> = ({ block }) => {
  const [selectedProvider1, setSelectedProvider1] = useState<ProviderProductBlock | null>(null);
  const [selectedProvider2, setSelectedProvider2] = useState<ProviderProductBlock | null>(null);
  const [monthlyConsumption, setMonthlyConsumption] = useState(150);

  const { allProviders, title, leadingText } = block;

  const handleSelect1 = (providerId: string) => {
    const provider = allProviders.find(p => p.id === providerId) || null;
    setSelectedProvider1(provider);
  };

  const handleSelect2 = (providerId: string) => {
    const provider = allProviders.find(p => p.id === providerId) || null;
    setSelectedProvider2(provider);
  };

  const getPriceDetails = (provider: ProviderProductBlock | null) => {
    if (!provider) {
      return { tillæg: 0, subscription: 0, total: 0 };
    }
    
    const tillæg = provider.kwhMarkup ? provider.kwhMarkup / 100 : 0;
    const subscription = provider.monthlySubscription || 0;
    
    const total = (tillæg * monthlyConsumption) + subscription;
    
    return { tillæg, subscription, total };
  };

  const details1 = useMemo(() => getPriceDetails(selectedProvider1), [selectedProvider1, monthlyConsumption]);
  const details2 = useMemo(() => getPriceDetails(selectedProvider2), [selectedProvider2, monthlyConsumption]);
  
  if (!allProviders || allProviders.length === 0) {
    return <div className="text-center py-16">Konfigurer venligst udbydere i Sanity.</div>;
  }

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        {title && <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-6 font-display">{title}</h2>}
        {leadingText && <p className="text-lg text-gray-600 text-center mb-12">{leadingText}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-white p-6 rounded-lg shadow-sm border">
          <div>
            <Label className="font-semibold text-gray-700">Vælg Elselskab 1</Label>
            <Select onValueChange={handleSelect1}>
              <SelectTrigger><SelectValue placeholder="Vælg et selskab" /></SelectTrigger>
              <SelectContent>{allProviders.map(p => <SelectItem key={p.id} value={p.id}>{p.providerName} - {p.productName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-semibold text-gray-700">Vælg Elselskab 2</Label>
            <Select onValueChange={handleSelect2}>
              <SelectTrigger><SelectValue placeholder="Vælg et selskab" /></SelectTrigger>
              <SelectContent>{allProviders.map(p => <SelectItem key={p.id} value={p.id}>{p.providerName} - {p.productName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-600 hover:bg-green-600">
                <TableHead className="text-white font-bold text-lg py-6 px-8">Sammenligning</TableHead>
                <TableHead className="text-white font-bold text-base py-6 px-8 text-center">{selectedProvider1?.productName || 'Selskab 1'}</TableHead>
                <TableHead className="text-white font-bold text-base py-6 px-8 text-center">{selectedProvider2?.productName || 'Selskab 2'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-gray-800 py-6 px-8">Tillæg pr. kWh</TableCell>
                <TableCell className="text-center py-6 px-8">{formatCurrency(details1.tillæg)}</TableCell>
                <TableCell className="text-center py-6 px-8">{formatCurrency(details2.tillæg)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-gray-800 py-6 px-8">Abonnement pr. måned</TableCell>
                <TableCell className="text-center py-6 px-8">{formatCurrency(details1.subscription)}</TableCell>
                <TableCell className="text-center py-6 px-8">{formatCurrency(details2.subscription)}</TableCell>
              </TableRow>
              <TableRow className="bg-gray-50 border-t-2 border-green-500">
                <TableCell className="font-bold text-gray-900 py-6 px-8">
                  Estimeret pris pr. måned
                  <div className="text-sm font-normal text-gray-600 mt-1">ved {monthlyConsumption} kWh forbrug</div>
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-bold text-lg">{formatCurrency(details1.total)}</TableCell>
                <TableCell className="text-center py-6 px-8 font-bold text-lg">{formatCurrency(details2.total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
            <Label htmlFor="consumption-slider-2" className="font-semibold text-gray-700">Juster dit månedlige forbrug (kWh)</Label>
            <div className="flex items-center gap-4 mt-2">
                <Slider
                    id="consumption-slider-2"
                    min={50} max={850} step={10}
                    value={[monthlyConsumption]}
                    onValueChange={(value) => setMonthlyConsumption(value[0])}
                />
                <span className="font-bold text-gray-800 w-24 text-center">{monthlyConsumption} kWh</span>
            </div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-6">* Priserne er baseret på dit valg og inkluderer ikke spotpris, skatter og afgifter.</p>
      </div>
    </section>
  );
};

export default RealPriceComparisonTable; 