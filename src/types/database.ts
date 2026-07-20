export interface Database {
  projects: {
    id: string
    name: string
    description: string
    type: 'project' | 'raffle'
    amount_per_number: number
    total_numbers: number
    created_at: string
    updated_at: string
  }
  sales: {
    id: string
    project_id: string
    concept: string
    amount: number
    quantity: number
    client: string
    status: string
    delivery_date: string | null
    created_at: string
  }
  expenses: {
    id: string
    project_id: string
    concept: string
    amount: number
    quantity: number
    notes: string
    created_at: string
  }
  raffles: {
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
  }
  raffle_participants: {
    id: string
    raffle_id: string
    number: number
    name: string
    phone: string
    is_paid: number
    created_at: string
  }
  settings: {
    id: number
    savings_goal: number
    theme: string | null
    updated_at: string
  }
  auth_session: {
    id: number
    is_authenticated: number
    updated_at: string
  }
}
