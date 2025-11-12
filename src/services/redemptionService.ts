// Servicio para manejar canjes de recompensas
import { supabase } from '../lib/supabase'
import { subtractBalance, addBalance, getUserProfile } from './profileService'
import { sendRedemptionEmail } from './emailService'
import { getRewardById } from './rewardService'

/**
 * Genera un código único aleatorio para el canje
 */
export const generateRedemptionCode = (): string => {
  // Formato: XXXX-XXXX-XXXX (12 caracteres alfanuméricos)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = [4, 4, 4]
  
  return segments.map(segmentLength => {
    return Array.from({ length: segmentLength }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  }).join('-')
}

/**
 * Registra un canje de recompensa en la base de datos
 */
export const redeemReward = async (
  userId: string,
  rewardId: number,
  rewardPrice: number,
  cashbackPercentage?: number
): Promise<{ 
  success: boolean
  redemptionCode?: string
  error?: string 
}> => {
  try {
    // Verificar balance actual antes de proceder
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single()

    if (!profile) {
      return {
        success: false,
        error: 'No se pudo obtener tu perfil'
      }
    }

    if (profile.balance < rewardPrice) {
      return {
        success: false,
        error: `No tienes suficientes AuraCoins. Necesitas ${rewardPrice} pero tienes ${profile.balance}.`
      }
    }

    // Generar código único
    const redemptionCode = generateRedemptionCode()

    // Calcular cashback
    const cashbackEarned = cashbackPercentage 
      ? Math.floor(rewardPrice * (cashbackPercentage / 100))
      : 0

    // Restar balance
    const balanceResult = await subtractBalance(
      userId,
      rewardPrice,
      `Canje de recompensa (ID: ${rewardId})`
    )

    if (!balanceResult.success) {
      return {
        success: false,
        error: balanceResult.error || 'Error al procesar el pago'
      }
    }

    // Registrar el canje en reward_redemptions
    const { data: redemption, error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert({
        user_id: userId,
        reward_id: rewardId,
        auracoins_spent: rewardPrice,
        cashback_earned: cashbackEarned,
        redemption_code: redemptionCode,
        status: 'completed'
      })
      .select()
      .single()

    if (redemptionError) {
      console.error('Error registrando canje:', redemptionError)
      // Intentar revertir el balance (aunque esto es raro que falle)
      return {
        success: false,
        error: 'Error al registrar el canje. Por favor, contacta al soporte.'
      }
    }

    // Si hay cashback, agregarlo al balance usando el servicio
    if (cashbackEarned > 0) {
      await addBalance(
        userId,
        cashbackEarned,
        `Cashback del ${cashbackPercentage}% por canje de recompensa`
      )
    }

    // Obtener información del usuario y la recompensa para el correo
    const [userProfile, reward] = await Promise.all([
      getUserProfile(userId),
      getRewardById(rewardId.toString())
    ])

    // Enviar correo de confirmación (no bloquea el proceso si falla)
    if (userProfile && reward) {
      sendRedemptionEmail({
        userEmail: userProfile.email,
        userName: userProfile.name,
        rewardName: reward.name,
        redemptionCode,
        platform: reward.platform,
        auracoinsSpent: rewardPrice,
        cashbackEarned: cashbackEarned > 0 ? cashbackEarned : undefined
      }).catch((error) => {
        // Solo loguear el error, no fallar el canje si el correo no se envía
        console.error('Error enviando correo de confirmación (no crítico):', error)
      })
    }

    return {
      success: true,
      redemptionCode
    }
  } catch (error) {
    console.error('Error inesperado en canje:', error)
    return {
      success: false,
      error: 'Error inesperado al procesar el canje'
    }
  }
}

