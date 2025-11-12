import { createClient } from '@supabase/supabase-js'

// Obtener las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Debug: mostrar variables en desarrollo
if (import.meta.env.DEV) {
  console.log('🔍 Variables de entorno Supabase:')
  console.log('   URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante')
  console.log('   Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante')
}

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `
❌ Faltan las variables de entorno de Supabase.

Por favor, asegúrate de que tu archivo .env contiene:
VITE_SUPABASE_URL=https://rtmmecqagswwdipbrjua.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

⚠️ IMPORTANTE: Después de agregar las variables, REINICIA el servidor de desarrollo.
`
  throw new Error(errorMsg)
}

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          balance: number
          streak: number
          longest_streak: number
          last_activity_date: string | null
          total_points_earned: number
          level: number
          experience_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          balance?: number
          streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          total_points_earned?: number
          level?: number
          experience_points?: number
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          balance?: number
          streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          total_points_earned?: number
          level?: number
          experience_points?: number
        }
      }
    }
  }
}

