'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Receipt, Plus, Pencil, Trash2, FileText, Package } from 'lucide-react'
import { Expense } from '@/stores/wedding-store'
import { useThemeStore } from '@/stores/theme-store'
import { motion, AnimatePresence } from 'framer-motion'

interface ExpensesSectionProps {
  expenses: Expense[]
  onAddExpense: (expense: { concept: string; amount: number; quantity: number; notes: string }) => void
  onUpdateExpense: (expenseId: string, expense: { concept: string; amount: number; quantity: number; notes: string }) => void
  onDeleteExpense: (expenseId: string) => void
}

export function ExpensesSection({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }: ExpensesSectionProps) {
  const colors = useThemeStore((state) => state.colors)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')

  const openAddModal = () => {
    setEditingExpense(null)
    setConcept('')
    setAmount('')
    setQuantity('1')
    setNotes('')
    setIsModalOpen(true)
  }

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense)
    setConcept(expense.concept)
    setAmount(expense.amount.toString())
    setQuantity((expense.quantity || 1).toString())
    setNotes(expense.notes)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (concept.trim() && amount && parseFloat(amount) > 0) {
      const expenseData = {
        concept: concept.trim(),
        amount: parseFloat(amount),
        quantity: parseInt(quantity) || 1,
        notes: notes.trim()
      }
      
      if (editingExpense) {
        onUpdateExpense(editingExpense.id, expenseData)
      } else {
        onAddExpense(expenseData)
      }
      
      setIsModalOpen(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Calcular totales
  const totalQuantity = expenses.reduce((sum, e) => sum + (e.quantity || 1), 0)
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <>
      <Card style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.borderColor
      }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle 
              className="text-lg flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Receipt size={20} style={{ color: colors.errorColor }} />
              Gastos
            </CardTitle>
            <Button
              size="sm"
              onClick={openAddModal}
              style={{ 
                background: `linear-gradient(to right, ${colors.errorColor}, ${colors.errorColor}dd)`,
                color: 'white'
              }}
            >
              <Plus size={14} className="mr-1" />
              Agregar
            </Button>
          </div>
          {expenses.length > 0 && (
            <div className="flex gap-4 mt-2 text-xs" style={{ color: colors.mutedText }}>
              <span className="flex items-center gap-1">
                <Package size={12} />
                {totalQuantity} artículos
              </span>
              <span>
                {expenses.length} gastos
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt 
                className="mx-auto mb-2 opacity-30" 
                size={40} 
                style={{ color: colors.mutedText }}
              />
              <p 
                className="text-sm"
                style={{ color: colors.mutedText }}
              >
                No hay gastos registrados
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <AnimatePresence>
                {expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: colors.errorColor + '10' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p 
                          className="text-sm font-medium truncate"
                          style={{ color: colors.primaryText }}
                        >
                          {expense.concept}
                        </p>
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1.5"
                          style={{ 
                            backgroundColor: colors.errorColor + '15',
                            color: colors.errorColor,
                            borderColor: colors.errorColor + '40'
                          }}
                        >
                          <Package size={10} className="mr-1" />
                          {expense.quantity || 1}
                        </Badge>
                      </div>
                      {expense.notes && (
                        <div 
                          className="flex items-center gap-1 mt-1 text-xs"
                          style={{ color: colors.mutedText }}
                        >
                          <FileText size={12} />
                          <span className="truncate">{expense.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span 
                          className="text-sm font-semibold block"
                          style={{ color: colors.errorColor }}
                        >
                          -{formatCurrency(expense.amount)}
                        </span>
                        <span 
                          className="text-[10px] block"
                          style={{ color: colors.mutedText }}
                        >
                          {formatCurrency(expense.amount / (expense.quantity || 1))} c/u
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        style={{ color: colors.mutedText }}
                        onClick={() => openEditModal(expense)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        style={{ color: colors.mutedText }}
                        onClick={() => onDeleteExpense(expense.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="sm:max-w-[400px]"
          style={{ 
            backgroundColor: colors.cardBg,
            borderColor: colors.borderColor
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: colors.primaryText }}>
              {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            </DialogTitle>
            <DialogDescription style={{ color: colors.mutedText }}>
              {editingExpense ? 'Modifica los detalles del gasto.' : 'Registra un nuevo gasto.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="expense-concept" style={{ color: colors.primaryText }}>
                Concepto *
              </Label>
              <Input
                id="expense-concept"
                placeholder="Ej: Flores para decoración"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                style={{ 
                  borderColor: colors.inputBorder,
                  color: colors.primaryText
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="expense-quantity" style={{ color: colors.primaryText }}>
                  Cantidad *
                </Label>
                <Input
                  id="expense-quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ 
                    borderColor: colors.inputBorder,
                    color: colors.primaryText
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expense-amount" style={{ color: colors.primaryText }}>
                  Monto Total *
                </Label>
                <Input
                  id="expense-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ 
                    borderColor: colors.inputBorder,
                    color: colors.primaryText
                  }}
                />
              </div>
            </div>
            {quantity && parseInt(quantity) > 1 && amount && parseFloat(amount) > 0 && (
              <div className="text-xs p-2 rounded" style={{ backgroundColor: colors.secondaryBg, color: colors.mutedText }}>
                Costo por unidad: {formatCurrency(parseFloat(amount) / parseInt(quantity))}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="expense-notes" style={{ color: colors.primaryText }}>
                Notas
              </Label>
              <Textarea
                id="expense-notes"
                placeholder="Detalles adicionales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] resize-none"
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
              onClick={() => setIsModalOpen(false)}
              style={{ color: colors.mutedText }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!concept.trim() || !amount || parseFloat(amount) <= 0}
              style={{ 
                background: `linear-gradient(to right, ${colors.errorColor}, ${colors.errorColor}dd)`,
                color: 'white',
                opacity: (!concept.trim() || !amount || parseFloat(amount) <= 0) ? 0.5 : 1
              }}
            >
              {editingExpense ? 'Guardar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
