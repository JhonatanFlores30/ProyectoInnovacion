// Edge Function para enviar correo de confirmación de canje
// Nota: Este archivo se ejecuta en Deno runtime en Supabase
// Deno está disponible globalmente, no necesita declaración
// @ts-ignore - Deno está disponible en Supabase Edge Functions

// Buscar la API key con ambos nombres posibles (singular y plural)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || Deno.env.get('RESEND_API_KEYS')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'

// ============================================
// CONFIGURACIÓN DEL DISEÑO DEL CORREO
// ============================================
const EMAIL_CONFIG = {
  // Colores principales
  primaryColor: '#667eea',        // Color principal (azul/morado)
  secondaryColor: '#764ba2',      // Color secundario del gradiente
  successColor: '#10b981',         // Color para cashback/éxito
  warningColor: '#ffc107',         // Color para el código de canje
  textColor: '#333333',            // Color del texto principal
  lightTextColor: '#666666',       // Color del texto secundario
  
  // Estilos del header
  headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  headerText: '¡Canje Exitoso!',
  
  // Nombre de la empresa
  companyName: 'AuraCoins',
  
  // Mensajes personalizables
  greeting: 'Hola',
  mainMessage: 'Tu canje de recompensa ha sido procesado exitosamente. Aquí están los detalles:',
  codeLabel: 'TU CÓDIGO DE CANJE:',
  importantNote: 'Importante: Guarda este código de forma segura. Necesitarás usarlo para activar tu tarjeta de regalo.',
  helpMessage: 'Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.',
  footerMessage: '¡Gracias por usar nuestro servicio!',
  autoMessage: 'Este es un correo automático, por favor no respondas a este mensaje.',
}

