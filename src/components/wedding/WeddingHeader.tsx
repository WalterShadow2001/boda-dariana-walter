'use client'

import { Heart, Sparkles, Palette, LogOut, Settings } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface WeddingHeaderProps {
  onOpenThemeCustomizer: () => void
  onOpenMetrics: () => void
}

export function WeddingHeader({ onOpenThemeCustomizer, onOpenMetrics }: WeddingHeaderProps) {
  const colors = useThemeStore((state) => state.colors)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header 
      className="relative overflow-hidden border-b"
      style={{ 
        background: `linear-gradient(to right, ${colors.primaryBg}, ${colors.secondaryBg}, ${colors.primaryBg})`,
        borderColor: colors.borderColor
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-4 left-10"
          style={{ color: colors.goldAccent }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.5 }}
        >
          <Sparkles size={20} className="animate-pulse" />
        </motion.div>
        <motion.div 
          className="absolute top-6 right-16"
          style={{ color: colors.goldAccent }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.7 }}
        >
          <Sparkles size={16} className="animate-pulse" />
        </motion.div>
        <motion.div 
          className="absolute bottom-4 left-1/4"
          style={{ color: colors.primaryAccent }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.9 }}
        >
          <Heart size={14} fill="currentColor" className="animate-bounce" />
        </motion.div>
        <motion.div 
          className="absolute bottom-6 right-1/3"
          style={{ color: colors.primaryAccent }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ delay: 1.1 }}
        >
          <Heart size={12} fill="currentColor" className="animate-bounce" />
        </motion.div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          {/* Action buttons - left */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenMetrics}
              className="gap-1.5"
              style={{ color: colors.mutedText }}
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Métricas</span>
            </Button>
          </div>

          {/* Action buttons - right */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenThemeCustomizer}
              className="gap-1.5"
              style={{ color: colors.mutedText }}
            >
              <Palette size={16} />
              <span className="hidden sm:inline">Colores</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5"
              style={{ color: colors.mutedText }}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center gap-3 mb-2"
          >
            <Heart 
              className="animate-pulse" 
              size={28} 
              style={{ color: colors.primaryAccent }}
              fill={colors.primaryAccent}
            />
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span style={{ color: colors.primaryText }}>Dariana </span>
                <span style={{ color: colors.goldAccent }}>&</span>
                <span style={{ color: colors.primaryText }}> Walter</span>
              </h1>
            </div>
            <Heart 
              className="animate-pulse" 
              size={28} 
              style={{ color: colors.primaryAccent }}
              fill={colors.primaryAccent}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p 
              className="text-center text-sm md:text-base font-medium"
              style={{ color: colors.secondaryText }}
            >
              de la Rocha <span style={{ color: colors.primaryAccent }}>&#9829;</span> Piñera
            </p>
            <p 
              className="text-center mt-1 text-sm"
              style={{ color: colors.mutedText }}
            >
              Organiza tus actividades y finanzas para el gran día
            </p>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
