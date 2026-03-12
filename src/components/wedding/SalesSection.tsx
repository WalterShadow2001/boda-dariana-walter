'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Plus, Pencil, Trash2, User, CheckCircle, Clock, Package, RefreshCw, CreditCard, XCircle, Calendar, AlertCircle } from 'lucide-react'
import { Sale, PaymentStatus } from '@/stores/wedding-store'
import { useThemeStore } from '@/stores/theme-store'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface SalesSectionProps {
  sales: Sale[]
  onAddSale: (sale: { concept: string; amount: number; quantity: number; client: string; status: PaymentStatus; deliveryDate: string }) => void
  onUpdateSale: (saleId: string, sale: { concept: string; amount: number; quantity: number; client: string; status: PaymentStatus; deliveryDate: string }) => void
  onDeleteSale: (saleId: string) => void
}

const statusConfig: Record<PaymentStatus, { label: string; icon: typeof CheckCircle; colorKey: 'successColor' | 'warningColor' | 'primaryAccent' | 'goldAccent' | 'errorColor' }> = {
  paid: { label: 'Pagado', icon: CheckCircle, colorKey: 'successColor' },
  pending: { label: 'Pendiente', icon: Clock, colorKey: 'warningColor' },
  in_progress: { label: 'En proceso', icon: RefreshCw, colorKey: 'primaryAccent' },
  partial: { label: 'Parcial', icon: CreditCard, colorKey: 'goldAccent' },
  cancelled: { label: 'Cancelado', icon: XCircle, colorKey: 'errorColor' }
}

