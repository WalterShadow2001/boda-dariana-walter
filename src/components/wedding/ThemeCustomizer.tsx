'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Palette, RotateCcw, Check, Sparkles } from 'lucide-react'
import { useThemeStore, themePresets, ThemeColors } from '@/stores/theme-store'
import { motion } from 'framer-motion'

interface ThemeCustomizerProps {
  open: boolean
  onClose: () => void
}

const colorGroups: { title: string; keys: (keyof ThemeColors)[] }[] = [
  {
    title: 'Colores de Fondo',
    keys: ['primaryBg', 'secondaryBg', 'cardBg']
  },
  {
    title: 'Colores de Texto',
    keys: ['primaryText', 'secondaryText', 'mutedText']
  },
  {
    title: 'Colores de Acento',
    keys: ['primaryAccent', 'secondaryAccent', 'goldAccent']
  },
  {
    title: 'Colores de Estado',
    keys: ['successColor', 'warningColor', 'errorColor']
  },
  {
    title: 'Colores de Borde',
    keys: ['borderColor', 'inputBorder']
  }
]

const colorLabels: Record<keyof ThemeColors, string> = {
  primaryBg: 'Fondo Principal',
  secondaryBg: 'Fondo Secundario',
  cardBg: 'Fondo de Tarjetas',
  primaryText: 'Texto Principal',
  secondaryText: 'Texto Secundario',
  mutedText: 'Texto Apagado',
  primaryAccent: 'Acento Principal',
  secondaryAccent: 'Acento Secundario',
  goldAccent: 'Acento Dorado',
  successColor: 'Éxito (Verde)',
  warningColor: 'Advertencia (Amarillo)',
  errorColor: 'Error (Rojo)',
  borderColor: 'Color de Borde',
  inputBorder: 'Borde de Inputs'
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const { colors, updateColor, setPreset, resetToDefault } = useThemeStore()
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primaryAccent + '20' }}
            >
              <Palette size={16} style={{ color: colors.primaryAccent }} />
            </div>
            <DialogTitle style={{ color: colors.primaryText }}>
              Personalizar Tema
            </DialogTitle>
          </div>
          <DialogDescription style={{ color: colors.mutedText }}>
            Elige un preset o personaliza los colores a tu gusto
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'presets' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('presets')}
            style={activeTab === 'presets' ? {
              background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
              color: colors.primaryBg
            } : {
              borderColor: colors.borderColor,
              color: colors.secondaryText
            }}
          >
            <Sparkles size={14} className="mr-1.5" />
            Presets
          </Button>
          <Button
            variant={activeTab === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('custom')}
            style={activeTab === 'custom' ? {
              background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
              color: colors.primaryBg
            } : {
              borderColor: colors.borderColor,
              color: colors.secondaryText
            }}
          >
            <Palette size={14} className="mr-1.5" />
            Personalizado
          </Button>
        </div>

        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {themePresets.map((preset) => (
              <motion.button
                key={preset.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPreset(preset)}
                className="relative p-3 rounded-lg border-2 transition-all text-left"
                style={{
                  borderColor: preset.colors.primaryAccent === colors.primaryAccent 
                    ? colors.goldAccent 
                    : colors.borderColor,
                  backgroundColor: preset.colors.cardBg
                }}
              >
                {preset.colors.primaryAccent === colors.primaryAccent && (
                  <div 
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.successColor }}
                  >
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <div className="flex gap-1 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.colors.primaryAccent }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.colors.secondaryAccent }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.colors.goldAccent }}
                  />
                </div>
                <p 
                  className="text-xs font-medium"
                  style={{ color: preset.colors.primaryText }}
                >
                  {preset.name}
                </p>
              </motion.button>
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4 mt-4">
            {colorGroups.map((group) => (
              <Card key={group.title} style={{ borderColor: colors.borderColor }}>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle 
                    className="text-sm font-medium"
                    style={{ color: colors.secondaryText }}
                  >
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {group.keys.map((key) => (
                    <div key={key} className="space-y-1.5">
                      <Label 
                        htmlFor={key} 
                        className="text-xs"
                        style={{ color: colors.mutedText }}
                      >
                        {colorLabels[key]}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={key}
                          type="color"
                          value={colors[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          className="w-10 h-9 p-1 cursor-pointer"
                          style={{ borderColor: colors.inputBorder }}
                        />
                        <Input
                          type="text"
                          value={colors[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          className="flex-1 text-xs"
                          style={{ 
                            borderColor: colors.inputBorder,
                            color: colors.primaryText
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            style={{ borderColor: colors.borderColor, color: colors.secondaryText }}
          >
            <RotateCcw size={14} className="mr-1.5" />
            Restablecer
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            style={{ 
              background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
              color: colors.primaryBg
            }}
          >
            Listo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
