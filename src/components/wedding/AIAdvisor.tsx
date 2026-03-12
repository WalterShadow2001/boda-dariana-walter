'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, X, Sparkles, Heart, DollarSign } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { Button } from '@/components/ui/button'

interface AIAdvisorProps {
  onInteraction?: () => void
}

// Consejos predefinidos para la boda (sin llamar a la API cada vez)
const weddingTips = [
  {
    title: "💡 Idea de Ingreso",
    message: "¿Has considerado hacer arreglos florales para quinceañeras? Pueden ser un gran ingreso adicional.",
    category: "ventas"
  },
  {
    title: "💎 Consejo de Ahorro",
    message: "Compra flores al por mayor en mercados locales. Puedes ahorrar hasta 40% comparado con floristerías.",
    category: "ahorro"
  },
  {
    title: "✨ Oportunidad",
    message: "Las decoraciones para baby showers están muy solicitadas. ¡Agrega ese servicio a tu portafolio!",
    category: "ventas"
  },
  {
    title: "💰 Tip Financiero",
    message: "Cobra un anticipo del 50% en cada proyecto. Así tendrás flujo de caja para materiales.",
    category: "finanzas"
  },
  {
    title: "💐 Temporada",
    message: "En temporada de bodas (mayo-julio), los precios pueden aumentar 20%. ¡Planifica con anticipación!",
    category: "planificación"
  },
  {
    title: "🎯 Meta Semanal",
    message: "Intenta cerrar al menos 2 ventas pequeñas por semana. ¡Pequeños pasos, grandes resultados!",
    category: "metas"
  },
  {
    title: "📦 Inventario",
    message: "Guarda materiales sobrantes de cada proyecto. Pueden ser útiles para arreglos más pequeños.",
    category: "ahorro"
  },
  {
    title: "🌟 Marketing",
    message: "Publica fotos de tus trabajos en redes sociales. ¡El boca a boca es tu mejor publicidad!",
    category: "ventas"
  },
  {
    title: "🎊 Eventos Especiales",
    message: "Ofrece paquetes para fiestas de Navidad y Año Nuevo. ¡Es temporada alta de ventas!",
    category: "ventas"
  },
  {
    title: "💝 Servicio Premium",
    message: "Crea un paquete 'todo incluido' para bodas: ceremonia, recepción y mesa de novios.",
    category: "ventas"
  },
  {
    title: "📊 Organización",
    message: "Lleva un registro de tus gastos más grandes. Identificarlos te ayudará a reducir costos.",
    category: "finanzas"
  },
  {
    title: "🤝 Colaboraciones",
    message: "Busca alianzas con fotógrafos de bodas. Pueden recomendarte a sus clientes.",
    category: "ventas"
  }
]

export function AIAdvisor({ onInteraction }: AIAdvisorProps) {
  const colors = useThemeStore((state) => state.colors)
  const [currentTip, setCurrentTip] = useState<typeof weddingTips[0] | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastInteractionRef = useRef<number>(Date.now())

  const hideTip = useCallback(() => {
    setIsVisible(false)
    setDismissed(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  const showRandomTip = useCallback(() => {
    if (dismissed) return
    
    const randomTip = weddingTips[Math.floor(Math.random() * weddingTips.length)]
    setCurrentTip(randomTip)
    setIsVisible(true)
    lastInteractionRef.current = Date.now()
    
    // Auto-hide after 10 seconds
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 10000)
  }, [dismissed])

  // Mostrar consejo periódicamente (cada 45-90 segundos)
  useEffect(() => {
    if (dismissed) return

    const showFirstTip = () => {
      setTimeout(() => {
        showRandomTip()
      }, 15000) // Primer consejo después de 15 segundos
    }

    showFirstTip()

    const interval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current
      // Solo mostrar si han pasado más de 45 segundos desde la última interacción
      if (timeSinceLastInteraction > 45000 && !dismissed) {
        showRandomTip()
      }
    }, 60000) // Verificar cada minuto

    return () => {
      clearInterval(interval)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [showRandomTip, dismissed])

  // Detectar interacción del usuario para ocultar el consejo
  useEffect(() => {
    const handleInteraction = () => {
      lastInteractionRef.current = Date.now()
      if (isVisible) {
        // Ocultar después de 10 segundos de interacción
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current)
        }
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false)
        }, 10000)
      }
      onInteraction?.()
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('scroll', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [isVisible, onInteraction])

  const handleDismiss = () => {
    hideTip()
  }

  const handleNewTip = () => {
    const randomTip = weddingTips[Math.floor(Math.random() * weddingTips.length)]
    setCurrentTip(randomTip)
    lastInteractionRef.current = Date.now()
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 10000)
  }

  if (!currentTip) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 z-50 max-w-sm w-[calc(100%-2rem)]"
        >
          <div
            className="relative rounded-2xl p-4 shadow-2xl border"
            style={{
              background: `linear-gradient(135deg, ${colors.cardBg}, ${colors.secondaryBg})`,
              borderColor: colors.primaryAccent + '40',
              boxShadow: `0 10px 40px ${colors.primaryAccent}20`
            }}
          >
            {/* Decoración */}
            <div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colors.primaryAccent}, ${colors.secondaryAccent})`
              }}
            >
              <Sparkles size={16} style={{ color: colors.primaryBg }} />
            </div>

            {/* Botón cerrar */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 left-2 h-6 w-6 p-0"
              onClick={handleDismiss}
              style={{ color: colors.mutedText }}
            >
              <X size={14} />
            </Button>

            {/* Contenido */}
            <div className="pt-2">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primaryAccent}20, ${colors.secondaryAccent}20)`
                  }}
                >
                  <Heart size={20} style={{ color: colors.primaryAccent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-semibold text-sm mb-1"
                    style={{ color: colors.primaryText }}
                  >
                    {currentTip.title}
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: colors.secondaryText }}
                  >
                    {currentTip.message}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTopColor: colors.borderColor, borderTopWidth: 1 }}>
                <span
                  className="text-[10px]"
                  style={{ color: colors.mutedText }}
                >
                  <DollarSign size={10} className="inline mr-1" />
                  Dariana & Walter
                </span>
                <Button
                  size="sm"
                  onClick={handleNewTip}
                  className="h-7 text-xs"
                  style={{
                    background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
                    color: colors.primaryBg
                  }}
                >
                  <Lightbulb size={12} className="mr-1" />
                  Otro consejo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
