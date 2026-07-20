import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PaymentStatus = 'paid' | 'pending' | 'in_progress' | 'partial' | 'cancelled'

export interface Sale {
  id: string
  concept: string
  amount: number
  quantity: number
  client: string
  status: PaymentStatus
  deliveryDate: string
  createdAt: string
}

export interface Expense {
  id: string
  concept: string
  amount: number
  quantity: number
  notes: string
  createdAt: string
}

export interface RaffleParticipant {
  id: string
  raffle_id: string
  number: number
  name: string
  phone: string
  is_paid: boolean
  created_at: string
}

export interface ProjectRaffle {
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

export interface Project {
  id: string
  name: string
  description: string
  type: 'project' | 'raffle'
  amountPerNumber: number
  totalNumbers: number
  sales: Sale[]
  expenses: Expense[]
  raffle: ProjectRaffle | null
  createdAt: string
  updatedAt: string
}

interface WeddingStore {
  projects: Project[]
  selectedProjectId: string | null
  savingsGoal: number
  isLoading: boolean
  isHydrated: boolean
  connectionError: string | null

  // Hydration
  setHydrated: (state: boolean) => void

  // Data loading
  loadFromDatabase: () => Promise<void>

  // Project actions
  addProject: (name: string, description: string, type?: 'project' | 'raffle', amountPerNumber?: number, totalNumbers?: number) => Promise<{ success: boolean; error?: string }>
  updateProject: (id: string, name: string, description: string, amountPerNumber?: number, totalNumbers?: number) => Promise<{ success: boolean; error?: string }>
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>
  selectProject: (id: string | null) => void

