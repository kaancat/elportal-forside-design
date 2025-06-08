import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Type definitions for the data we expect from the API
interface PriceListData {
  GLN_Number: string;
  ChargeOwner: string; // This is the supplier name
  Note: string; // Description of the product
  Price1: number; // This is often the kWh price
  Price25: number; // This is often the subscription fee
}

interface RealPriceComparisonTableProps {
  block: {
    _type: 'realPriceComparisonTable';
    _key: string;
    title: string;
    leadingText?: string;
  };
}

const formatCurrency = (amount: number) => `${amount.toFixed(2)} kr.`;

const RealPriceComparisonTable: React.FC<RealPriceComparisonTableProps> = ({ block }) => {
  const [allSuppliers, setAllSuppliers] = useState<PriceListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSupplier1, setSelectedSupplier1] = useState<PriceListData | null>(null);
  const [selectedSupplier2, setSelectedSupplier2] = useState<PriceListData | null>(null);
  const [monthlyConsumption, setMonthlyConsumption] = useState(150); // Default consumption in kWh

  // Fetch the list of suppliers when the component mounts
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        // We will create this API route in the next part
        const response = await fetch('/api/pricelists'); 
        if (!response.ok) throw new Error('Kunne ikke hente prisdata.');
        const data = await response.json();
        
        // Filter for relevant consumer products (often marked with 'Privat') and remove duplicates
        const uniqueSuppliers = Array.from(new Map(data.records
            .filter((p: any) => p.Note?.includes('Privat'))
            .map((item: any) => [item.ChargeOwner, item])).values()
        ) as PriceListData[];

        setAllSuppliers(uniqueSuppliers);
        // Set initial suppliers to compare
        if (uniqueSuppliers.length >= 2) {
          setSelectedSupplier1(uniqueSuppliers[0]);
          setSelectedSupplier2(uniqueSuppliers[1]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const getSupplierDetails = (supplier: PriceListData | null) => {
    if (!supplier) return { kwhPrice: 0, subscription: 0, total: 0 };
    const kwhPrice = supplier.Price1 || 0;
    const subscription = supplier.Price25 || 0;
    const total = (kwhPrice * monthlyConsumption) + subscription;
    return { kwhPrice, subscription, total };
  };

  const supplier1Details = useMemo(() => getSupplierDetails(selectedSupplier1), [selectedSupplier1, monthlyConsumption]);
  const supplier2Details = useMemo(() => getSupplierDetails(selectedSupplier2), [selectedSupplier2, monthlyConsumption]);

  if (loading) return <div className="text-center py-16">Indlæser prisdata...</div>;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-6">{block.title}</h2>
        {block.leadingText && (
          <p className="text-lg text-gray-600 text-center mb-12">{block.leadingText}</p>
        )}

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-white p-6 rounded-lg shadow-sm border">
          <div>
            <Label className="font-semibold text-gray-700">Vælg Elselskab 1</Label>
            <Select onValueChange={(gln) => setSelectedSupplier1(allSuppliers.find(s => s.GLN_Number === gln) || null)} value={selectedSupplier1?.GLN_Number}>
              <SelectTrigger><SelectValue placeholder="Vælg et selskab" /></SelectTrigger>
              <SelectContent>{allSuppliers.map(s => <SelectItem key={s.GLN_Number} value={s.GLN_Number}>{s.ChargeOwner}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-semibold text-gray-700">Vælg Elselskab 2</Label>
            <Select onValueChange={(gln) => setSelectedSupplier2(allSuppliers.find(s => s.GLN_Number === gln) || null)} value={selectedSupplier2?.GLN_Number}>
              <SelectTrigger><SelectValue placeholder="Vælg et selskab" /></SelectTrigger>
              <SelectContent>{allSuppliers.map(s => <SelectItem key={s.GLN_Number} value={s.GLN_Number}>{s.ChargeOwner}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-600 hover:bg-green-600">
                <TableHead className="text-white font-bold text-lg py-6 px-8">Sammenligning</TableHead>
                <TableHead className="text-white font-bold text-base py-6 px-8 text-center">{selectedSupplier1?.ChargeOwner || 'Selskab 1'}</TableHead>
                <TableHead className="text-white font-bold text-base py-6 px-8 text-center">{selectedSupplier2?.ChargeOwner || 'Selskab 2'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-gray-800 py-6 px-8">Pris pr. kWh</TableCell>
                <TableCell className="text-center py-6 px-8">{formatCurrency(supplier1Details.kwhPrice)}</TableCell>
                <TableCell className="text-center py-6 px-8">{formatCurrency(supplier2Details.kwhPrice)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-gray-800 py-6 px-8">Abonnement pr. måned</TableCell>
                <TableCell className="text-center py-6 px-8">{formatCurrency(supplier1Details.subscription)}</TableCell>
                <TableCell className="text-center py-6 px-8">{formatCurrency(supplier2Details.subscription)}</TableCell>
              </TableRow>
              <TableRow className="bg-gray-50 border-t-2 border-green-500">
                <TableCell className="font-bold text-gray-900 py-6 px-8">
                  Samlet pris pr. måned
                  <div className="text-sm font-normal text-gray-600 mt-1">
                    ved {monthlyConsumption} kWh forbrug
                  </div>
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-bold text-lg">{formatCurrency(supplier1Details.total)}</TableCell>
                <TableCell className="text-center py-6 px-8 font-bold text-lg">{formatCurrency(supplier2Details.total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Consumption Slider */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
            <Label htmlFor="consumption" className="font-semibold text-gray-700">Juster dit månedlige forbrug (kWh)</Label>
            <div className="flex items-center gap-4 mt-2">
                <Slider
                    id="consumption"
                    min={10} max={1000} step={10}
                    value={[monthlyConsumption]}
                    onValueChange={(value) => setMonthlyConsumption(value[0])}
                />
                <span className="font-bold text-gray-800 w-24 text-center">{monthlyConsumption} kWh</span>
            </div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-6">* Priser hentes live fra EnergiDataService og er vejledende.</p>
      </div>
    </section>
  );
};

export default RealPriceComparisonTable; 