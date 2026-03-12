import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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

export interface Project {
  id: string
  name: string
  description: string
  sales: Sale[]
  expenses: Expense[]
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
  loadFromSupabase: () => Promise<void>
  
  // Project actions
  addProject: (name: string, description: string) => Promise<{ success: boolean; error?: string }>
  updateProject: (id: string, name: string, description: string) => Promise<{ success: boolean; error?: string }>
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
      
      loadFromSupabase: async () => {
        if (!isSupabaseConfigured || !supabase) {
          set({ connectionError: 'Supabase no está configurado' })
          return
        }
        
        set({ isLoading: true, connectionError: null })
        console.log('Loading from Supabase...')
        
        try {
          // Load projects
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (projectsError) {
            console.error('Error loading projects:', projectsError)
            set({ 
              connectionError: `Error: ${projectsError.message}`,
              isLoading: false 
            })
            return
          }
          
          // Load sales
          const { data: salesData, error: salesError } = await supabase
            .from('sales')
            .select('*')
          
          if (salesError) {
            console.error('Error loading sales:', salesError)
          }
          
          // Load expenses
          const { data: expensesData, error: expensesError } = await supabase
            .from('expenses')
            .select('*')
          
          if (expensesError) {
            console.error('Error loading expenses:', expensesError)
          }
          
          // Load settings
          const { data: settingsData } = await supabase
            .from('settings')
            .select('savings_goal')
            .eq('id', 1)
            .single()
          
          // Transform data
          const projects: Project[] = (projectsData || []).map((p: {
            id: string
            name: string
            description: string
            created_at: string
            updated_at: string
          }) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            sales: (salesData || [])
              .filter((s: { project_id: string }) => s.project_id === p.id)
              .map((s: {
                id: string
                concept: string
                amount: number | string
                quantity: number | null
                client: string
                status: string
                delivery_date: string | null
                created_at: string
              }) => ({
                id: s.id,
                concept: s.concept,
                amount: Number(s.amount),
                quantity: s.quantity || 1,
                client: s.client || '',
                status: (s.status || 'pending') as PaymentStatus,
                deliveryDate: s.delivery_date || '',
                createdAt: s.created_at
              })),
            expenses: (expensesData || [])
              .filter((e: { project_id: string }) => e.project_id === p.id)
              .map((e: {
                id: string
                concept: string
                amount: number | string
                quantity: number | null
                notes: string
                created_at: string
              }) => ({
                id: e.id,
                concept: e.concept,
                amount: Number(e.amount),
                quantity: e.quantity || 1,
                notes: e.notes || '',
                createdAt: e.created_at
              })),
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }))
          
          console.log('Loaded projects:', projects.length)
          
