'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Lock, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useThemeStore } from '@/stores/theme-store'
import { motion } from 'framer-motion'

export function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const theme = useThemeStore((state) => state)
  
  // Use colors from store or defaults
  const colors = theme?.colors || {
    primaryBg: '#FFFEF7',
    secondaryBg: '#F8E8E8',
    cardBg: '#FFFFFF',
    primaryText: '#4A3F3F',
    secondaryText: '#6B5E5E',
    mutedText: '#8B7E7E',
    primaryAccent: '#D4A5A5',
    secondaryAccent: '#E8C4C4',
    goldAccent: '#D4AF37',
    errorColor: '#EF4444',
    inputBorder: '#F0D9D9',
    borderColor: '#F0D9D9',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(false)
    
    const success = await login(password)
    
    if (!success) {
      setError(true)
      setPassword('')
    }
    setIsLoading(false)
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: `linear-gradient(to bottom, ${colors.primaryBg}, ${colors.secondaryBg})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Names */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ backgroundColor: colors.secondaryBg }}
          >
            <Heart 
              className="animate-pulse" 
              size={40} 
              style={{ color: colors.primaryAccent }}
              fill={colors.primaryAccent}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: colors.primaryText }}
            >
              Dariana <span style={{ color: colors.goldAccent }}>&</span> Walter
            </h1>
            <p style={{ color: colors.mutedText }} className="text-lg">
              Nuestra Boda
            </p>
          </motion.div>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-6 shadow-xl"
          style={{ 
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.borderColor}`
          }}
        >
          <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: colors.primaryText }}>
            Bienvenidos
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: colors.secondaryText }}>
                Contraseña
              </Label>
              <div className="relative">
                <Lock 
                  className="absolute left-3 top-1/2 -translate-y-1/2" 
                  size={18} 
                  style={{ color: colors.mutedText }}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa la contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(false)
                  }}
                  className="pl-10"
                  style={{ 
                    borderColor: error ? colors.errorColor : colors.inputBorder,
                    color: colors.primaryText,
                    backgroundColor: colors.cardBg
                  }}
                  disabled={isLoading}
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm"
                  style={{ color: colors.errorColor }}
                >
                  Contraseña incorrecta. Intenta de nuevo.
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              style={{ 
                background: `linear-gradient(to right, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
                color: colors.primaryBg
              }}
              disabled={!password || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Heart size={18} className="mr-2" fill="currentColor" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm"
          style={{ color: colors.mutedText }}
        >
          Dariana de la Rocha & Walter Piñera
        </motion.p>
      </motion.div>
    </div>
  )
}