export function SalesSection({ sales, onAddSale, onUpdateSale, onDeleteSale }: SalesSectionProps) {
  const colors = useThemeStore((state) => state.colors)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [client, setClient] = useState('')
  const [status, setStatus] = useState<PaymentStatus>('pending')
  const [deliveryDate, setDeliveryDate] = useState('')

  const openAddModal = () => {
    setEditingSale(null)
    setConcept('')
    setAmount('')
    setQuantity('1')
    setClient('')
    setStatus('pending')
    setDeliveryDate('')
    setIsModalOpen(true)
  }

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale)
    setConcept(sale.concept)
    setAmount(sale.amount.toString())
    setQuantity((sale.quantity || 1).toString())
    setClient(sale.client)
    setStatus(sale.status)
    setDeliveryDate(sale.deliveryDate || '')
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (concept.trim() && amount && parseFloat(amount) > 0) {
      const saleData = {
        concept: concept.trim(),
        amount: parseFloat(amount),
        quantity: parseInt(quantity) || 1,
        client: client.trim(),
        status,
        deliveryDate: deliveryDate || ''
      }
      
      if (editingSale) {
        onUpdateSale(editingSale.id, saleData)
      } else {
        onAddSale(saleData)
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

  const formatDeliveryDate = (dateString: string) => {
    if (!dateString) return null
    try {
      return format(parseISO(dateString), "d MMM", { locale: es })
    } catch {
      return null
    }
  }

  const getDeliveryStatus = (dateString: string, saleStatus: PaymentStatus) => {
    if (!dateString || saleStatus === 'paid' || saleStatus === 'cancelled') return null
    
    const date = parseISO(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (isBefore(date, today)) {
      return { type: 'overdue', label: 'Atrasado', color: colors.errorColor }
    } else if (isToday(date)) {
      return { type: 'today', label: '¡Hoy!', color: colors.warningColor }
    } else if (isBefore(date, new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000))) {
      return { type: 'soon', label: 'Próximo', color: colors.goldAccent }
    }
    return null
  }

  // Calcular totales
  const totalQuantity = sales.reduce((sum, s) => sum + (s.quantity || 1), 0)
  const totalAmount = sales.reduce((sum, s) => sum + s.amount, 0)

  // Ordenar ventas por fecha de entrega
  const sortedSales = [...sales].sort((a, b) => {
    if (!a.deliveryDate && !b.deliveryDate) return 0
    if (!a.deliveryDate) return 1
    if (!b.deliveryDate) return -1
    return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
  })

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
              <DollarSign size={20} style={{ color: colors.goldAccent }} />
              Ventas
            </CardTitle>
            <Button
              size="sm"
              onClick={openAddModal}
              style={{ 
                background: `linear-gradient(to right, ${colors.goldAccent}, ${colors.goldAccent}dd)`,
                color: colors.primaryBg
              }}
            >
              <Plus size={14} className="mr-1" />
              Agregar
            </Button>
          </div>
          {sales.length > 0 && (
            <div className="flex gap-4 mt-2 text-xs" style={{ color: colors.mutedText }}>
              <span className="flex items-center gap-1">
                <Package size={12} />
                {totalQuantity} piezas
              </span>
              <span>
                {sales.length} ventas
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign 
                className="mx-auto mb-2 opacity-30" 
                size={40} 
                style={{ color: colors.mutedText }}
              />
              <p 
                className="text-sm"
                style={{ color: colors.mutedText }}
              >
                No hay ventas registradas
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <AnimatePresence>
                {sortedSales.map((sale) => {
                  const config = statusConfig[sale.status]
                  const statusColor = colors[config.colorKey]
                  const deliveryStatus = getDeliveryStatus(sale.deliveryDate, sale.status)
                  const formattedDate = formatDeliveryDate(sale.deliveryDate)
                  
                  return (
                    <motion.div
                      key={sale.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: colors.secondaryBg + '60' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p 
                            className="text-sm font-medium truncate"
                            style={{ color: colors.primaryText }}
                          >
                            {sale.concept}
                          </p>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5"
                            style={{ 
                              backgroundColor: colors.goldAccent + '15',
                              color: colors.goldAccent,
                              borderColor: colors.goldAccent + '40'
                            }}
                          >
                            <Package size={10} className="mr-1" />
                            {sale.quantity || 1}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5"
                            style={{ 
                              backgroundColor: statusColor + '15',
                              color: statusColor,
                              borderColor: statusColor + '40'
                            }}
                          >
                            <config.icon size={10} className="mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div 
                            className="flex items-center gap-1 text-xs"
                            style={{ color: colors.mutedText }}
                          >
                            <User size={12} />
                            {sale.client || 'Sin cliente'}
                          </div>
                          {formattedDate && (
                            <div 
                              className="flex items-center gap-1 text-xs"
                              style={{ color: deliveryStatus?.color || colors.mutedText }}
                            >
                              <Calendar size={12} />
                              {formattedDate}
                              {deliveryStatus && (
                                <span className="font-medium ml-1">
                                  ({deliveryStatus.label})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span 
                            className="text-sm font-semibold block"
                            style={{ color: colors.goldAccent }}
                          >
                            {formatCurrency(sale.amount)}
                          </span>
                          <span 
                            className="text-[10px] block"
                            style={{ color: colors.mutedText }}
                          >
                            {formatCurrency(sale.amount / (sale.quantity || 1))} c/u
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          style={{ color: colors.mutedText }}
                          onClick={() => openEditModal(sale)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          style={{ color: colors.mutedText }}
                          onClick={() => onDeleteSale(sale.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="sm:max-w-[450px]"
          style={{ 
            backgroundColor: colors.cardBg,
            borderColor: colors.borderColor
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: colors.primaryText }}>
              {editingSale ? 'Editar Venta' : 'Nueva Venta'}
            </DialogTitle>
            <DialogDescription style={{ color: colors.mutedText }}>
              {editingSale ? 'Modifica los detalles de la venta.' : 'Registra una nueva venta.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sale-concept" style={{ color: colors.primaryText }}>
                Concepto *
              </Label>
              <Input
                id="sale-concept"
                placeholder="Ej: Arreglo floral central"
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
                <Label htmlFor="sale-quantity" style={{ color: colors.primaryText }}>
                  Cantidad *
                </Label>
                <Input
                  id="sale-quantity"
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
                <Label htmlFor="sale-amount" style={{ color: colors.primaryText }}>
                  Monto Total *
                </Label>
                <Input
                  id="sale-amount"
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
                Precio por unidad: {formatCurrency(parseFloat(amount) / parseInt(quantity))}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="sale-client" style={{ color: colors.primaryText }}>
                Cliente
              </Label>
              <Input
                id="sale-client"
                placeholder="Para quién es..."
                value={client}
                onChange={(e) => setClient(e.target.value)}
                style={{ 
                  borderColor: colors.inputBorder,
                  color: colors.primaryText
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sale-delivery-date" style={{ color: colors.primaryText }}>
                <Calendar size={14} className="inline mr-1" />
                Fecha de Entrega
              </Label>
              <Input
                id="sale-delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                style={{ 
                  borderColor: colors.inputBorder,
                  color: colors.primaryText
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sale-status" style={{ color: colors.primaryText }}>
                Estado
              </Label>
              <Select value={status} onValueChange={(value: PaymentStatus) => setStatus(value)}>
                <SelectTrigger style={{ borderColor: colors.inputBorder }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon size={14} style={{ color: colors[config.colorKey] }} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                background: `linear-gradient(to right, ${colors.goldAccent}, ${colors.goldAccent}dd)`,
                color: colors.primaryBg,
                opacity: (!concept.trim() || !amount || parseFloat(amount) <= 0) ? 0.5 : 1
              }}
            >
              {editingSale ? 'Guardar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
