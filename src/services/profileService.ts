// Servicio para manejar el perfil del usuario (balance, streak, etc.)
import { supabase } from '../lib/supabase'

export interface UserProfile {
  id: string
  email: string
  name: string
  balance: number
  streak: number
  longest_streak: number
  level: number
  experience_points: number
  total_points_earned: number
  last_activity_date: string | null
}

/**
 * Obtiene el perfil completo del usuario desde Supabase
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error obteniendo perfil del usuario:', error)
      return null
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      balance: data.balance || 0,
      streak: data.streak || 0,
      longest_streak: data.longest_streak || 0,
      level: data.level || 1,
      experience_points: data.experience_points || 0,
      total_points_earned: data.total_points_earned || 0,
      last_activity_date: data.last_activity_date,
    }
  } catch (error) {
    console.error('Error inesperado obteniendo perfil:', error)
    return null
  }
}

/**
 * Actualiza el balance del usuario
 */
export const updateBalance = async (
  userId: string,
  newBalance: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId)

    if (error) {
      console.error('Error actualizando balance:', error)
      return {
        success: false,
        error: error.message || 'Error al actualizar el balance'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error inesperado actualizando balance:', error)
    return {
      success: false,
      error: 'Error inesperado al actualizar el balance'
    }
  }
}

/**
 * Actualiza el streak del usuario
 */
export const updateStreak = async (
  userId: string,
  newStreak: number,
  longestStreak?: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: { streak: number; longest_streak?: number } = {
      streak: newStreak
    }

    if (longestStreak !== undefined) {
      updateData.longest_streak = longestStreak
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('Error actualizando streak:', error)
      return {
        success: false,
        error: error.message || 'Error al actualizar el streak'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error inesperado actualizando streak:', error)
    return {
      success: false,
      error: 'Error inesperado al actualizar el streak'
    }
  }
}

/**
 * Agrega puntos al balance del usuario (ganar AuraCoins)
 */
export const addBalance = async (
  userId: string,
  amount: number,
  description?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Obtener el balance actual
    const profile = await getUserProfile(userId)
    if (!profile) {
      return {
        success: false,
        error: 'No se pudo obtener el perfil del usuario'
      }
    }

    const newBalance = profile.balance + amount

    // Actualizar el balance
    const balanceResult = await updateBalance(userId, newBalance)
    if (!balanceResult.success) {
      return balanceResult
    }

    // Registrar la transacción en point_transactions
    const { error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'earned',
        amount: amount,
        balance_after: newBalance,
        source_type: 'manual',
        description: description || `Ganaste ${amount} AuraCoins`
      })

    if (transactionError) {
      console.error('Error registrando transacción:', transactionError)
      // No fallar si solo falla el registro de la transacción
    }

    // Actualizar total_points_earned
    await supabase
      .from('profiles')
      .update({ total_points_earned: (profile.total_points_earned || 0) + amount })
      .eq('id', userId)

    return { success: true }
  } catch (error) {
    console.error('Error inesperado agregando balance:', error)
    return {
      success: false,
      error: 'Error inesperado al agregar balance'
    }
  }
}

/**
 * Resta puntos del balance del usuario (gastar AuraCoins)
 */
export const subtractBalance = async (
  userId: string,
  amount: number,
  description?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Obtener el balance actual
    const profile = await getUserProfile(userId)
    if (!profile) {
      return {
        success: false,
        error: 'No se pudo obtener el perfil del usuario'
      }
    }

    if (profile.balance < amount) {
      return {
        success: false,
        error: 'Balance insuficiente'
      }
    }

    const newBalance = profile.balance - amount

    // Actualizar el balance
    const balanceResult = await updateBalance(userId, newBalance)
    if (!balanceResult.success) {
      return balanceResult
    }

    // Registrar la transacción en point_transactions
    const { error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'spent',
        amount: -amount,
        balance_after: newBalance,
        source_type: 'redemption',
        description: description || `Gastaste ${amount} AuraCoins`
      })

    if (transactionError) {
      console.error('Error registrando transacción:', transactionError)
      // No fallar si solo falla el registro de la transacción
    }

    return { success: true }
  } catch (error) {
    console.error('Error inesperado restando balance:', error)
    return {
      success: false,
      error: 'Error inesperado al restar balance'
    }
  }
}

/**
 * Actualiza la última actividad del usuario (para manejar streaks)
 */
export const updateLastActivity = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    const { error } = await supabase
      .from('profiles')
      .update({ last_activity_date: today })
      .eq('id', userId)

    if (error) {
      console.error('Error actualizando última actividad:', error)
      return {
        success: false,
        error: error.message || 'Error al actualizar la última actividad'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error inesperado actualizando última actividad:', error)
    return {
      success: false,
      error: 'Error inesperado al actualizar la última actividad'
    }
  }
}

