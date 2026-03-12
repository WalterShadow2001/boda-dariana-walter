'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { motion } from 'framer-motion'

interface FloatingAddButtonProps {
  onClick: () => void
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  const colors = useThemeStore((state) => state.colors)

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        size="lg"
        onClick={onClick}
        className="w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110"
        style={{ 
          background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
          color: colors.primaryBg,
          boxShadow: `0 10px 25px ${colors.primaryAccent}40`
        }}
      >
        <Plus size={24} />
      </Button>
    </motion.div>
  )
}