          set({ 
            projects, 
            savingsGoal: settingsData?.savings_goal || 0,
            isLoading: false,
            connectionError: null
          })
        } catch (err) {
          console.error('Exception loading data:', err)
          set({ 
            connectionError: String(err),
            isLoading: false 
          })
        }
      },
      
      addProject: async (name, description) => {
        if (!isSupabaseConfigured || !supabase) {
          return { success: false, error: 'Supabase no configurado' }
        }
        
        try {
          console.log('Creating project:', name)
          const { data, error } = await supabase
            .from('projects')
            .insert([{ name, description: description || '' }])
            .select()
            .single()
          
          if (error) {
            console.error('Error creating project:', error)
            return { success: false, error: error.message }
          }
          
          const newProject: Project = {
            id: data.id,
            name: data.name,
            description: data.description || '',
            sales: [],
            expenses: [],
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }
          
          set(state => ({ projects: [...state.projects, newProject] }))
          console.log('Project created:', data.id)
          return { success: true }
        } catch (err) {
          console.error('Exception creating project:', err)
          return { success: false, error: String(err) }
        }
      },
      
      updateProject: async (id, name, description) => {
        if (!supabase) return { success: false, error: 'No hay conexión' }
        
        try {
          const { error } = await supabase
            .from('projects')
            .update({ name, description })
            .eq('id', id)
          
          if (error) return { success: false, error: error.message }
          
          set(state => ({
            projects: state.projects.map(p => 
              p.id === id ? { ...p, name, description } : p
            )
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      
      deleteProject: async (id) => {
        if (!supabase) return { success: false, error: 'No hay conexión' }
        
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
          
          if (error) return { success: false, error: error.message }
          
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      
      selectProject: (id) => set({ selectedProjectId: id }),
      
      addSale: async (projectId, saleData) => {
        if (!supabase) return { success: false, error: 'No hay conexión' }
        
        try {
          const { data, error } = await supabase
            .from('sales')
            .insert([{
              project_id: projectId,
              concept: saleData.concept,
              amount: saleData.amount,
              quantity: saleData.quantity || 1,
              client: saleData.client || '',
              status: saleData.status,
              delivery_date: saleData.deliveryDate || null
            }])
            .select()
            .single()
          
          if (error) return { success: false, error: error.message }
          
          const newSale: Sale = {
            id: data.id,
            concept: data.concept,
            amount: Number(data.amount),
            quantity: data.quantity || 1,
            client: data.client || '',
            status: data.status as PaymentStatus,
            deliveryDate: data.delivery_date || '',
            createdAt: data.created_at
          }
          
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId ? { ...p, sales: [...p.sales, newSale] } : p
            )
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      
      updateSale: async (projectId, saleId, saleData) => {
        if (!supabase) return { success: false, error: 'No hay conexión' }
        
        try {
          const { error } = await supabase
            .from('sales')
            .update({
              concept: saleData.concept,
              amount: saleData.amount,
              quantity: saleData.quantity,
              client: saleData.client,
              status: saleData.status,
              delivery_date: saleData.deliveryDate || null
            })
            .eq('id', saleId)
          
          if (error) return { success: false, error: error.message }
          
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId 
                ? { ...p, sales: p.sales.map(s => s.id === saleId ? { ...s, ...saleData } : s) }
                : p
            )
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      
      deleteSale: async (projectId, saleId) => {
        if (!supabase) return { success: false, error: 'No hay conexión' }
        
        try {
          const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', saleId)
          
          if (error) return { success: false, error: error.message }
          
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId 
                ? { ...p, sales: p.sales.filter(s => s.id !== saleId) }
                : p
            )
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      
      addExpense: async (projectId, expenseData) => {
        if (!supabase) return { success: false, error: 'No hay conexión' }
        
        try {
          const { data, error } = await supabase
            .from('expenses')
            .insert([{
              project_id: projectId,
              concept: expenseData.concept,
              amount: expenseData.amount,
              quantity: expenseData.quantity || 1,
              notes: expenseData.notes || ''
            }])
            .select()
            .single()
          
          if (error) return { success: false, error: error.message }
          
          const newExpense: Expense = {
            id: data.id,
            concept: data.concept,
            amount: Number(data.amount),
            quantity: data.quantity || 1,
            notes: data.notes || '',
            createdAt: data.created_at
          }
          
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId ? { ...p, expenses: [...p.expenses, newExpense] } : p
            )
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      
      updateExpense: async (projectId, expenseId, expenseData) => {
        if (!supabase) return { success: false, error: 'No hay conexión' }
        
        try {
          const { error } = await supabase
            .from('expenses')
            .update({
              concept: expenseData.concept,
              amount: expenseData.amount,
              quantity: expenseData.quantity,
              notes: expenseData.notes
            })
            .eq('id', expenseId)
          
          if (error) return { success: false, error: error.message }
          
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId 
                ? { ...p, expenses: p.expenses.map(e => e.id === expenseId ? { ...e, ...expenseData } : e) }
                : p
            )
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      
      deleteExpense: async (projectId, expenseId) => {
        if (!supabase) return { success: false, error: 'No hay conexión' }
        
        try {
          const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expenseId)
          
          if (error) return { success: false, error: error.message }
          
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId 
                ? { ...p, expenses: p.expenses.filter(e => e.id !== expenseId) }
                : p
            )
          }))
          return { success: true }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      
      setSavingsGoal: async (amount) => {
        set({ savingsGoal: amount })
        if (supabase) {
          try {
            await supabase
              .from('settings')
              .upsert({ id: 1, savings_goal: amount })
          } catch (err) {
            console.error('Error saving goal:', err)
          }
        }
      },
      
      getSelectedProject: () => {
        const state = get()
        return state.projects.find(p => p.id === state.selectedProjectId)
      },
      
      getProjectTotals: (projectId) => {
        const project = get().projects.find(p => p.id === projectId)
        if (!project) return { totalSales: 0, paidSales: 0, pendingSales: 0, totalExpenses: 0, netProfit: 0, totalQuantitySold: 0, totalQuantityPurchased: 0 }
        
        const paidSales = project.sales.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0)
        const pendingSales = project.sales.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0)
        const totalSales = paidSales + pendingSales
        const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0)
        const netProfit = totalSales - totalExpenses
        const totalQuantitySold = project.sales.reduce((sum, s) => sum + (s.quantity || 1), 0)
        const totalQuantityPurchased = project.expenses.reduce((sum, e) => sum + (e.quantity || 1), 0)
        
        return { totalSales, paidSales, pendingSales, totalExpenses, netProfit, totalQuantitySold, totalQuantityPurchased }
      },
      
      getGlobalTotals: () => {
        const { projects, savingsGoal } = get()
        
        let totalSales = 0, paidSales = 0, pendingSales = 0, totalExpenses = 0, totalQuantitySold = 0, totalQuantityPurchased = 0, totalSalesCount = 0, totalExpensesCount = 0
        
        projects.forEach(project => {
          paidSales += project.sales.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0)
          pendingSales += project.sales.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0)
          totalExpenses += project.expenses.reduce((sum, e) => sum + e.amount, 0)
          totalQuantitySold += project.sales.reduce((sum, s) => sum + (s.quantity || 1), 0)
          totalQuantityPurchased += project.expenses.reduce((sum, e) => sum + (e.quantity || 1), 0)
          totalSalesCount += project.sales.length
          totalExpensesCount += project.expenses.length
        })
        
        totalSales = paidSales + pendingSales
        const netProfit = totalSales - totalExpenses
        const progressPercentage = savingsGoal > 0 ? Math.min((netProfit / savingsGoal) * 100, 100) : 0
        
        return { totalSales, paidSales, pendingSales, totalExpenses, netProfit, progressPercentage, totalQuantitySold, totalQuantityPurchased, totalSalesCount, totalExpensesCount }
      }
    }),
    {
      name: 'wedding-activities-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      }
    }
  )
)
