import { create } from 'zustand'

export interface RaffleParticipant {
  id: string
  raffle_id: string
  number: number
  name: string
  phone: string
  is_paid: boolean
  created_at: string
}

export interface Raffle {
  id: string
  project_id: string
  name: string
  description: string
  amount: number
  total_numbers: number
  winner_number: number | null
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  participants: RaffleParticipant[]
}

interface RaffleStore {
  raffles: Raffle[]
  isLoading: boolean
  selectedRaffleId: string | null
  spinningResult: { number: number; name: string } | null

  // Actions
  loadRaffles: (projectId: string) => Promise<void>
  createRaffle: (projectId: string, name: string, description: string, amount: number, totalNumbers: number) => Promise<{ success: boolean; error?: string }>
  deleteRaffle: (raffleId: string) => Promise<{ success: boolean; error?: string }>
  addParticipant: (raffleId: string, number: number, name: string, phone: string) => Promise<{ success: boolean; error?: string }>
  removeParticipant: (raffleId: string, participantId: string) => Promise<{ success: boolean; error?: string }>
  togglePaid: (raffleId: string, participantId: string, isPaid: boolean) => Promise<void>
  spinWheel: (raffleId: string) => Promise<{ number: number; name: string } | null>
  resetRaffle: (raffleId: string) => Promise<void>
  selectRaffle: (id: string | null) => void
  getSelectedRaffle: () => Raffle | undefined
  getRaffleStats: (raffleId: string) => { soldNumbers: number; totalAmount: number; paidAmount: number; availableNumbers: number }
}

export const useRaffleStore = create<RaffleStore>()((set, get) => ({
  raffles: [],
  isLoading: false,
  selectedRaffleId: null,
  spinningResult: null,

  loadRaffles: async (projectId) => {
    set({ isLoading: true })
    try {
      const response = await fetch(`/api/raffles?project_id=${projectId}`)
      if (!response.ok) throw new Error('Error cargando rifas')
      const data = await response.json()
      set({ raffles: data.raffles || [], isLoading: false })
    } catch (err) {
      console.error('Error loading raffles:', err)
      set({ isLoading: false })
    }
  },

  createRaffle: async (projectId, name, description, amount, totalNumbers) => {
    try {
      const response = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, name, description, amount, total_numbers: totalNumbers }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Error creando rifa' }
      }
      const data = await response.json()
      set((state) => ({ raffles: [...state.raffles, data.raffle] }))
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  },

  deleteRaffle: async (raffleId) => {
    try {
      const response = await fetch(`/api/raffles/${raffleId}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Error eliminando rifa' }
      }
      set((state) => ({
        raffles: state.raffles.filter((r) => r.id !== raffleId),
        selectedRaffleId: state.selectedRaffleId === raffleId ? null : state.selectedRaffleId,
      }))
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  },

  addParticipant: async (raffleId, number, name, phone) => {
    try {
      const response = await fetch(`/api/raffles/${raffleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_participant', number, name, phone }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Error agregando participante' }
      }
      const data = await response.json()
      set((state) => ({
        raffles: state.raffles.map((r) =>
          r.id === raffleId
            ? { ...r, participants: [...r.participants, data.participant] }
            : r
        ),
      }))
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  },

  removeParticipant: async (raffleId, participantId) => {
    try {
      const response = await fetch(`/api/raffles/${raffleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_participant', participant_id: participantId }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Error eliminando participante' }
      }
      set((state) => ({
        raffles: state.raffles.map((r) =>
          r.id === raffleId
            ? { ...r, participants: r.participants.filter((p) => p.id !== participantId) }
            : r
        ),
      }))
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  },

  togglePaid: async (raffleId, participantId, isPaid) => {
    try {
      await fetch(`/api/raffles/${raffleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_participant', participant_id: participantId, is_paid: isPaid }),
      })
      set((state) => ({
        raffles: state.raffles.map((r) =>
          r.id === raffleId
            ? { ...r, participants: r.participants.map((p) => p.id === participantId ? { ...p, is_paid: isPaid } : p) }
            : r
        ),
      }))
    } catch (err) {
      console.error('Error toggling paid:', err)
    }
  },

  spinWheel: async (raffleId) => {
    try {
      const response = await fetch(`/api/raffles/${raffleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spin_wheel' }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error spinning wheel:', errorData.error)
        return null
      }
      const data = await response.json()
      set((state) => ({
        spinningResult: data.winner,
        raffles: state.raffles.map((r) =>
          r.id === raffleId
            ? { ...r, winner_number: data.winner.number, status: 'completed' as const }
            : r
        ),
      }))
      return data.winner
    } catch (err) {
      console.error('Error spinning wheel:', err)
      return null
    }
  },

  resetRaffle: async (raffleId) => {
    try {
      await fetch(`/api/raffles/${raffleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      set((state) => ({
        spinningResult: null,
        raffles: state.raffles.map((r) =>
          r.id === raffleId
            ? { ...r, winner_number: null, status: 'active' as const }
            : r
        ),
      }))
    } catch (err) {
      console.error('Error resetting raffle:', err)
    }
  },

  selectRaffle: (id) => set({ selectedRaffleId: id, spinningResult: null }),

  getSelectedRaffle: () => {
    const state = get()
    return state.raffles.find((r) => r.id === state.selectedRaffleId)
  },

  getRaffleStats: (raffleId) => {
    const raffle = get().raffles.find((r) => r.id === raffleId)
    if (!raffle) return { soldNumbers: 0, totalAmount: 0, paidAmount: 0, availableNumbers: 0 }

    const soldNumbers = raffle.participants.length
    const totalAmount = soldNumbers * raffle.amount
    const paidAmount = raffle.participants.filter((p) => p.is_paid).length * raffle.amount
    const availableNumbers = raffle.total_numbers - soldNumbers

    return { soldNumbers, totalAmount, paidAmount, availableNumbers }
  },
}))
