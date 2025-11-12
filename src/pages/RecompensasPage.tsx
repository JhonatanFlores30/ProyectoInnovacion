import { useState, useEffect } from 'react'
import { getRewards, getPlatformFallbackColor, type Reward } from '../services/rewardService'
import { redeemReward } from '../services/redemptionService'
import { getUserProfile } from '../services/profileService'
import { RedemptionConfirmModal } from '../components/RedemptionConfirmModal'
import { RedemptionCodeModal } from '../components/RedemptionCodeModal'
import { 
  MdCardGiftcard,
  MdStars,
  MdFilterList,
  MdSearch,
  MdShoppingCart,
  MdLocalMovies,
  MdPhoneAndroid,
  MdSportsEsports,
  MdComputer
} from 'react-icons/md'
import { motion } from 'framer-motion'
import './RecompensasPage.css'

interface RecompensasPageProps {
  userBalance?: number
  userId?: string
  onRedeem?: (reward: { price: number; name: string }) => void
  onBalanceUpdate?: () => void
}

export const RecompensasPage = ({ 
  userBalance = 0, 
  userId,
  onRedeem,
  onBalanceUpdate 
}: RecompensasPageProps) => {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<Reward['platform'] | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  
  // Estados para modales de canje
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [rewardToRedeem, setRewardToRedeem] = useState<Reward | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [redemptionCode, setRedemptionCode] = useState('')
  const [currentBalance, setCurrentBalance] = useState(userBalance)

  useEffect(() => {
    const loadRewards = async () => {
      setIsLoading(true)
      try {
        const data = await getRewards()
        setRewards(data)
        setFilteredRewards(data)
      } catch (error) {
        console.error('Error cargando recompensas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRewards()
  }, [])

  // Filtrar recompensas por plataforma y búsqueda
  useEffect(() => {
    let filtered = rewards

    // Filtrar por plataforma
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(reward => reward.platform === selectedPlatform)
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(reward => 
        reward.name.toLowerCase().includes(query) ||
        reward.description.toLowerCase().includes(query) ||
        reward.platform.toLowerCase().includes(query)
      )
    }

    setFilteredRewards(filtered)
  }, [rewards, selectedPlatform, searchQuery])

  // Actualizar balance cuando cambie el prop
  useEffect(() => {
    setCurrentBalance(userBalance)
  }, [userBalance])

  // Cargar balance actualizado desde la BD
  const refreshBalance = async () => {
    if (userId) {
      const profile = await getUserProfile(userId)
      if (profile) {
        setCurrentBalance(profile.balance)
      }
    }
  }

  const handleRedeem = (reward: Reward) => {
    // Mostrar modal de confirmación
    setRewardToRedeem(reward)
    setShowConfirmModal(true)
    setSelectedReward(null)
  }

  const handleConfirmRedeem = async () => {
    if (!rewardToRedeem || !userId) {
      alert('Error: No se pudo obtener la información necesaria')
      return
    }

    setIsRedeeming(true)

    try {
      // Convertir el ID de string a number (viene de la BD como integer)
      const rewardId = parseInt(rewardToRedeem.id, 10)
      if (isNaN(rewardId)) {
        alert('Error: ID de recompensa inválido')
        setIsRedeeming(false)
        return
      }

      // Realizar el canje
      const result = await redeemReward(
        userId,
        rewardId,
        rewardToRedeem.price,
        rewardToRedeem.cashback
      )

      if (result.success && result.redemptionCode) {
        // Cerrar modal de confirmación
        setShowConfirmModal(false)
        
        // Mostrar modal con el código
        setRedemptionCode(result.redemptionCode)
        setShowCodeModal(true)
        
        // Actualizar balance
        await refreshBalance()
        if (onBalanceUpdate) {
          onBalanceUpdate()
        }

        // Llamar al callback si existe (para compatibilidad)
        if (onRedeem) {
          onRedeem({ price: rewardToRedeem.price, name: rewardToRedeem.name })
        }
      } else {
        alert(`Error al canjear: ${result.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error en canje:', error)
      alert('Error inesperado al procesar el canje')
    } finally {
      setIsRedeeming(false)
      setRewardToRedeem(null)
    }
  }

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false)
    setRewardToRedeem(null)
    setIsRedeeming(false)
  }

  const handleCloseCodeModal = () => {
    setShowCodeModal(false)
    setRedemptionCode('')
  }

  const platforms: Array<{ value: Reward['platform'] | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { value: 'all', label: 'Todas', icon: MdCardGiftcard },
    { value: 'netflix', label: 'Netflix', icon: MdLocalMovies },
    { value: 'playstore', label: 'Play Store', icon: MdPhoneAndroid },
    { value: 'xbox', label: 'Xbox', icon: MdSportsEsports },
    { value: 'psn', label: 'PlayStation', icon: MdSportsEsports },
    { value: 'steam', label: 'Steam', icon: MdComputer },
  ]

  const getPlatformColor = (platform: Reward['platform']) => {
    const colors = {
      netflix: '#E50914',
      playstore: '#4285F4',
      xbox: '#107C10',
      psn: '#003087',
      steam: '#171a21',
    }
    return colors[platform]
  }

  if (isLoading) {
    return (
      <div className="rewards-loading">
        <div className="loading-spinner"></div>
        <p>Cargando catálogo de recompensas...</p>
      </div>
    )
  }

  return (
    <div className="rewards-page">
      {/* Header */}
      <div className="rewards-header">
        <div className="rewards-header-content">
          <h1 className="rewards-title">
            <MdCardGiftcard className="rewards-title-icon" />
            Catálogo de Recompensas
          </h1>
          <p className="rewards-subtitle">
            Canjea tus AuraCoins por tarjetas de regalo y suscripciones
          </p>
        </div>
        <div className="rewards-balance">
          <MdStars className="balance-icon" />
          <div className="balance-info">
            <span className="balance-label">Tu Balance</span>
            <span className="balance-amount">{currentBalance.toLocaleString()} AURACOINS</span>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="rewards-filters">
        <div className="search-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar recompensas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="platform-filters">
          <MdFilterList className="filter-icon" />
          {platforms.map((platform) => {
            const IconComponent = platform.icon
            return (
              <button
                key={platform.value}
                className={`platform-filter ${selectedPlatform === platform.value ? 'active' : ''}`}
                onClick={() => setSelectedPlatform(platform.value)}
              >
                <IconComponent className="platform-icon" />
                <span className="platform-label">{platform.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid de Recompensas */}
      {filteredRewards.length === 0 ? (
        <div className="rewards-empty">
          <MdCardGiftcard className="empty-icon" />
          <p>No se encontraron recompensas con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="rewards-grid">
          {filteredRewards.map((reward) => (
            <motion.div
              key={reward.id}
              className="reward-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedReward(reward)}
            >
              {reward.badge && (
                <div className={`reward-badge ${reward.badge.toLowerCase()}`}>
                  {reward.badge}
                </div>
              )}
              
              <div 
                className="reward-image-container"
                style={{ 
                  borderColor: getPlatformColor(reward.platform),
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${reward.imageUrl})`,
                  backgroundColor: getPlatformFallbackColor(reward.platform)
                }}
              >
                <div className="reward-image-overlay">
                  <div 
                    className="reward-platform-badge" 
                    style={{ 
                      borderColor: getPlatformColor(reward.platform),
                      boxShadow: `0 0 20px ${getPlatformColor(reward.platform)}40`
                    }}
                  >
                    {reward.platform.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="reward-content">
                <h3 className="reward-name">{reward.name}</h3>
                <p className="reward-description">{reward.description}</p>
                
                <div className="reward-price-section">
                  <div className="reward-price">
                    <span className="price-amount">{reward.price.toLocaleString()}</span>
                    <span className="price-currency">AURACOINS</span>
                    {reward.cashback && (
                      <span className="reward-cashback-percentage">
                        {reward.cashback}% Cashback
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="reward-redeem-btn available"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRedeem(reward)
                  }}
                  disabled={!reward.available}
                >
                  <MdShoppingCart />
                  Canjear Ahora
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Detalle (opcional) */}
      {selectedReward && (
        <div className="reward-modal-overlay" onClick={() => setSelectedReward(null)}>
          <motion.div
            className="reward-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setSelectedReward(null)}>×</button>
            <div className="modal-content">
              <div 
                className="modal-image-container"
                style={{ 
                  borderColor: getPlatformColor(selectedReward.platform),
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${selectedReward.imageUrl})`,
                  backgroundColor: getPlatformFallbackColor(selectedReward.platform)
                }}
              >
                <div className="modal-image-overlay">
                  <div 
                    className="modal-platform-badge" 
                    style={{ 
                      borderColor: getPlatformColor(selectedReward.platform),
                      boxShadow: `0 0 20px ${getPlatformColor(selectedReward.platform)}40`
                    }}
                  >
                    {selectedReward.platform.toUpperCase()}
                  </div>
                </div>
              </div>
              <h2>{selectedReward.name}</h2>
              <p className="modal-description">{selectedReward.description}</p>
              <div className="modal-price">
                <span className="modal-price-amount">{selectedReward.price.toLocaleString()}</span>
                <span className="modal-price-currency">AURACOINS</span>
                {selectedReward.cashback && (
                  <span className="modal-cashback-percentage">
                    {selectedReward.cashback}% Cashback
                  </span>
                )}
              </div>
              <button
                className="modal-redeem-btn available"
                onClick={() => handleRedeem(selectedReward)}
                disabled={!selectedReward.available}
              >
                <MdShoppingCart />
                Canjear por {selectedReward.price.toLocaleString()} AuraCoins
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Confirmación de Canje */}
      <RedemptionConfirmModal
        reward={rewardToRedeem}
        userBalance={currentBalance}
        isOpen={showConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmRedeem}
        isLoading={isRedeeming}
      />

      {/* Modal de Código de Canje */}
      <RedemptionCodeModal
        isOpen={showCodeModal}
        rewardName={rewardToRedeem?.name || ''}
        redemptionCode={redemptionCode}
        cashbackAmount={rewardToRedeem?.cashback 
          ? Math.floor(rewardToRedeem.price * (rewardToRedeem.cashback / 100))
          : undefined
        }
        onClose={handleCloseCodeModal}
      />
    </div>
  )
}