  // Sale actions
  addSale: (projectId: string, sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>
  updateSale: (projectId: string, saleId: string, sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>
  deleteSale: (projectId: string, saleId: string) => Promise<{ success: boolean; error?: string }>

  // Expense actions
  addExpense: (projectId: string, expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>
  updateExpense: (projectId: string, expenseId: string, expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>
  deleteExpense: (projectId: string, expenseId: string) => Promise<{ success: boolean; error?: string }>

  // Savings goal
  setSavingsGoal: (amount: number) => Promise<void>

  // Getters
  getSelectedProject: () => Project | undefined
  getProjectTotals: (projectId: string) => {
    totalSales: number
    paidSales: number
    pendingSales: number
    totalExpenses: number
    netProfit: number
    totalQuantitySold: number
    totalQuantityPurchased: number
  }
  getGlobalTotals: () => {
    totalSales: number
    paidSales: number
    pendingSales: number
    totalExpenses: number
    netProfit: number
    progressPercentage: number
    totalQuantitySold: number
    totalQuantityPurchased: number
    totalSalesCount: number
    totalExpensesCount: number
  }
}

export const useWeddingStore = create<WeddingStore>()(
  persist(
    (set, get) => ({
      projects: [],
      selectedProjectId: null,
      savingsGoal: 0,
      isLoading: false,
      isHydrated: false,
      connectionError: null,

      setHydrated: (state) => set({ isHydrated: state }),

      loadFromDatabase: async () => {
        set({ isLoading: true, connectionError: null })
        console.log('Loading from Turso via API...')

        try {
          const response = await fetch('/api/projects')
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()

          // Transform data from API format to store format
          const projects: Project[] = (data.projects || []).map((p: {
            id: string
            name: string
            description: string
            type: string
            amount_per_number: number | string
            total_numbers: number | string
            created_at: string
            updated_at: string
            sales: Array<{
              id: string
              concept: string
              amount: number | string
              quantity: number | null
              client: string
              status: string
              delivery_date: string | null
              created_at: string
            }>
            expenses: Array<{
              id: string
              concept: string
              amount: number | string
              quantity: number | null
              notes: string
              created_at: string
            }>
            raffle: {
              id: string
              project_id: string
              name: string
              description: string
              amount: number | string
              total_numbers: number | string
              winner_number: number | null
              status: string
              created_at: string
              updated_at: string
              participants: Array<{
                id: string
                raffle_id: string
                number: number
                name: string
                phone: string
                is_paid: boolean
                created_at: string
              }>
            } | null
          }) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            type: (p.type || 'project') as 'project' | 'raffle',
            amountPerNumber: Number(p.amount_per_number) || 0,
            totalNumbers: Number(p.total_numbers) || 100,
            sales: (p.sales || []).map((s) => ({
              id: s.id,
              concept: s.concept,
              amount: Number(s.amount),
              quantity: s.quantity || 1,
              client: s.client || '',
              status: (s.status || 'pending') as PaymentStatus,
              deliveryDate: s.delivery_date || '',
              createdAt: s.created_at,
            })),
            expenses: (p.expenses || []).map((e) => ({
              id: e.id,
              concept: e.concept,
              amount: Number(e.amount),
              quantity: e.quantity || 1,
              notes: e.notes || '',
              createdAt: e.created_at,
            })),
            raffle: p.raffle ? {
              id: p.raffle.id,
              project_id: p.raffle.project_id,
              name: p.raffle.name,
              description: p.raffle.description || '',
              amount: Number(p.raffle.amount),
              total_numbers: Number(p.raffle.total_numbers),
              winner_number: p.raffle.winner_number !== null ? Number(p.raffle.winner_number) : null,
              status: (p.raffle.status || 'active') as 'active' | 'completed' | 'cancelled',
              created_at: p.raffle.created_at,
              updated_at: p.raffle.updated_at,
              participants: (p.raffle.participants || []).map((part) => ({
                id: part.id,
                raffle_id: part.raffle_id,
                number: Number(part.number),
                name: part.name,
                phone: part.phone || '',
                is_paid: Boolean(part.is_paid),
                created_at: part.created_at,
              })),
            } : null,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }))

          // Load settings
          let savingsGoal = 0
          try {
            const settingsRes = await fetch('/api/settings')
            if (settingsRes.ok) {
              const settingsData = await settingsRes.json()
              savingsGoal = settingsData.settings?.savings_goal || 0
            }
          } catch {
            // Ignore settings errors
          }

          console.log('Loaded projects:', projects.length)

          set({
            projects,
            savingsGoal,
            isLoading: false,
            connectionError: null,
          })
        } catch (err) {
          console.error('Exception loading data:', err)
          set({
            connectionError: String(err),
            isLoading: false,
          })
        }
      },

      addProject: async (name, description, type = 'project', amountPerNumber = 0, totalNumbers = 100) => {
        try {
          console.log('Creating project:', name, 'type:', type)
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              description: description || '',
              type,
              amount_per_number: amountPerNumber,
              total_numbers: totalNumbers,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al crear proyecto' }
          }

          const data = await response.json()
          const newProject: Project = {
            id: data.project.id,
            name: data.project.name,
            description: data.project.description || '',
            type: (data.project.type || 'project') as 'project' | 'raffle',
            amountPerNumber: data.project.amount_per_number || 0,
            totalNumbers: data.project.total_numbers || 100,
            sales: [],
            expenses: [],
            raffle: data.project.raffle ? {
              id: data.project.raffle.id,
              project_id: data.project.raffle.project_id,
              name: data.project.raffle.name,
              description: data.project.raffle.description || '',
              amount: data.project.raffle.amount,
              total_numbers: data.project.raffle.total_numbers,
              winner_number: data.project.raffle.winner_number,
              status: data.project.raffle.status as 'active' | 'completed' | 'cancelled',
              created_at: data.project.raffle.created_at,
              updated_at: data.project.raffle.updated_at,
              participants: [],
            } : null,
            createdAt: data.project.created_at,
            updatedAt: data.project.updated_at,
          }

          set((state) => ({ projects: [...state.projects, newProject] }))
          console.log('Project created:', data.project.id, 'type:', type)
          return { success: true }
        } catch (err) {
          console.error('Exception creating project:', err)
          return { success: false, error: String(err) }
        }
      },

      updateProject: async (id, name, description, amountPerNumber, totalNumbers) => {
        try {
          const body: Record<string, unknown> = { name, description }
          if (amountPerNumber !== undefined) body.amount_per_number = amountPerNumber
          if (totalNumbers !== undefined) body.total_numbers = totalNumbers

          const response = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al actualizar' }
          }

          set((state) => ({
            projects: state.projects.map((p) => {
              if (p.id !== id) return p
              const updated = { ...p, name, description }
              if (amountPerNumber !== undefined) updated.amountPerNumber = amountPerNumber
              if (totalNumbers !== undefined) updated.totalNumbers = totalNumbers
              return updated
            }),
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },

      deleteProject: async (id) => {
        try {
          const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al eliminar' }
          }

          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },

      selectProject: (id) => set({ selectedProjectId: id }),

      addSale: async (projectId, saleData) => {
        try {
          const response = await fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              concept: saleData.concept,
              amount: saleData.amount,
              quantity: saleData.quantity || 1,
              client: saleData.client || '',
              status: saleData.status,
              delivery_date: saleData.deliveryDate || null,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al crear venta' }
          }

          const data = await response.json()
          const newSale: Sale = {
            id: data.sale.id,
            concept: data.sale.concept,
            amount: Number(data.sale.amount),
            quantity: data.sale.quantity || 1,
            client: data.sale.client || '',
            status: data.sale.status as PaymentStatus,
            deliveryDate: data.sale.delivery_date || '',
            createdAt: data.sale.created_at,
          }

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, sales: [...p.sales, newSale] } : p
            ),
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },

      updateSale: async (projectId, saleId, saleData) => {
        try {
          const response = await fetch(`/api/sales/${saleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              concept: saleData.concept,
              amount: saleData.amount,
              quantity: saleData.quantity,
              client: saleData.client,
              status: saleData.status,
              delivery_date: saleData.deliveryDate || null,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al actualizar venta' }
          }

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? { ...p, sales: p.sales.map((s) => (s.id === saleId ? { ...s, ...saleData } : s)) }
                : p
            ),
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },

      deleteSale: async (projectId, saleId) => {
        try {
          const response = await fetch(`/api/sales/${saleId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al eliminar venta' }
          }

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? { ...p, sales: p.sales.filter((s) => s.id !== saleId) }
                : p
            ),
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },

      addExpense: async (projectId, expenseData) => {
        try {
          const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              concept: expenseData.concept,
              amount: expenseData.amount,
              quantity: expenseData.quantity || 1,
              notes: expenseData.notes || '',
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al crear gasto' }
          }

          const data = await response.json()
          const newExpense: Expense = {
            id: data.expense.id,
            concept: data.expense.concept,
            amount: Number(data.expense.amount),
            quantity: data.expense.quantity || 1,
            notes: data.expense.notes || '',
            createdAt: data.expense.created_at,
          }

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, expenses: [...p.expenses, newExpense] } : p
            ),
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },

      updateExpense: async (projectId, expenseId, expenseData) => {
        try {
          const response = await fetch(`/api/expenses/${expenseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              concept: expenseData.concept,
              amount: expenseData.amount,
              quantity: expenseData.quantity,
              notes: expenseData.notes,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al actualizar gasto' }
          }

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? { ...p, expenses: p.expenses.map((e) => (e.id === expenseId ? { ...e, ...expenseData } : e)) }
                : p
            ),
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },

      deleteExpense: async (projectId, expenseId) => {
        try {
          const response = await fetch(`/api/expenses/${expenseId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.error || 'Error al eliminar gasto' }
          }

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? { ...p, expenses: p.expenses.filter((e) => e.id !== expenseId) }
                : p
            ),
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },

      setSavingsGoal: async (amount) => {
        set({ savingsGoal: amount })
        try {
          await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ savings_goal: amount }),
          })
        } catch (err) {
          console.error('Error saving goal:', err)
        }
      },

