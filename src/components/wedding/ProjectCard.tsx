'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderOpen, Heart, DollarSign, TrendingUp, Trash2, Calendar, Ticket, Users, Hash } from 'lucide-react'
import { Project, useWeddingStore } from '@/stores/wedding-store'
import { useThemeStore } from '@/stores/theme-store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProjectCardProps {
  project: Project
  onSelect: () => void
  onDelete: () => void
}

export function ProjectCard({ project, onSelect, onDelete }: ProjectCardProps) {
  const { getProjectTotals } = useWeddingStore()
  const colors = useThemeStore((state) => state.colors)
  const totals = getProjectTotals(project.id)
  const isRaffle = project.type === 'raffle'

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM, yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Raffle-specific stats
  const soldNumbers = project.raffle?.participants.length ?? 0
  const paidCount = project.raffle?.participants.filter(p => p.is_paid).length ?? 0
  const availableNumbers = (project.totalNumbers || 100) - soldNumbers

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.borderColor
      }}
    >
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-20 h-20 rotate-45 transform origin-bottom-left"
          style={{ background: isRaffle ? `linear-gradient(135deg, ${colors.secondaryBg}, ${colors.goldAccent}20)` : `linear-gradient(135deg, ${colors.secondaryBg}, ${colors.primaryAccent}20)` }}
        />
      </div>

      {/* Type badge */}
      {isRaffle && (
        <div className="absolute top-3 right-3 z-10">
          <Badge
            className="text-[10px] px-2 py-0.5"
            style={{
              backgroundColor: colors.goldAccent + '20',
              color: colors.goldAccent,
              borderColor: colors.goldAccent + '40'
            }}
          >
            <Ticket size={10} className="mr-1" />
            RIFA
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: isRaffle
                  ? `linear-gradient(135deg, ${colors.secondaryBg}, ${colors.goldAccent}30)`
                  : `linear-gradient(135deg, ${colors.secondaryBg}, ${colors.primaryAccent}30)`
              }}
            >
              {isRaffle ? (
                <Ticket size={18} style={{ color: colors.goldAccent }} />
              ) : (
                <Heart size={18} style={{ color: colors.primaryAccent }} fill={colors.primaryAccent} />
              )}
            </div>
            <div>
              <CardTitle
                className="text-lg transition-colors"
                style={{ color: colors.primaryText }}
              >
                {project.name}
              </CardTitle>
              <CardDescription
                className="text-xs flex items-center gap-1 mt-1"
                style={{ color: colors.mutedText }}
              >
                <Calendar size={12} />
                {formatDate(project.createdAt)}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {project.description && !isRaffle && (
          <p
            className="text-sm line-clamp-2 mb-4"
            style={{ color: colors.secondaryText }}
          >
            {project.description}
          </p>
        )}

        {isRaffle ? (
          /* Raffle stats */
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-lg p-2.5"
              style={{ backgroundColor: colors.secondaryBg + '80' }}
            >
              <div className="flex items-center gap-1.5 text-xs mb-1">
                <Hash size={12} style={{ color: colors.goldAccent }} />
                <span style={{ color: colors.mutedText }}>Monto</span>
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                {formatCurrency(project.amountPerNumber)}
              </p>
              <p className="text-[10px] mt-1" style={{ color: colors.mutedText }}>
                por número
              </p>
            </div>

            <div
              className="rounded-lg p-2.5"
              style={{ backgroundColor: colors.secondaryBg + '80' }}
            >
              <div className="flex items-center gap-1.5 text-xs mb-1">
                <Users size={12} style={{ color: colors.primaryAccent }} />
                <span style={{ color: colors.mutedText }}>Vendidos</span>
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                {soldNumbers}/{project.totalNumbers || 100}
              </p>
              <div className="flex gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{
                    backgroundColor: colors.successColor + '15',
                    color: colors.successColor,
                    borderColor: colors.successColor + '40'
                  }}
                >
                  {paidCount} pagados
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          /* Project stats (original) */
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-lg p-2.5"
              style={{ backgroundColor: colors.secondaryBg + '80' }}
            >
              <div className="flex items-center gap-1.5 text-xs mb-1">
                <DollarSign size={12} style={{ color: colors.goldAccent }} />
                <span style={{ color: colors.mutedText }}>Ventas</span>
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                {formatCurrency(totals.totalSales)}
              </p>
              <div className="flex gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{
                    backgroundColor: colors.successColor + '15',
                    color: colors.successColor,
                    borderColor: colors.successColor + '40'
                  }}
                >
                  {formatCurrency(totals.paidSales)}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{
                    backgroundColor: colors.warningColor + '15',
                    color: colors.warningColor,
                    borderColor: colors.warningColor + '40'
                  }}
                >
                  {formatCurrency(totals.pendingSales)}
                </Badge>
              </div>
            </div>

            <div
              className="rounded-lg p-2.5"
              style={{ backgroundColor: colors.secondaryBg + '80' }}
            >
              <div className="flex items-center gap-1.5 text-xs mb-1">
                <TrendingUp size={12} style={{ color: colors.errorColor }} />
                <span style={{ color: colors.mutedText }}>Gastos</span>
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                {formatCurrency(totals.totalExpenses)}
              </p>
              <p
                className="text-[10px] mt-1"
                style={{ color: colors.mutedText }}
              >
                {project.expenses.length} registro{project.expenses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Total recaudado para rifas / Ganancia neta para proyectos */}
        <div
          className="mt-3 p-2 rounded-lg"
          style={{
            backgroundColor: isRaffle
              ? colors.goldAccent + '10'
              : (totals.netProfit >= 0 ? colors.successColor + '10' : colors.errorColor + '10')
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs"
              style={{ color: colors.secondaryText }}
            >
              {isRaffle ? 'Total Recaudado' : 'Ganancia Neta'}
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: isRaffle ? colors.goldAccent : (totals.netProfit >= 0 ? colors.successColor : colors.errorColor) }}
            >
              {isRaffle ? formatCurrency(totals.paidSales) : formatCurrency(totals.netProfit)}
            </span>
          </div>
          {isRaffle && availableNumbers > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px]" style={{ color: colors.mutedText }}>
                Números disponibles
              </span>
              <span className="text-[10px] font-semibold" style={{ color: colors.mutedText }}>
                {availableNumbers}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onSelect}
          className="flex-1"
          style={{
            background: isRaffle
              ? `linear-gradient(to right, ${colors.goldAccent}, ${colors.primaryAccent})`
              : `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
            color: colors.primaryBg
          }}
        >
          <FolderOpen size={14} className="mr-1.5" />
          {isRaffle ? 'Ver Rifa' : 'Ver Detalles'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          style={{ color: colors.mutedText }}
          className="hover:text-red-500"
        >
          <Trash2 size={14} />
        </Button>
      </CardFooter>
    </Card>
  )
}
