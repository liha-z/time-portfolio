export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      pots: {
        Row: {
          id: string
          user_id: string
          name: string
          target_minutes_per_day: number
          m_target: number
          difficulty: number
          frequency_per_week: number
          creation_date: string
          current_score: number
          current_gap_days: number
          status: string
        }
        Insert: Partial<Database['public']['Tables']['pots']['Row']> & {
          user_id: string
          name: string
          target_minutes_per_day: number
          m_target: number
        }
        Update: Partial<Database['public']['Tables']['pots']['Row']>
        Relationships: []
      }
      logs: {
        Row: {
          id: string
          pot_id: string
          coins_invested: number
          log_date: string
          invested_at: string
        }
        Insert: Partial<Database['public']['Tables']['logs']['Row']> & {
          pot_id: string
          coins_invested: number
        }
        Update: Partial<Database['public']['Tables']['logs']['Row']>
        Relationships: []
      }
      pot_daily_scores: {
        Row: {
          id: string
          pot_id: string
          score_date: string
          base_score: number
          daily_minutes: number
          daily_reward: number
          effective_gap: number
          streak_days: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['pot_daily_scores']['Row']> & {
          pot_id: string
          score_date: string
          base_score: number
          daily_minutes: number
          daily_reward: number
        }
        Update: Partial<Database['public']['Tables']['pot_daily_scores']['Row']>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      log_time_investment: {
        Args: { p_pot_id: string; p_minutes: number; p_logged_at?: string }
        Returns: {
          log_id: string
          score_date: string
          daily_minutes: number
          current_score: number
          daily_reward: number
          effective_gap: number
          streak_days: number
        }[]
      }
      refresh_current_gap_days: { Args: { p_as_of?: string }; Returns: undefined }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
