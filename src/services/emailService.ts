// Servicio para enviar correos electrónicos a través de Edge Functions
import { supabase } from '../lib/supabase'

export interface RedemptionEmailData {
  userEmail: string
  userName: string
  rewardName: string
  redemptionCode: string
  platform: string
  auracoinsSpent: number
  cashbackEarned?: number
}

/**
 * Envía un correo de confirmación de canje al usuario
 */
export const sendRedemptionEmail = async (
  emailData: RedemptionEmailData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-redemption-email', {
      body: emailData,
    })

    if (error) {
      console.error('Error invocando función de correo:', error)
      return {
        success: false,
        error: error.message || 'Error al enviar el correo'
      }
    }

    if (data?.error) {
      console.error('Error en respuesta de función:', data.error)
      return {
        success: false,
        error: data.error || 'Error al enviar el correo'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error inesperado enviando correo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado al enviar el correo'
    }
  }
}

