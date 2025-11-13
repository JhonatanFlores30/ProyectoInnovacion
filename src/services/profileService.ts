// Servicio para manejar el perfil del usuario (balance, avatar, streak, etc.)
import { supabase } from "../lib/supabase"

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url: string | null
  balance: number
  streak: number
  longest_streak: number
  level: number
  experience_points: number
  total_points_earned: number
  last_activity_date: string | null
}

/**
 * Obtener perfil de usuario desde Supabase
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, name, avatar_url, balance, streak, longest_streak, level, experience_points, total_points_earned, last_activity_date"
      )
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error obteniendo perfil:", error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar_url: data.avatar_url || null,
      balance: data.balance || 0,
      streak: data.streak || 0,
      longest_streak: data.longest_streak || 0,
      level: data.level || 1,
      experience_points: data.experience_points || 0,
      total_points_earned: data.total_points_earned || 0,
      last_activity_date: data.last_activity_date,
    }
  } catch (error) {
    console.error("Error inesperado al obtener perfil:", error)
    return null
  }
}

/**
 * Actualizar perfil completo (nombre, avatar, etc.)
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)

    if (error) {
      console.error("Error actualizando perfil:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error inesperado actualizando perfil:", error)
    return { success: false, error: "Error inesperado al actualizar perfil" }
  }
}

/**
 * Actualizar balance
 */
export const updateBalance = async (userId: string, newBalance: number) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", userId)

    if (error) return { success: false, error: error.message }

    return { success: true }
  } catch {
    return { success: false, error: "Error inesperado al actualizar balance" }
  }
}

/**
 * Sumar AuraCoins
 */
export const addBalance = async (userId: string, amount: number, description?: string) => {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return { success: false, error: "Perfil no encontrado" }

    const newBalance = profile.balance + amount

    const balanceUpdated = await updateBalance(userId, newBalance)
    if (!balanceUpdated.success) return balanceUpdated

    await supabase.from("point_transactions").insert({
      user_id: userId,
      transaction_type: "earned",
      amount,
      balance_after: newBalance,
      source_type: "manual",
      description: description || `Ganaste ${amount} AuraCoins`,
    })

    await supabase
      .from("profiles")
      .update({
        total_points_earned: (profile.total_points_earned || 0) + amount,
      })
      .eq("id", userId)

    return { success: true }
  } catch {
    return { success: false, error: "Error inesperado al agregar balance" }
  }
}

/**
 * Restar AuraCoins
 */
export const subtractBalance = async (userId: string, amount: number, description?: string) => {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return { success: false, error: "Perfil no encontrado" }

    if (profile.balance < amount)
      return { success: false, error: "Balance insuficiente" }

    const newBalance = profile.balance - amount

    const balanceUpdated = await updateBalance(userId, newBalance)
    if (!balanceUpdated.success) return balanceUpdated

    await supabase.from("point_transactions").insert({
      user_id: userId,
      transaction_type: "spent",
      amount: -amount,
      balance_after: newBalance,
      source_type: "redemption",
      description: description || `Gastaste ${amount} AuraCoins`,
    })

    return { success: true }
  } catch {
    return { success: false, error: "Error inesperado al restar balance" }
  }
}

/**
 * Actualizar última actividad
 */
export const updateLastActivity = async (userId: string) => {
  try {
    const today = new Date().toISOString().split("T")[0]

    const { error } = await supabase
      .from("profiles")
      .update({ last_activity_date: today })
      .eq("id", userId)

    if (error) return { success: false, error: error.message }

    return { success: true }
  } catch {
    return { success: false, error: "Error inesperado al actualizar actividad" }
  }
}
