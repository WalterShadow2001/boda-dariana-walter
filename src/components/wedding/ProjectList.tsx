'use client'

import { ProjectCard } from './ProjectCard'
import { Project } from '@/stores/wedding-store'
import { useThemeStore } from '@/stores/theme-store'
import { Heart, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProjectListProps {
  projects: Project[]
  onSelectProject: (id: string) => void
  onDeleteProject: (id: string) => void
  onAddProject: () => void
}

export function ProjectList({ projects, onSelectProject, onDeleteProject, onAddProject }: ProjectListProps) {
  const colors = useThemeStore((state) => state.colors)

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${colors.secondaryBg}, ${colors.primaryAccent}30)` }}
          >
            <Heart 
              className="animate-bounce" 
              size={40} 
              style={{ color: colors.primaryAccent }}
              fill={colors.primaryAccent}
            />
          </div>
          <div 
            className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: colors.goldAccent }}
            onClick={onAddProject}
          >
            <Plus className="text-white" size={18} />
          </div>
        </div>
        <h3 
          className="mt-6 text-xl font-semibold"
          style={{ color: colors.primaryText }}
        >
          No hay proyectos aún
        </h3>
        <p 
          className="mt-2 text-center max-w-sm"
          style={{ color: colors.mutedText }}
        >
          Comienza a planificar tu boda creando tu primer proyecto. 
          Podrás llevar el control de ventas, gastos y ganancias.
        </p>
        <button
          onClick={onAddProject}
          className="mt-6 px-6 py-3 rounded-full font-medium shadow-lg transition-all hover:scale-105"
          style={{ 
            background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
            color: colors.primaryBg,
            boxShadow: `0 10px 25px ${colors.primaryAccent}40`
          }}
        >
          <Plus size={18} className="inline mr-2" />
          Crear Primer Proyecto
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProjectCard
                project={project}
                onSelect={() => onSelectProject(project.id)}
                onDelete={() => onDeleteProject(project.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