      getSelectedProject: () => {
        const state = get()
        return state.projects.find((p) => p.id === state.selectedProjectId)
      },

      getProjectTotals: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project)
          return {
            totalSales: 0,
            paidSales: 0,
            pendingSales: 0,
            totalExpenses: 0,
            netProfit: 0,
            totalQuantitySold: 0,
            totalQuantityPurchased: 0,
          }

        // For raffle type projects, calculate totals from raffle participants
        if (project.type === 'raffle' && project.raffle) {
          const raffle = project.raffle
          const soldNumbers = raffle.participants.length
          const paidAmount = raffle.participants.filter((p) => p.is_paid).length * raffle.amount
          const totalSalesAmount = soldNumbers * raffle.amount
          return {
            totalSales: totalSalesAmount,
            paidSales: paidAmount,
            pendingSales: totalSalesAmount - paidAmount,
            totalExpenses: 0,
            netProfit: totalSalesAmount,
            totalQuantitySold: soldNumbers,
            totalQuantityPurchased: 0,
          }
        }

        const paidSales = project.sales.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0)
        const pendingSales = project.sales.filter((s) => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0)
        const totalSales = paidSales + pendingSales
        const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0)
        const netProfit = totalSales - totalExpenses
        const totalQuantitySold = project.sales.reduce((sum, s) => sum + (s.quantity || 1), 0)
        const totalQuantityPurchased = project.expenses.reduce((sum, e) => sum + (e.quantity || 1), 0)

        return { totalSales, paidSales, pendingSales, totalExpenses, netProfit, totalQuantitySold, totalQuantityPurchased }
      },

      getGlobalTotals: () => {
        const { projects, savingsGoal } = get()

        let totalSales = 0,
          paidSales = 0,
          pendingSales = 0,
          totalExpenses = 0,
          totalQuantitySold = 0,
          totalQuantityPurchased = 0,
          totalSalesCount = 0,
          totalExpensesCount = 0

        projects.forEach((project) => {
          // For raffle projects, calculate from raffle data
          if (project.type === 'raffle' && project.raffle) {
            const raffle = project.raffle
            const soldNumbers = raffle.participants.length
            const paidAmount = raffle.participants.filter((p) => p.is_paid).length * raffle.amount
            const totalSalesAmount = soldNumbers * raffle.amount
            totalSales += totalSalesAmount
            paidSales += paidAmount
            pendingSales += totalSalesAmount - paidAmount
            totalQuantitySold += soldNumbers
            totalSalesCount += soldNumbers
            return
          }

          paidSales += project.sales.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0)
          pendingSales += project.sales.filter((s) => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0)
          totalExpenses += project.expenses.reduce((sum, e) => sum + e.amount, 0)
          totalQuantitySold += project.sales.reduce((sum, s) => sum + (s.quantity || 1), 0)
          totalQuantityPurchased += project.expenses.reduce((sum, e) => sum + (e.quantity || 1), 0)
          totalSalesCount += project.sales.length
          totalExpensesCount += project.expenses.length
        })

        totalSales = paidSales + pendingSales
        const netProfit = totalSales - totalExpenses
        const progressPercentage = savingsGoal > 0 ? Math.min((netProfit / savingsGoal) * 100, 100) : 0

        return {
          totalSales,
          paidSales,
          pendingSales,
          totalExpenses,
          netProfit,
          progressPercentage,
          totalQuantitySold,
          totalQuantityPurchased,
          totalSalesCount,
          totalExpensesCount,
        }
      },
    }),
    {
      name: 'wedding-activities-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
