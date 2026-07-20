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
import { Heart, Sparkles, Loader2, Ticket } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  onSave: (name: string, description: string, type?: 'project' | 'raffle', amountPerNumber?: number, totalNumbers?: number) => Promise<{ success: boolean; error?: string }>
  initialData?: {
    name: string
    description: string
    type?: 'project' | 'raffle'
    amountPerNumber?: number
    totalNumbers?: number
  }
  mode: 'create' | 'edit'
}

export function ProjectModal({ open, onClose, onSave, initialData, mode }: ProjectModalProps) {
  const colors = useThemeStore((state) => state.colors)
  const [name, setName] = useState(() => initialData?.name ?? '')
  const [description, setDescription] = useState(() => initialData?.description ?? '')
  const [projectType, setProjectType] = useState<'project' | 'raffle'>(() => initialData?.type ?? 'project')
  const [amountPerNumber, setAmountPerNumber] = useState(() => String(initialData?.amountPerNumber ?? ''))
  const [totalNumbers, setTotalNumbers] = useState(() => String(initialData?.totalNumbers ?? '100'))
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
        setProjectType(initialData.type ?? 'project')
        setAmountPerNumber(String(initialData.amountPerNumber ?? ''))
        setTotalNumbers(String(initialData.totalNumbers ?? '100'))
      } else {
        setName('')
        setDescription('')
        setProjectType('project')
        setAmountPerNumber('')
        setTotalNumbers('100')
      }
      setError(null)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (projectType === 'raffle' && (!amountPerNumber || Number(amountPerNumber) <= 0)) return

    setIsLoading(true)
    setError(null)

    const result = await onSave(
      name.trim(),
      description.trim(),
      projectType,
      projectType === 'raffle' ? Number(amountPerNumber) : undefined,
      projectType === 'raffle' ? Number(totalNumbers) || 100 : undefined
    )

    if (result.success) {
      setName('')
      setDescription('')
      setProjectType('project')
      setAmountPerNumber('')
      setTotalNumbers('100')
      onClose()
    } else {
      setError(result.error || 'Error al guardar')
    }
    setIsLoading(false)
  }

  const isValid = () => {
    if (!name.trim()) return false
    if (projectType === 'raffle' && (!amountPerNumber || Number(amountPerNumber) <= 0)) return false
    return true
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
              ? 'Crea un nuevo proyecto o rifa para organizar las actividades de tu boda.'
              : 'Modifica los detalles de tu proyecto.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Type selector - only shown when creating */}
          {mode === 'create' && (
            <div className="grid gap-2">
              <Label style={{ color: colors.primaryText }}>
                Tipo <span style={{ color: colors.errorColor }}>*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProjectType('project')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: projectType === 'project' ? colors.primaryAccent : colors.borderColor,
                    backgroundColor: projectType === 'project' ? colors.primaryAccent + '15' : 'transparent',
                    color: projectType === 'project' ? colors.primaryAccent : colors.secondaryText,
                  }}
                >
                  <Heart size={24} fill={projectType === 'project' ? colors.primaryAccent : 'none'} />
                  <span className="text-sm font-medium">Proyecto</span>
                  <span className="text-xs opacity-70">Ventas y gastos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectType('raffle')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: projectType === 'raffle' ? colors.goldAccent : colors.borderColor,
                    backgroundColor: projectType === 'raffle' ? colors.goldAccent + '15' : 'transparent',
                    color: projectType === 'raffle' ? colors.goldAccent : colors.secondaryText,
                  }}
                >
                  <Ticket size={24} />
                  <span className="text-sm font-medium">Rifa</span>
                  <span className="text-xs opacity-70">Números y ruleta</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name" style={{ color: colors.primaryText }}>
              {projectType === 'raffle' ? 'Nombre de la Rifa' : 'Nombre del Proyecto'} <span style={{ color: colors.errorColor }}>*</span>
            </Label>
            <Input
              id="name"
              placeholder={projectType === 'raffle' ? 'Ej: Rifa del Pastel' : 'Ej: Decoración del salón'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                borderColor: colors.inputBorder,
                color: colors.primaryText
              }}
              disabled={isLoading}
            />
          </div>

          {projectType === 'project' && (
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
          )}

          {projectType === 'raffle' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="amount" style={{ color: colors.primaryText }}>
                    Monto por número <span style={{ color: colors.errorColor }}>*</span>
                  </Label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: colors.mutedText }}
                    >
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      placeholder="50"
                      value={amountPerNumber}
                      onChange={(e) => setAmountPerNumber(e.target.value)}
                      className="pl-7"
                      style={{
                        borderColor: colors.inputBorder,
                        color: colors.primaryText
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalNumbers" style={{ color: colors.primaryText }}>
                    Total de números
                  </Label>
                  <Input
                    id="totalNumbers"
                    type="number"
                    min="2"
                    max="1000"
                    placeholder="100"
                    value={totalNumbers}
                    onChange={(e) => setTotalNumbers(e.target.value)}
                    style={{
                      borderColor: colors.inputBorder,
                      color: colors.primaryText
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="raffleDesc" style={{ color: colors.primaryText }}>
                  Descripción (opcional)
                </Label>
                <Textarea
                  id="raffleDesc"
                  placeholder="Describe brevemente esta rifa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[60px] resize-none"
                  style={{
                    borderColor: colors.inputBorder,
                    color: colors.primaryText
                  }}
                  disabled={isLoading}
                />
              </div>
            </>
          )}

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
            disabled={!isValid() || isLoading}
            style={{
              background: projectType === 'raffle'
                ? `linear-gradient(to right, ${colors.goldAccent}, ${colors.primaryAccent})`
                : `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
              color: colors.primaryBg,
              opacity: !isValid() ? 0.5 : 1
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'create' ? (
              <>
                {projectType === 'raffle' ? (
                  <>
                    <Ticket size={16} className="mr-1.5" />
                    Crear Rifa
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-1.5" />
                    Crear Proyecto
                  </>
                )}
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
