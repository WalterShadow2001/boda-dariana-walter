'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Heart, Sparkles, Loader2 } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  onSave: (name: string, description: string) => Promise<{ success: boolean; error?: string }>
  initialData?: {
    name: string
    description: string
  }
  mode: 'create' | 'edit'
}

export function ProjectModal({ open, onClose, onSave, initialData, mode }: ProjectModalProps) {
  const colors = useThemeStore((state) => state.colors)
  const [name, setName] = useState(() => initialData?.name ?? '')
  const [description, setDescription] = useState(() => initialData?.description ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle dialog open/close
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
    } else {
      // Reset form when opening
      if (initialData) {
        setName(initialData.name)
        setDescription(initialData.description)
      } else {
        setName('')
        setDescription('')
      }
      setError(null)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    const result = await onSave(name.trim(), description.trim())
    
    if (result.success) {
      setName('')
      setDescription('')
      onClose()
    } else {
      setError(result.error || 'Error al guardar')
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        style={{ 
          backgroundColor: colors.cardBg,
          borderColor: colors.borderColor
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.secondaryBg}, ${colors.primaryAccent}30)` }}
            >
              {mode === 'create' ? (
                <Sparkles size={16} style={{ color: colors.goldAccent }} />
              ) : (
                <Heart size={16} style={{ color: colors.primaryAccent }} fill={colors.primaryAccent} />
              )}
            </div>
            <DialogTitle style={{ color: colors.primaryText }}>
              {mode === 'create' ? 'Nuevo Proyecto' : 'Editar Proyecto'}
            </DialogTitle>
          </div>
          <DialogDescription style={{ color: colors.mutedText }}>
            {mode === 'create'
              ? 'Crea un nuevo proyecto para organizar las actividades de tu boda.'
              : 'Modifica los detalles de tu proyecto.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" style={{ color: colors.primaryText }}>
              Nombre del Proyecto <span style={{ color: colors.errorColor }}>*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Decoración del salón"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ 
                borderColor: colors.inputBorder,
                color: colors.primaryText
              }}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" style={{ color: colors.primaryText }}>
              Descripción
            </Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente este proyecto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
              style={{ 
                borderColor: colors.inputBorder,
                color: colors.primaryText
              }}
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: colors.errorColor + '15',
                color: colors.errorColor
              }}
            >
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            style={{ color: colors.mutedText }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
            style={{ 
              background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
              color: colors.primaryBg,
              opacity: !name.trim() ? 0.5 : 1
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'create' ? (
              <>
                <Sparkles size={16} className="mr-1.5" />
                Crear Proyecto
              </>
            ) : (
              <>
                <Heart size={16} className="mr-1.5" fill="currentColor" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
