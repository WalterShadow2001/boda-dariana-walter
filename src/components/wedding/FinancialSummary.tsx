'use client'

import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock, Package, ShoppingCart } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'

interface FinancialSummaryProps {
  totalSales: number
  paidSales: number
  pendingSales: number
  totalExpenses: number
  netProfit: number
  totalQuantitySold?: number
  totalQuantityPurchased?: number
}

export function FinancialSummary({ 
  totalSales, 
  paidSales, 
  pendingSales, 
  totalExpenses, 
  netProfit,
  totalQuantitySold = 0,
  totalQuantityPurchased = 0
}: FinancialSummaryProps) {
  const colors = useThemeStore((state) => state.colors)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const financialCards = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(totalSales),
      icon: DollarSign,
      color: colors.goldAccent,
      bgColor: colors.goldAccent + '15',
      borderColor: colors.goldAccent + '40'
    },
    {
      title: 'Ventas Pagadas',
      value: formatCurrency(paidSales),
      icon: CheckCircle,
      color: colors.successColor,
      bgColor: colors.successColor + '15',
      borderColor: colors.successColor + '40'
    },
    {
      title: 'Ventas Pendientes',
      value: formatCurrency(pendingSales),
      icon: Clock,
      color: colors.warningColor,
      bgColor: colors.warningColor + '15',
      borderColor: colors.warningColor + '40'
    },
    {
      title: 'Total Gastos',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: colors.errorColor,
      bgColor: colors.errorColor + '15',
      borderColor: colors.errorColor + '40'
    }
  ]

  const quantityCards = [
    {
      title: 'Piezas Vendidas',
      value: totalQuantitySold,
      icon: Package,
      color: colors.goldAccent,
      bgColor: colors.goldAccent + '15',
      borderColor: colors.goldAccent + '40'
    },
    {
      title: 'Artículos Comprados',
      value: totalQuantityPurchased,
      icon: ShoppingCart,
      color: colors.errorColor,
      bgColor: colors.errorColor + '15',
      borderColor: colors.errorColor + '40'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {financialCards.map((card) => (
          <Card 
            key={card.title} 
            style={{ 
              backgroundColor: card.bgColor,
              borderColor: card.borderColor
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon size={18} style={{ color: card.color }} />
                <span 
                  className="text-xs"
                  style={{ color: colors.secondaryText }}
                >
                  {card.title}
                </span>
              </div>
              <p className="text-lg font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quantity Cards */}
      <div className="grid grid-cols-2 gap-3">
        {quantityCards.map((card) => (
          <Card 
            key={card.title} 
            style={{ 
              backgroundColor: card.bgColor,
              borderColor: card.borderColor
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon size={18} style={{ color: card.color }} />
                <span 
                  className="text-xs"
                  style={{ color: colors.secondaryText }}
                >
                  {card.title}
                </span>
              </div>
              <p className="text-xl font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Net Profit */}
      <Card 
        style={{ 
          background: netProfit >= 0 
            ? `linear-gradient(to right, ${colors.successColor}10, ${colors.successColor}05)` 
            : `linear-gradient(to right, ${colors.errorColor}10, ${colors.errorColor}05)`,
          borderColor: netProfit >= 0 ? colors.successColor + '30' : colors.errorColor + '30'
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: netProfit >= 0 ? colors.successColor + '20' : colors.errorColor + '20'
                }}
              >
                {netProfit >= 0 ? (
                  <TrendingUp size={24} style={{ color: colors.successColor }} />
                ) : (
                  <TrendingDown size={24} style={{ color: colors.errorColor }} />
                )}
              </div>
              <div>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  Ganancia Neta
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: netProfit >= 0 ? colors.successColor : colors.errorColor }}
                >
                  {formatCurrency(netProfit)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p 
                className="text-xs"
                style={{ color: colors.mutedText }}
              >
                Margen
              </p>
              <p 
                className="text-sm font-semibold"
                style={{ color: netProfit >= 0 ? colors.successColor : colors.errorColor }}
              >
                {totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
