
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PriceExampleTable {
  _type: 'priceExampleTable'
  _key: string
  title: string
  leadingText: string
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
  console.log('PriceExampleTableComponent received block:', block)

  // Fixed consumption for calculation (100 kWh per month)
  const monthlyConsumption = 100

  // Calculate total prices
  const example1Total = (block.example1_kwh_price * monthlyConsumption) + block.example1_subscription
  const example2Total = (block.example2_kwh_price * monthlyConsumption) + block.example2_subscription

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} kr.`
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        {/* Title */}
        {block.title && (
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-dark text-center mb-6">
            {block.title}
          </h2>
        )}

        {/* Leading Text */}
        {block.leadingText && (
          <p className="text-lg lg:text-xl text-gray-700 text-center mb-12 leading-relaxed max-w-3xl mx-auto">
            {block.leadingText}
          </p>
        )}

        {/* Price Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-green hover:bg-brand-green">
                <TableHead className="text-white font-bold text-lg py-6 px-8">
                  Sammenligning
                </TableHead>
                <TableHead className="text-white font-bold text-lg py-6 px-8 text-center">
                  {block.example1_title}
                </TableHead>
                <TableHead className="text-white font-bold text-lg py-6 px-8 text-center">
                  {block.example2_title}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-800 py-6 px-8 border-r border-gray-200">
                  Pris pr. kWh
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-medium text-gray-700">
                  {formatCurrency(block.example1_kwh_price)}
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-medium text-gray-700">
                  {formatCurrency(block.example2_kwh_price)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-800 py-6 px-8 border-r border-gray-200">
                  Abonnement pr. måned
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-medium text-gray-700">
                  {formatCurrency(block.example1_subscription)}
                </TableCell>
                <TableCell className="text-center py-6 px-8 font-medium text-gray-700">
                  {formatCurrency(block.example2_subscription)}
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
