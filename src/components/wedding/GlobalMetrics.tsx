'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  Clock,
  PiggyBank,
  Pencil,
  Wallet,
  Package,
  ShoppingCart,
  Receipt
} from 'lucide-react'
import { useWeddingStore } from '@/stores/wedding-store'
import { useThemeStore } from '@/stores/theme-store'
import { motion } from 'framer-motion'

export function GlobalMetrics() {
  const { savingsGoal, setSavingsGoal, getGlobalTotals } = useWeddingStore()
  const colors = useThemeStore((state) => state.colors)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  
  const totals = getGlobalTotals()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleSaveGoal = async () => {
    const goal = parseFloat(newGoal)
    if (!isNaN(goal) && goal >= 0) {
      await setSavingsGoal(goal)
    }
    setIsGoalModalOpen(false)
  }

  const openGoalModal = () => {
    setNewGoal(savingsGoal.toString())
    setIsGoalModalOpen(true)
  }

  const financialCards = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(totals.totalSales),
      icon: DollarSign,
      color: colors.goldAccent,
      bgColor: colors.goldAccent + '15'
    },
    {
      title: 'Ventas Pagadas',
      value: formatCurrency(totals.paidSales),
      icon: CheckCircle,
      color: colors.successColor,
      bgColor: colors.successColor + '15'
    },
    {
      title: 'Ventas Pendientes',
      value: formatCurrency(totals.pendingSales),
      icon: Clock,
      color: colors.warningColor,
      bgColor: colors.warningColor + '15'
    },
    {
      title: 'Total Gastos',
      value: formatCurrency(totals.totalExpenses),
      icon: TrendingDown,
      color: colors.errorColor,
      bgColor: colors.errorColor + '15'
    }
  ]

  const quantityCards = [
    {
      title: 'Piezas Vendidas',
      value: totals.totalQuantitySold,
      subtitle: `${totals.totalSalesCount} ventas`,
      icon: Package,
      color: colors.goldAccent,
      bgColor: colors.goldAccent + '15'
    },
    {
      title: 'Artículos Comprados',
      value: totals.totalQuantityPurchased,
      subtitle: `${totals.totalExpensesCount} gastos`,
      icon: ShoppingCart,
      color: colors.errorColor,
      bgColor: colors.errorColor + '15'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {financialCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              style={{ 
                backgroundColor: card.bgColor,
                borderColor: card.color + '40'
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon size={18} style={{ color: card.color }} />
                  <span className="text-xs" style={{ color: colors.mutedText }}>
                    {card.title}
                  </span>
                </div>
                <p className="text-lg font-bold" style={{ color: card.color }}>
                  {card.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quantity Cards */}
      <div className="grid grid-cols-2 gap-3">
        {quantityCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card 
              style={{ 
                backgroundColor: card.bgColor,
                borderColor: card.color + '40'
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon size={18} style={{ color: card.color }} />
                  <span className="text-xs" style={{ color: colors.mutedText }}>
                    {card.title}
                  </span>
                </div>
                <p className="text-2xl font-bold" style={{ color: card.color }}>
                  {card.value}
                </p>
                <p className="text-xs mt-1" style={{ color: colors.mutedText }}>
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Net Profit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card 
          style={{ 
            background: `linear-gradient(to right, ${totals.netProfit >= 0 ? colors.successColor + '10' : colors.errorColor + '10'}, ${totals.netProfit >= 0 ? colors.successColor + '05' : colors.errorColor + '05'})`,
            borderColor: totals.netProfit >= 0 ? colors.successColor + '30' : colors.errorColor + '30'
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: totals.netProfit >= 0 ? colors.successColor + '20' : colors.errorColor + '20' }}
                >
                  {totals.netProfit >= 0 ? (
                    <TrendingUp size={24} style={{ color: colors.successColor }} />
                  ) : (
                    <TrendingDown size={24} style={{ color: colors.errorColor }} />
                  )}
                </div>
                <div>
                  <p className="text-sm" style={{ color: colors.mutedText }}>
                    Ganancia Neta Total
                  </p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: totals.netProfit >= 0 ? colors.successColor : colors.errorColor }}
                  >
                    {formatCurrency(totals.netProfit)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: colors.mutedText }}>Margen</p>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: totals.netProfit >= 0 ? colors.successColor : colors.errorColor }}
                >
                  {totals.totalSales > 0 ? ((totals.netProfit / totals.totalSales) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Savings Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card style={{ borderColor: colors.borderColor }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle 
                className="text-base flex items-center gap-2"
                style={{ color: colors.primaryText }}
              >
                <Target size={18} style={{ color: colors.primaryAccent }} />
                Meta de Ahorro
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={openGoalModal}
                className="h-8 w-8 p-0"
                style={{ color: colors.mutedText }}
              >
                <Pencil size={14} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {savingsGoal > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank size={20} style={{ color: colors.primaryAccent }} />
                    <span style={{ color: colors.secondaryText }}>
                      Meta: {formatCurrency(savingsGoal)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet size={16} style={{ color: colors.goldAccent }} />
                    <span 
                      className="font-semibold"
                      style={{ color: colors.primaryText }}
                    >
                      {formatCurrency(totals.netProfit)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: colors.mutedText }}>Progreso</span>
                    <span 
                      className="font-medium"
                      style={{ color: totals.progressPercentage >= 100 ? colors.successColor : colors.primaryAccent }}
                    >
                      {totals.progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={totals.progressPercentage} 
                    className="h-3"
                    style={{
                      backgroundColor: colors.secondaryBg
                    }}
                  />
                  <p 
                    className="text-xs text-center"
                    style={{ color: colors.mutedText }}
                  >
                    {totals.progressPercentage >= 100 
                      ? '🎉 ¡Meta alcanzada!' 
                      : `Faltan ${formatCurrency(savingsGoal - totals.netProfit)} para la meta`
                    }
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Target size={40} className="mx-auto mb-3" style={{ color: colors.mutedText + '60' }} />
                <p style={{ color: colors.mutedText }} className="mb-3">
                  No has establecido una meta de ahorro
                </p>
                <Button
                  onClick={openGoalModal}
                  style={{ 
                    background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
                    color: colors.primaryBg
                  }}
                >
                  <Target size={16} className="mr-2" />
                  Establecer Meta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Goal Modal */}
      <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
        <DialogContent 
          className="sm:max-w-[400px]"
          style={{ 
            backgroundColor: colors.cardBg,
            borderColor: colors.borderColor
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: colors.primaryText }}>
              Meta de Ahorro
            </DialogTitle>
            <DialogDescription style={{ color: colors.mutedText }}>
              Establece la cantidad que quieres ahorrar para la boda
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="goal" style={{ color: colors.secondaryText }}>
              Cantidad de la meta
            </Label>
            <div className="relative mt-2">
              <DollarSign 
                className="absolute left-3 top-1/2 -translate-y-1/2" 
                size={18}
                style={{ color: colors.mutedText }}
              />
              <Input
                id="goal"
                type="number"
                placeholder="0"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="pl-10"
                style={{ 
                  borderColor: colors.inputBorder,
                  color: colors.primaryText
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsGoalModalOpen(false)}
              style={{ color: colors.mutedText }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveGoal}
              style={{ 
                background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
                color: colors.primaryBg
              }}
            >
              Guardar Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
