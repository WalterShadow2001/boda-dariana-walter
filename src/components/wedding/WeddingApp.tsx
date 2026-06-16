'use client'

import { useState, useEffect, useSyncExternalStore, useRef } from 'react'
import { useWeddingStore } from '@/stores/wedding-store'
import { useAuthStore } from '@/stores/auth-store'
import { useThemeStore } from '@/stores/theme-store'
async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/debug')
    const data = await res.json()
    if (data.status === 'SUCCESS') return { success: true }
    return { success: false, error: data.error || 'Error de conexión' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
import { WeddingHeader } from './WeddingHeader'
import { ProjectList } from './ProjectList'
import { ProjectDetail } from './ProjectDetail'
import { ProjectModal } from './ProjectModal'
import { FloatingAddButton } from './FloatingAddButton'
import { ThemeCustomizer } from './ThemeCustomizer'
import { GlobalMetrics } from './GlobalMetrics'
import { Login } from './Login'
import { AIAdvisor } from './AIAdvisor'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function WeddingApp() {
  const { 
    projects, 
    selectedProjectId, 
    selectProject, 
    deleteProject, 
    addProject, 
    loadFromDatabase, 
    isLoading: dataLoading,
    connectionError 
  } = useWeddingStore()
  const { isAuthenticated } = useAuthStore()
  const colors = useThemeStore((state) => state.colors)
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false)
  const [isMetricsOpen, setIsMetricsOpen] = useState(false)
  const [showConnectionError, setShowConnectionError] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  
  const hasLoadedRef = useRef(false)
  
  const isHydrated = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const handleDeleteProject = async () => {
    if (deleteConfirmId) {
      const result = await deleteProject(deleteConfirmId)
      if (!result.success) {
        alert(`Error: ${result.error}`)
      }
      setDeleteConfirmId(null)
    }
  }

  const handleAddProject = async (name: string, description: string) => {
    const result = await addProject(name, description)
    if (!result.success) {
      alert(`Error al crear proyecto: ${result.error}`)
    }
  }

  const handleRetryConnection = async () => {
    const result = await testConnection()
    if (result.success) {
      setShowConnectionError(false)
      setLocalError(null)
      await loadFromDatabase()
    } else {
      setLocalError(result.error || 'Error desconocido')
    }
  }

  // Load data once when authenticated
  useEffect(() => {
    if (isAuthenticated && isHydrated && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      testConnection().then(result => {
        if (result.success) {
          loadFromDatabase()
        } else {
          console.log('Connection error:', result.error)
          setLocalError(result.error || 'Error de conexión')
          setShowConnectionError(true)
        }
      })
    }
  }, [isAuthenticated, isHydrated, loadFromDatabase])

  // Loading during hydration
  if (!isHydrated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(to bottom, #FFFEF7, #F8E8E8)` }}
      >
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pink-100" />
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  // Show connection error
  if (showConnectionError && (connectionError || localError)) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(to bottom, ${colors.primaryBg}, ${colors.secondaryBg})` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-6 rounded-2xl shadow-xl text-center"
          style={{ 
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.borderColor}`
          }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.primaryText }}>
            Error de Conexión
          </h2>
          <p className="mb-4 text-sm" style={{ color: colors.mutedText }}>
            {connectionError || localError}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConnectionError(false)}
              style={{ borderColor: colors.borderColor, color: colors.mutedText }}
            >
              Usar Local
            </Button>
            <Button
              className="flex-1"
              onClick={handleRetryConnection}
              style={{ 
                background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
                color: colors.primaryBg
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Reintentar
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Loading data
  if (dataLoading && projects.length === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(to bottom, ${colors.primaryBg}, ${colors.secondaryBg})` }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primaryAccent }} />
          <p style={{ color: colors.mutedText }}>Cargando proyectos...</p>
        </motion.div>
      </div>
    )
  }

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => selectProject(null)}
      />
    )
  }

  return (
    <motion.div 
      className="min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${colors.primaryBg}, ${colors.secondaryBg})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <WeddingHeader 
        onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
        onOpenMetrics={() => setIsMetricsOpen(true)}
      />
      
      <main>
        <ProjectList
          projects={projects}
          onSelectProject={(id) => selectProject(id)}
          onDeleteProject={(id) => setDeleteConfirmId(id)}
          onAddProject={() => setIsCreateModalOpen(true)}
        />
      </main>

      {projects.length > 0 && (
        <FloatingAddButton onClick={() => setIsCreateModalOpen(true)} />
      )}

      <ProjectModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleAddProject}
        mode="create"
      />

      <ThemeCustomizer 
        open={isThemeCustomizerOpen} 
        onClose={() => setIsThemeCustomizerOpen(false)} 
      />

      <Sheet open={isMetricsOpen} onOpenChange={setIsMetricsOpen}>
        <SheetContent 
          className="w-full sm:max-w-lg overflow-y-auto"
          style={{ 
            backgroundColor: colors.cardBg,
            borderLeftColor: colors.borderColor
          }}
        >
          <SheetHeader>
            <SheetTitle style={{ color: colors.primaryText }}>
              Métricas Generales
            </SheetTitle>
            <SheetDescription style={{ color: colors.mutedText }}>
              Resumen financiero de todos los proyectos
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <GlobalMetrics />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent style={{ 
          backgroundColor: colors.cardBg,
          borderColor: colors.borderColor 
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: colors.primaryText }}>
              Eliminar Proyecto
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: colors.mutedText }}>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              style={{ 
                borderColor: colors.borderColor,
                color: colors.secondaryText
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              style={{ 
                backgroundColor: colors.errorColor,
                color: 'white'
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Advisor - Consejos para la boda */}
      <AIAdvisor />
    </motion.div>
  )
}
