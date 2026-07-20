'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Pencil, Heart, Calendar, Sparkles } from 'lucide-react'
import { Project, useWeddingStore } from '@/stores/wedding-store'
import { useThemeStore } from '@/stores/theme-store'
import { FinancialSummary } from './FinancialSummary'
import { SalesSection } from './SalesSection'
import { ExpensesSection } from './ExpensesSection'
import { RaffleSection } from './RaffleSection'
import { ProjectModal } from './ProjectModal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const { updateProject, addSale, updateSale, deleteSale, addExpense, updateExpense, deleteExpense, getProjectTotals } = useWeddingStore()
  const colors = useThemeStore((state) => state.colors)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'sales' | 'raffle'>('sales')
  const totals = getProjectTotals(project.id)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${colors.primaryBg}, ${colors.secondaryBg})` }}
    >
      {/* Header */}
      <div 
        className="border-b"
        style={{ 
          background: `linear-gradient(to right, ${colors.secondaryBg}, ${colors.primaryBg}, ${colors.secondaryBg})`,
          borderColor: colors.borderColor
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              style={{ color: colors.secondaryText }}
            >
              <ArrowLeft size={18} className="mr-1" />
              Volver
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Project Info */}
        <Card 
          className="mb-6"
          style={{ 
            backgroundColor: colors.cardBg,
            borderColor: colors.borderColor
          }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${colors.secondaryBg}, ${colors.primaryAccent}30)` }}
                >
                  <Heart size={28} style={{ color: colors.primaryAccent }} fill={colors.primaryAccent} />
                </div>
                <div>
                  <h1 
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: colors.primaryText }}
                  >
                    {project.name}
                  </h1>
                  <div 
                    className="flex items-center gap-2 mt-2 text-sm"
                    style={{ color: colors.mutedText }}
                  >
                    <Calendar size={14} />
                    Creado el {formatDate(project.createdAt)}
                  </div>
                  {project.description && (
                    <p 
                      className="mt-3 max-w-xl"
                      style={{ color: colors.secondaryText }}
                    >
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                style={{ 
                  borderColor: colors.primaryAccent,
                  color: colors.primaryAccent
                }}
              >
                <Pencil size={14} className="mr-1.5" />
                Editar Proyecto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="mb-6">
          <h2 
            className="text-lg font-semibold mb-3 flex items-center gap-2"
            style={{ color: colors.primaryText }}
          >
            <Sparkles size={18} style={{ color: colors.goldAccent }} />
            Resumen Financiero
          </h2>
          <FinancialSummary {...totals} />
        </div>

        {/* Tab Navigation: Ventas/Gastos vs Rifas */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('sales')}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'sales' ? colors.primaryAccent : colors.secondaryBg,
              color: activeTab === 'sales' ? colors.primaryBg : colors.secondaryText,
            }}
          >
            💰 Ventas y Gastos
          </button>
          <button
            onClick={() => setActiveTab('raffle')}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'raffle' ? colors.primaryAccent : colors.secondaryBg,
              color: activeTab === 'raffle' ? colors.primaryBg : colors.secondaryText,
            }}
          >
            🎟️ Rifas
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'sales' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesSection
              sales={project.sales}
              onAddSale={(sale) => addSale(project.id, sale)}
              onUpdateSale={(saleId, sale) => updateSale(project.id, saleId, sale)}
              onDeleteSale={(saleId) => deleteSale(project.id, saleId)}
            />
            <ExpensesSection
              expenses={project.expenses}
              onAddExpense={(expense) => addExpense(project.id, expense)}
              onUpdateExpense={(expenseId, expense) => updateExpense(project.id, expenseId, expense)}
              onDeleteExpense={(expenseId) => deleteExpense(project.id, expenseId)}
            />
          </div>
        ) : (
          <RaffleSection />
        )}
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(name, description) => {
          updateProject(project.id, name, description)
        }}
        initialData={{ name: project.name, description: project.description }}
        mode="edit"
      />
    </motion.div>
  )
}
