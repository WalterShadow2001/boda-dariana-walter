// Database types for Supabase

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
      }
      sales: {
        Row: {
          id: string
          project_id: string
          concept: string
          amount: number
          client: string
          status: string
          created_at: string
        }
      }
      expenses: {
        Row: {
          id: string
          project_id: string
          concept: string
          amount: number
          notes: string
          created_at: string
        }
      }
      settings: {
        Row: {
          id: number
          savings_goal: number
          updated_at: string
        }
      }
    }
  }
}
