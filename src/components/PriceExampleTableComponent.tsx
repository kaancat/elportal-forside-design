import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PortableText } from '@portabletext/react'

interface PriceExampleTable {
  _type: 'priceExampleTable'
  _key: string
  title: string
  leadingText: any[]
  example1_title: string
  example1_kwh_price: number
  example1_subscription: number
  example2_title: string
  example2_kwh_price: number
  example2_subscription: number
}

interface PriceExampleTableComponentProps {
  block: PriceExampleTable
}

const PriceExampleTableComponent: React.FC<PriceExampleTableComponentProps> = ({ block }) => {
  // Debug logging to check received data
  console.log('PriceExampleTable block:', block)
  
  // Add safety check for block
  if (!block) {
    console.error('PriceExampleTable: block is undefined')
    return <div className="text-center text-red-500 py-8">Price table data is missing</div>
  }

  // Use fallback values if fields are missing
  const example1_title = block.example1_title || 'Standard Elaftale'
  const example1_kwh_price = block.example1_kwh_price ?? 2.50  // Default 2.50 kr/kWh
  const example1_subscription = block.example1_subscription ?? 39  // Default 39 kr/month
  const example2_title = block.example2_title || 'Vindstød Elaftale'
  const example2_kwh_price = block.example2_kwh_price ?? 2.00  // Default 2.00 kr/kWh
  const example2_subscription = block.example2_subscription ?? 29  // Default 29 kr/month
  
  console.log('Example 1 - kwh_price:', example1_kwh_price, 'subscription:', example1_subscription)
  console.log('Example 2 - kwh_price:', example2_kwh_price, 'subscription:', example2_subscription)

  // Fixed consumption for calculation (100 kWh per month)
  const monthlyConsumption = 100

  // Calculate total prices
  const example1Total = (example1_kwh_price * monthlyConsumption) + example1_subscription
  const example2Total = (example2_kwh_price * monthlyConsumption) + example2_subscription
  
  console.log('Calculated totals - Example1:', example1Total, 'Example2:', example2Total)

  // Format currency with null safety
  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = amount ?? 0
    return `${safeAmount.toFixed(2)} kr.`
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        {/* Title */}
        {block.title && (
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-brand-dark text-center mb-6">
            {block.title}
          </h2>
        )}

        {/* Leading Text */}
        {block.leadingText && (
          <div className="text-lg lg:text-xl text-gray-700 text-center mb-12 leading-relaxed max-w-3xl mx-auto prose">
            <PortableText value={block.leadingText} />
          </div>
        )}

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4">
          {/* Example 1 Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-brand-green p-4">
              <h3 className="text-white font-bold text-lg text-center">
                {example1_title}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-800">Pris pr. kWh</span>
                <span className="font-medium text-gray-700">{formatCurrency(example1_kwh_price)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-800">Abonnement pr. måned</span>
                <span className="font-medium text-gray-700">{formatCurrency(example1_subscription)}</span>
              </div>
              <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Samlet pris pr. måned</p>
                    <p className="text-sm text-gray-600">(ved {monthlyConsumption} kWh forbrug)</p>
                  </div>
                  <span className="font-bold text-lg text-brand-dark">{formatCurrency(example1Total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Example 2 Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-brand-green p-4">
              <h3 className="text-white font-bold text-lg text-center">
                {example2_title}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-800">Pris pr. kWh</span>
                <span className="font-medium text-gray-700">{formatCurrency(example2_kwh_price)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-800">Abonnement pr. måned</span>
                <span className="font-medium text-gray-700">{formatCurrency(example2_subscription)}</span>
              </div>
              <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Samlet pris pr. måned</p>
                    <p className="text-sm text-gray-600">(ved {monthlyConsumption} kWh forbrug)</p>
                  </div>
                  <span className="font-bold text-lg text-brand-dark">{formatCurrency(example2Total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Highlight (if example2 is cheaper) */}
          {example2Total < example1Total && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 font-semibold">
                Spar {formatCurrency(example1Total - example2Total)} pr. måned med {example2_title}!
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-green hover:bg-brand-green">
                <TableHead className="text-white font-bold text-lg py-6 px-8">
                  Sammenligning
                </TableHead>
                <TableHead className="text-white font-bold text-lg py-6 px-8 text-center">
                  {example1_title}
                </TableHead>
                <TableHead className="text-white font-bold text-lg py-6 px-8 text-center">
                  {example2_title}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-800 py-6 px-8 border-r border-gray-200">
                  Pris pr. kWh
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-medium text-gray-700">
                  {formatCurrency(example1_kwh_price)}
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-medium text-gray-700">
                  {formatCurrency(example2_kwh_price)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-800 py-6 px-8 border-r border-gray-200">
                  Abonnement pr. måned
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-medium text-gray-700">
                  {formatCurrency(example1_subscription)}
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-medium text-gray-700">
                  {formatCurrency(example2_subscription)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors border-t-2 border-brand-green">
                <TableCell className="font-bold text-gray-900 py-6 px-8 border-r border-gray-200">
                  Samlet pris pr. måned
                  <div className="text-sm font-normal text-gray-600 mt-1">
                    (ved {monthlyConsumption} kWh forbrug)
                  </div>
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-bold text-lg text-brand-dark">
                  {formatCurrency(example1Total)}
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-bold text-lg text-brand-dark">
                  {formatCurrency(example2Total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Additional info */}
        <p className="text-sm text-gray-500 text-center mt-6">
          * Priserne er eksempler og kan variere. Kontakt leverandørerne for aktuelle priser.
        </p>
      </div>
    </section>
  )
}

export default PriceExampleTableComponent
