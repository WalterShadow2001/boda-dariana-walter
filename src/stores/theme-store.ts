import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ThemeColors {
  // Background colors
  primaryBg: string
  secondaryBg: string
  cardBg: string
  
  // Text colors
  primaryText: string
  secondaryText: string
  mutedText: string
  
  // Accent colors
  primaryAccent: string
  secondaryAccent: string
  goldAccent: string
  
  // Status colors
  successColor: string
  warningColor: string
  errorColor: string
  
  // Border colors
  borderColor: string
  inputBorder: string
}

export interface ThemePreset {
  name: string
  colors: ThemeColors
}

interface ThemeStore {
  colors: ThemeColors
  isCustomizing: boolean
  
  // Actions
  updateColor: (key: keyof ThemeColors, value: string) => void
  updateColors: (newColors: Partial<ThemeColors>) => void
  setPreset: (preset: ThemePreset) => void
  toggleCustomizing: () => void
  resetToDefault: () => void
}

const defaultColors: ThemeColors = {
  primaryBg: '#FFFEF7',
  secondaryBg: '#F8E8E8',
  cardBg: '#FFFFFF',
  primaryText: '#4A3F3F',
  secondaryText: '#6B5E5E',
  mutedText: '#8B7E7E',
  primaryAccent: '#D4A5A5',
  secondaryAccent: '#E8C4C4',
  goldAccent: '#D4AF37',
  successColor: '#22C55E',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  borderColor: '#F0D9D9',
  inputBorder: '#F0D9D9',
}

export const themePresets: ThemePreset[] = [
  {
    name: 'Rosa Romántico',
    colors: { ...defaultColors }
  },
  {
    name: 'Azul Celestial',
    colors: {
      primaryBg: '#F0F7FF',
      secondaryBg: '#E0EEFF',
      cardBg: '#FFFFFF',
      primaryText: '#1E3A5F',
      secondaryText: '#3D5A80',
      mutedText: '#6B8CAF',
      primaryAccent: '#4A90D9',
      secondaryAccent: '#7CB9E8',
      goldAccent: '#5BA3E0',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      borderColor: '#C5DDF5',
      inputBorder: '#C5DDF5',
    }
  },
  {
    name: 'Verde Jardín',
    colors: {
      primaryBg: '#F5FFF5',
      secondaryBg: '#E8F5E8',
      cardBg: '#FFFFFF',
      primaryText: '#2D4A2D',
      secondaryText: '#4A6B4A',
      mutedText: '#7A9D7A',
      primaryAccent: '#6B9B6B',
      secondaryAccent: '#8FBC8F',
      goldAccent: '#9ACD32',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      borderColor: '#C5E0C5',
      inputBorder: '#C5E0C5',
    }
  },
  {
    name: 'Lavanda Elegante',
    colors: {
      primaryBg: '#FAF5FF',
      secondaryBg: '#F0E6FF',
      cardBg: '#FFFFFF',
      primaryText: '#4A3A5F',
      secondaryText: '#6B5A80',
      mutedText: '#9B8AAF',
      primaryAccent: '#9B7FCF',
      secondaryAccent: '#BFA8E8',
      goldAccent: '#A78BFA',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      borderColor: '#DDC5F0',
      inputBorder: '#DDC5F0',
    }
  },
  {
    name: 'Dorado Lujo',
    colors: {
      primaryBg: '#FFFEF5',
      secondaryBg: '#F8F0E0',
      cardBg: '#FFFFFF',
      primaryText: '#5A4A2A',
      secondaryText: '#7A6A4A',
      mutedText: '#A09070',
      primaryAccent: '#C9A227',
      secondaryAccent: '#E0C060',
      goldAccent: '#D4AF37',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      borderColor: '#E5D5B5',
      inputBorder: '#E5D5B5',
    }
  },
  {
    name: 'Elegante Oscuro',
    colors: {
      primaryBg: '#1A1A2E',
      secondaryBg: '#252542',
      cardBg: '#2D2D4A',
      primaryText: '#F0E6D3',
      secondaryText: '#C4B8A8',
      mutedText: '#9A9080',
      primaryAccent: '#D4A5A5',
      secondaryAccent: '#E8C4C4',
      goldAccent: '#D4AF37',
      successColor: '#4ADE80',
      warningColor: '#FBBF24',
      errorColor: '#F87171',
      borderColor: '#3D3D5C',
      inputBorder: '#3D3D5C',
    }
  },
]

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      colors: defaultColors,
      isCustomizing: false,
      
      updateColor: (key, value) => {
        set((state) => ({
          colors: { ...state.colors, [key]: value }
        }))
      },
      
      updateColors: (newColors) => {
        set((state) => ({
          colors: { ...state.colors, ...newColors }
        }))
      },
      
      setPreset: (preset) => {
        set({ colors: preset.colors })
      },
      
      toggleCustomizing: () => {
        set((state) => ({ isCustomizing: !state.isCustomizing }))
      },
      
      resetToDefault: () => {
        set({ colors: defaultColors })
      }
    }),
    {
      name: 'wedding-theme-storage'
    }
  )
)