interface RedemptionEmailData {
  userEmail: string
  userName: string
  rewardName: string
  redemptionCode: string
  platform: string
  auracoinsSpent: number
  cashbackEarned?: number
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  // Validar que sea método POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido. Use POST.' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Validar API Key
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY no está configurada')
      return new Response(
        JSON.stringify({ 
          error: 'RESEND_API_KEY no está configurada en Supabase Secrets',
          hint: 'Ve a Settings > Edge Functions > Secrets y agrega RESEND_API_KEY'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validar que el email remitente esté configurado
    if (!RESEND_FROM_EMAIL || RESEND_FROM_EMAIL === 'noreply@example.com') {
      console.warn('⚠️ RESEND_FROM_EMAIL no está configurado. Usando onboarding@resend.dev (solo para desarrollo)')
    }

    // Obtener los datos del body
    let emailData: RedemptionEmailData
    try {
      const body = await req.json()
      // Supabase functions.invoke envía los datos directamente en el body
      // pero puede venir envuelto en diferentes formatos
      if (body && typeof body === 'object') {
        // Si tiene la propiedad 'data', usarla; si no, usar el body directamente
        emailData = (body.data && typeof body.data === 'object') ? body.data : body
      } else {
        throw new Error('Formato de datos inválido')
      }
    } catch (parseError) {
      console.error('Error parseando request:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Error al parsear el JSON del request',
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!emailData || !emailData.userEmail || !emailData.redemptionCode) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Crear el HTML del correo usando la configuración
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Canje - ${EMAIL_CONFIG.companyName}</title>
        </head>
        <body style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: ${EMAIL_CONFIG.textColor}; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <!-- Header con gradiente -->
          <div style="background: ${EMAIL_CONFIG.headerGradient}; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              ${EMAIL_CONFIG.headerText}
            </h1>
          </div>
          
          <!-- Contenido principal -->
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Saludo -->
            <p style="font-size: 18px; margin-bottom: 20px; color: ${EMAIL_CONFIG.textColor};">
              ${EMAIL_CONFIG.greeting} <strong style="color: ${EMAIL_CONFIG.primaryColor};">${emailData.userName || 'Usuario'}</strong>,
            </p>
            
            <!-- Mensaje principal -->
            <p style="font-size: 16px; margin-bottom: 30px; color: ${EMAIL_CONFIG.textColor};">
              ${EMAIL_CONFIG.mainMessage}
            </p>
            
            <!-- Tarjeta de detalles -->
            <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${EMAIL_CONFIG.primaryColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h2 style="color: ${EMAIL_CONFIG.primaryColor}; margin-top: 0; font-size: 22px; font-weight: bold; margin-bottom: 20px;">
                 Detalles del Canje
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: ${EMAIL_CONFIG.lightTextColor};"><strong>Recompensa:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: ${EMAIL_CONFIG.textColor};"><strong>${emailData.rewardName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${EMAIL_CONFIG.lightTextColor};"><strong>Plataforma:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: ${EMAIL_CONFIG.textColor};"><strong>${emailData.platform.toUpperCase()}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${EMAIL_CONFIG.lightTextColor};"><strong>AuraCoins gastados:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: ${EMAIL_CONFIG.textColor};"><strong>${emailData.auracoinsSpent.toLocaleString()}</strong></td>
                </tr>
                ${emailData.cashbackEarned && emailData.cashbackEarned > 0 
                  ? `<tr>
                       <td style="padding: 8px 0; color: ${EMAIL_CONFIG.lightTextColor};"><strong>Cashback ganado:</strong></td>
                       <td style="padding: 8px 0; text-align: right; color: ${EMAIL_CONFIG.successColor};"><strong>+${emailData.cashbackEarned.toLocaleString()} AuraCoins</strong></td>
                     </tr>`
                  : ''
                }
              </table>
            </div>
            
            <!-- Código de canje destacado -->
            <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%); border: 3px solid ${EMAIL_CONFIG.warningColor}; padding: 30px 20px; border-radius: 12px; margin: 30px 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #856404; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                ${EMAIL_CONFIG.codeLabel}
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px dashed ${EMAIL_CONFIG.warningColor};">
                <p style="margin: 0; font-size: 36px; font-weight: bold; color: #856404; letter-spacing: 6px; font-family: 'Courier New', 'Monaco', monospace; word-break: break-all;">
                  ${emailData.redemptionCode}
                </p>
              </div>
            </div>
            
            <!-- Nota importante -->
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0066cc;">
              <p style="margin: 0; font-size: 14px; color: #004085; line-height: 1.6;">
                <strong>${EMAIL_CONFIG.importantNote}</strong>
              </p>
            </div>
            
            <!-- Mensaje de ayuda -->
            <p style="font-size: 15px; color: ${EMAIL_CONFIG.lightTextColor}; margin-top: 35px; line-height: 1.6;">
              ${EMAIL_CONFIG.helpMessage}
            </p>
            
            <!-- Firma -->
            <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #e0e0e0;">
              <p style="font-size: 15px; color: ${EMAIL_CONFIG.textColor}; margin: 0;">
                ${EMAIL_CONFIG.footerMessage}
              </p>
              <p style="font-size: 14px; color: ${EMAIL_CONFIG.primaryColor}; margin: 10px 0 0 0; font-weight: bold;">
                El equipo de ${EMAIL_CONFIG.companyName}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 25px; padding-top: 20px;">
            <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.5;">
              ${EMAIL_CONFIG.autoMessage}
            </p>
            <p style="font-size: 11px; color: #bbbbbb; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} ${EMAIL_CONFIG.companyName}. Todos los derechos reservados.
            </p>
          </div>
        </body>
      </html>
    `

    // Enviar el correo usando Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: emailData.userEmail,
        subject: `✅ Canje Exitoso - ${emailData.rewardName}`,
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json()
      console.error('Error de Resend:', errorData)
      throw new Error(`Error al enviar correo: ${errorData.message || 'Error desconocido'}`)
    }

    const resendData = await resendResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Correo enviado exitosamente',
        resendId: resendData.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    // Log detallado del error para debugging
    console.error('❌ Error en send-redemption-email:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available')
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error al enviar el correo',
        details: error.toString(),
        type: error instanceof Error ? error.name : 'UnknownError'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

