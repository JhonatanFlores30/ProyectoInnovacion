// Servicio para manejar las recompensas (tarjetas de regalo)
import { supabase } from '../lib/supabase'

export interface Reward {
  id: string
  name: string
  platform: 'netflix' | 'playstore' | 'xbox' | 'psn' | 'steam'
  description: string
  price: number // Precio en AURACOINS
  imageUrl: string
  available: boolean
  cashback?: number // Porcentaje de cashback
  badge?: string // Badge especial (ej: "POPULAR", "OFERTA", etc.)
}

// Tipo para los datos que vienen de la BD
interface RewardDB {
  id: number
  title: string
  description: string | null
  reward_type: string
  provider: string | null
  cost_auracoins: number
  cashback_percentage: number | null
  image_url: string | null
  badge: string | null
  is_active: boolean
  stock_quantity: number | null
}

// URLs de imágenes de tarjetas de regalo
// Nota: En producción, estas imágenes deberían estar almacenadas localmente o en un CDN
// Puedes reemplazar estas URLs con imágenes reales de tarjetas de regalo
const REWARD_IMAGES = {
  netflix: {
    '1mes': 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop&q=80',
    '3meses': 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop&q=80',
  },
  playstore: 'https://androidayuda.com/wp-content/uploads/2019/07/google-play-store-logo.jpg',
  xbox: 'https://pluspng.com/img-png/xbox-logo-png-img-free-png-img-xbox-logo-svg-eps-png-psd-ai-vector-1600x1600.png',
  psn: 'https://www.arenalobby.pk/wp-content/uploads/2024/03/PSN-Arena-Lobby.webp',
  steam: 'https://media.revistagq.com/photos/63c14532852deb8bd8e62d90/16:9/w_2560%2Cc_limit/Steam.jpeg',
}

// Función para obtener el fallback de color si la imagen no carga
export const getPlatformFallbackColor = (platform: Reward['platform']): string => {
  const colors = {
    netflix: '#E50914',
    playstore: '#4285F4',
    xbox: '#107C10',
    psn: '#003087',
    steam: '#171a21',
  }
  return colors[platform]
}

// Función auxiliar para convertir datos de BD al formato Reward
const mapRewardFromDB = (dbReward: RewardDB): Reward | null => {
  // Validar que el provider sea uno de los valores permitidos
  const validPlatforms: Reward['platform'][] = ['netflix', 'playstore', 'xbox', 'psn', 'steam']
  const platform = (dbReward.provider?.toLowerCase() || '') as Reward['platform']
  
  if (!validPlatforms.includes(platform)) {
    console.warn(`⚠️ Plataforma inválida para recompensa ${dbReward.id}: ${dbReward.provider}`)
    return null
  }

  // Obtener imagen por defecto si no hay image_url
  let imageUrl = dbReward.image_url || ''
  if (!imageUrl) {
    // Usar imagen por defecto según la plataforma
    if (platform === 'netflix') {
      imageUrl = REWARD_IMAGES.netflix['1mes']
    } else {
      imageUrl = REWARD_IMAGES[platform] || ''
    }
  }

  return {
    id: dbReward.id.toString(),
    name: dbReward.title,
    platform,
    description: dbReward.description || '',
    price: dbReward.cost_auracoins,
    imageUrl,
    available: dbReward.is_active && (dbReward.stock_quantity === null || dbReward.stock_quantity > 0),
    cashback: dbReward.cashback_percentage ? Number(dbReward.cashback_percentage) : undefined,
    badge: dbReward.badge || undefined,
  }
}

// Catálogo de recompensas desde Supabase
export const getRewards = async (): Promise<Reward[]> => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('provider', { ascending: true })
      .order('cost_auracoins', { ascending: true })

    if (error) {
      console.error('Error obteniendo recompensas desde Supabase:', error)
      // Fallback: retornar array vacío en caso de error
      return []
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No se encontraron recompensas en la base de datos')
      return []
    }

    // Convertir datos de BD al formato Reward
    const rewards = data
      .map(mapRewardFromDB)
      .filter((reward): reward is Reward => reward !== null)

    return rewards
  } catch (error) {
    console.error('Error inesperado obteniendo recompensas:', error)
    return []
  }
}

/**
 * Obtiene recompensas filtradas por plataforma
 */
export const getRewardsByPlatform = async (platform: Reward['platform']): Promise<Reward[]> => {
  const allRewards = await getRewards()
  return allRewards.filter(reward => reward.platform === platform)
}

/**
 * Obtiene una recompensa por ID
 */
export const getRewardById = async (id: string): Promise<Reward | null> => {
  try {
    // Intentar obtener directamente desde la BD
    const rewardId = parseInt(id, 10)
    if (isNaN(rewardId)) {
      // Si el ID no es numérico, buscar en todas las recompensas
      const allRewards = await getRewards()
      return allRewards.find(reward => reward.id === id) || null
    }

    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      // Fallback: buscar en todas las recompensas
      const allRewards = await getRewards()
      return allRewards.find(reward => reward.id === id) || null
    }

    return mapRewardFromDB(data as RewardDB)
  } catch (error) {
    console.error('Error obteniendo recompensa por ID:', error)
    // Fallback: buscar en todas las recompensas
    const allRewards = await getRewards()
    return allRewards.find(reward => reward.id === id) || null
  }
}

