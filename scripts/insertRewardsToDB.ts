// Script para insertar recompensas en Supabase desde TypeScript
// Ejecuta este script con: npx tsx scripts/insertRewardsToDB.ts
// O cópialo y ejecútalo en la consola del navegador cuando estés en desarrollo

import { supabase } from '../src/lib/supabase'

const rewards = [
  {
    title: 'Netflix - 1 Mes',
    description: 'Suscripción mensual completa de Netflix. Disfruta de todo el catálogo sin límites.',
    reward_type: 'subscription',
    provider: 'netflix',
    cost_auracoins: 10000,
    cashback_percentage: 11.0,
    image_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop&q=80',
    badge: 'POPULAR',
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Netflix - 3 Meses',
    description: 'Suscripción trimestral de Netflix. Ahorra más con esta oferta especial.',
    reward_type: 'subscription',
    provider: 'netflix',
    cost_auracoins: 22000,
    cashback_percentage: 15.0,
    image_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop&q=80',
    badge: 'OFERTA',
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Google Play - $10 USD',
    description: 'Tarjeta de regalo de Google Play Store. Compra apps, juegos, música y más.',
    reward_type: 'gift_card',
    provider: 'playstore',
    cost_auracoins: 17000,
    cashback_percentage: 8.0,
    image_url: 'https://androidayuda.com/wp-content/uploads/2019/07/google-play-store-logo.jpg',
    badge: null,
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Google Play - $25 USD',
    description: 'Tarjeta de regalo de Google Play Store. Más valor para tus compras.',
    reward_type: 'gift_card',
    provider: 'playstore',
    cost_auracoins: 25000,
    cashback_percentage: 10.0,
    image_url: 'https://androidayuda.com/wp-content/uploads/2019/07/google-play-store-logo.jpg',
    badge: 'OFERTA',
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Xbox - $10 USD',
    description: 'Tarjeta de regalo de Microsoft Xbox. Compra juegos, DLC y suscripciones.',
    reward_type: 'gift_card',
    provider: 'xbox',
    cost_auracoins: 18000,
    cashback_percentage: 8.0,
    image_url: 'https://pluspng.com/img-png/xbox-logo-png-img-free-png-img-xbox-logo-svg-eps-png-psd-ai-vector-1600x1600.png',
    badge: null,
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Xbox - $25 USD',
    description: 'Tarjeta de regalo de Microsoft Xbox. Más crédito para tu cuenta.',
    reward_type: 'gift_card',
    provider: 'xbox',
    cost_auracoins: 27000,
    cashback_percentage: 10.0,
    image_url: 'https://pluspng.com/img-png/xbox-logo-png-img-free-png-img-xbox-logo-svg-eps-png-psd-ai-vector-1600x1600.png',
    badge: null,
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Xbox - $50 USD',
    description: 'Tarjeta de regalo de Microsoft Xbox. Oferta especial para grandes compras.',
    reward_type: 'gift_card',
    provider: 'xbox',
    cost_auracoins: 40000,
    cashback_percentage: 12.0,
    image_url: 'https://pluspng.com/img-png/xbox-logo-png-img-free-png-img-xbox-logo-svg-eps-png-psd-ai-vector-1600x1600.png',
    badge: 'OFERTA',
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'PlayStation Network - $10 USD',
    description: 'Tarjeta de regalo de PlayStation Network. Compra juegos y contenido exclusivo.',
    reward_type: 'gift_card',
    provider: 'psn',
    cost_auracoins: 18000,
    cashback_percentage: 8.0,
    image_url: 'https://www.arenalobby.pk/wp-content/uploads/2024/03/PSN-Arena-Lobby.webp',
    badge: null,
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'PlayStation Network - $25 USD',
    description: 'Tarjeta de regalo de PlayStation Network. Más crédito para tu cuenta PSN.',
    reward_type: 'gift_card',
    provider: 'psn',
    cost_auracoins: 27000,
    cashback_percentage: 10.0,
    image_url: 'https://www.arenalobby.pk/wp-content/uploads/2024/03/PSN-Arena-Lobby.webp',
    badge: null,
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'PlayStation Network - $50 USD',
    description: 'Tarjeta de regalo de PlayStation Network. Oferta especial para grandes compras.',
    reward_type: 'gift_card',
    provider: 'psn',
    cost_auracoins: 40000,
    cashback_percentage: 12.0,
    image_url: 'https://www.arenalobby.pk/wp-content/uploads/2024/03/PSN-Arena-Lobby.webp',
    badge: 'OFERTA',
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Steam - $10 USD',
    description: 'Tarjeta de regalo de Steam. Compra juegos, DLC y contenido en Steam.',
    reward_type: 'gift_card',
    provider: 'steam',
    cost_auracoins: 18000,
    cashback_percentage: 8.0,
    image_url: 'https://media.revistagq.com/photos/63c14532852deb8bd8e62d90/16:9/w_2560%2Cc_limit/Steam.jpeg',
    badge: null,
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Steam - $25 USD',
    description: 'Tarjeta de regalo de Steam. Más crédito para tu cuenta de Steam.',
    reward_type: 'gift_card',
    provider: 'steam',
    cost_auracoins: 27000,
    cashback_percentage: 10.0,
    image_url: 'https://media.revistagq.com/photos/63c14532852deb8bd8e62d90/16:9/w_2560%2Cc_limit/Steam.jpeg',
    badge: null,
    is_active: true,
    stock_quantity: null,
  },
  {
    title: 'Steam - $50 USD',
    description: 'Tarjeta de regalo de Steam. Oferta especial para grandes compras.',
    reward_type: 'gift_card',
    provider: 'steam',
    cost_auracoins: 40000,
    cashback_percentage: 12.0,
    image_url: 'https://media.revistagq.com/photos/63c14532852deb8bd8e62d90/16:9/w_2560%2Cc_limit/Steam.jpeg',
    badge: 'OFERTA',
    is_active: true,
    stock_quantity: null,
  },
]

async function insertRewards() {
  console.log('🚀 Iniciando inserción de recompensas en Supabase...')
  
  try {
    // Primero, verificar si la tabla tiene los campos necesarios
    const { error: checkError } = await supabase
      .from('rewards')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Error al verificar la tabla rewards:', checkError.message)
      console.log('\n💡 Asegúrate de:')
      console.log('   1. Que la tabla rewards existe en tu base de datos')
      console.log('   2. Que has ejecutado el script migrate_rewards_table.sql primero')
      return
    }

    // Insertar las recompensas
    const { data, error } = await supabase
      .from('rewards')
      .insert(rewards)
      .select()

    if (error) {
      console.error('❌ Error al insertar recompensas:', error.message)
      console.error('Detalles:', error)
      return
    }

    console.log(`✅ Se insertaron ${data?.length || 0} recompensas exitosamente!`)
    console.log('\n📋 Recompensas insertadas:')
    data?.forEach((reward, index) => {
      console.log(`   ${index + 1}. ${reward.title} - ${reward.cost_auracoins} AuraCoins`)
    })

    // Verificar las recompensas insertadas
    const { data: allRewards, error: fetchError } = await supabase
      .from('rewards')
      .select('id, title, provider, cost_auracoins, badge, is_active')
      .order('provider', { ascending: true })
      .order('cost_auracoins', { ascending: true })

    if (fetchError) {
      console.error('⚠️ Error al verificar recompensas:', fetchError.message)
      return
    }

    console.log(`\n📊 Total de recompensas en la BD: ${allRewards?.length || 0}`)
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
insertRewards()

