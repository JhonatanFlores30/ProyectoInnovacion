import { useState, useEffect } from 'react'
import { logout } from '../services/authService'
import type { User } from '../services/authService'
import { Sidebar } from '../components/Sidebar'
import { PeliculasPage } from './PeliculasPage'
import { RecompensasPage } from './RecompensasPage'
import { PerfilPage } from './PerfilPage'
import { getPopularMovies, getMovieImageUrl, getMovieBackdropUrl, type Movie } from '../services/movieService'
import { getRewards, type Reward } from '../services/rewardService'
import { getUserProfile, type UserProfile } from '../services/profileService'
import { redeemReward } from '../services/redemptionService'
import { RedemptionConfirmModal } from '../components/RedemptionConfirmModal'
import { RedemptionCodeModal } from '../components/RedemptionCodeModal'
import { 
  MdStars, 
  MdEvent,
  MdWhatshot,
  MdCardGiftcard,
  MdLocalOffer,
  MdTrendingUp,
  MdPlayArrow,
  MdTimer,
  MdEmojiEvents
} from 'react-icons/md'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { motion } from 'framer-motion'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface DashboardPageProps {
  user: User
  onLogout: () => void
}

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  
  // Estado del perfil del usuario desde Supabase
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Película destacada para la oferta especial
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(7)

  // Recompensas destacadas (con badge)
  const [featuredRewards, setFeaturedRewards] = useState<Reward[]>([])

  // Estados para modales de canje en Dashboard
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [rewardToRedeem, setRewardToRedeem] = useState<Reward | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [redemptionCode, setRedemptionCode] = useState('')

  // Cargar perfil del usuario desde Supabase
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getUserProfile(user.id)
        if (userProfile) {
          setProfile(userProfile)
        } else {
          // Si no existe el perfil, crear uno con valores por defecto
          console.warn('No se encontró perfil, usando valores por defecto')
          setProfile({
            id: user.id,
            email: user.email,
            name: user.name,
            balance: 0,
            streak: 0,
            longest_streak: 0,
            level: 1,
            experience_points: 0,
            total_points_earned: 0,
            last_activity_date: null,
          })
        }
      } catch (error) {
        console.error('Error cargando perfil:', error)
        // Usar valores por defecto en caso de error
        setProfile({
          id: user.id,
          email: user.email,
          name: user.name,
          balance: 0,
          streak: 0,
          longest_streak: 0,
          level: 1,
          experience_points: 0,
          total_points_earned: 0,
          last_activity_date: null,
        })
      }
    }

    if (user.id) {
      loadProfile()
    }
  }, [user.id, user.email, user.name])

  // Recargar perfil cuando cambie la sección activa (para actualizar balance después de canjes)
  useEffect(() => {
    if (activeSection === 'recompensas' && user.id) {
      const reloadProfile = async () => {
        const userProfile = await getUserProfile(user.id)
        if (userProfile) {
          setProfile(userProfile)
        }
      }
      reloadProfile()
    }
  }, [activeSection, user.id])

  // Cargar película destacada (aleatoria, cambia cada 7 días)
  useEffect(() => {
    // Solo ejecutar si user.id está disponible
    const userId = user?.id
    if (!userId) {
      return
    }

    const loadFeaturedMovie = async () => {
      try {
        const movies = await getPopularMovies()
        if (movies.length > 0) {
          const storageKey = `featured_movie_${userId}`
          const storedData = localStorage.getItem(storageKey)
          
          let selectedMovie: Movie | null = null
          let shouldUpdate = false
          
          if (storedData) {
            try {
              const { movie, date } = JSON.parse(storedData)
              const storedDate = new Date(date)
              const now = new Date()
              const daysDiff = Math.floor((now.getTime() - storedDate.getTime()) / (1000 * 60 * 60 * 24))
              
              // Si han pasado 7 días o más, seleccionar una nueva película
              if (daysDiff >= 7) {
                shouldUpdate = true
                if (import.meta.env.DEV) {
                  console.log(`🔄 Han pasado ${daysDiff} días, seleccionando nueva película de la semana...`)
                }
              } else {
                // Usar la película guardada si aún no han pasado 7 días
                selectedMovie = movie
                const daysRemainingCalc = 7 - daysDiff
                setDaysRemaining(daysRemainingCalc)
                if (import.meta.env.DEV) {
                  console.log(`📅 Película de la semana actual (${daysRemainingCalc} días restantes):`, movie.title)
                }
              }
            } catch (error) {
              // Si hay error al parsear, seleccionar nueva película
              shouldUpdate = true
            }
          } else {
            // No hay película guardada, seleccionar una nueva
            shouldUpdate = true
          }
          
          // Seleccionar una película aleatoria si es necesario
          if (shouldUpdate || !selectedMovie) {
            const randomIndex = Math.floor(Math.random() * movies.length)
            selectedMovie = movies[randomIndex]
            
            // Guardar la película seleccionada con la fecha actual
            localStorage.setItem(storageKey, JSON.stringify({
              movie: selectedMovie,
              date: new Date().toISOString()
            }))
            
            // Resetear días restantes a 7 cuando se selecciona una nueva película
            setDaysRemaining(7)
            
            if (import.meta.env.DEV) {
              console.log('🎲 Nueva película de la semana seleccionada (aleatoria):', selectedMovie.title)
            }
          }
          
          setFeaturedMovie(selectedMovie)
        }
      } catch (error) {
        console.error('Error cargando película destacada:', error)
      }
    }
    loadFeaturedMovie()
  }, [user?.id ?? '']) // Usar valor por defecto para mantener el tamaño del array constante

  // Cargar recompensas destacadas
  useEffect(() => {
    const loadFeaturedRewards = async () => {
      try {
        const allRewards = await getRewards()
        // Obtener solo las recompensas que tienen badge (POPULAR u OFERTA)
        const featured = allRewards.filter(reward => reward.badge)
        setFeaturedRewards(featured)
      } catch (error) {
        console.error('Error cargando recompensas destacadas:', error)
      }
    }
    loadFeaturedRewards()
  }, [])

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  const handleRedeemReward = async (reward: { price: number; name: string }) => {
    // Buscar la recompensa completa para mostrar el modal
    const fullReward = featuredRewards.find(r => r.name === reward.name)
    if (fullReward) {
      setRewardToRedeem(fullReward)
      setShowConfirmModal(true)
    }
  }

  const handleConfirmRedeem = async () => {
    if (!rewardToRedeem || !user.id) {
      alert('Error: No se pudo obtener la información necesaria')
      return
    }

    setIsRedeeming(true)

    try {
      const rewardId = parseInt(rewardToRedeem.id, 10)
      if (isNaN(rewardId)) {
        alert('Error: ID de recompensa inválido')
        setIsRedeeming(false)
        return
      }

      const result = await redeemReward(
        user.id,
        rewardId,
        rewardToRedeem.price,
        rewardToRedeem.cashback
      )

      if (result.success && result.redemptionCode) {
        setShowConfirmModal(false)
        setRedemptionCode(result.redemptionCode)
        setShowCodeModal(true)
        
        // Actualizar perfil
        const updatedProfile = await getUserProfile(user.id)
        if (updatedProfile) {
          setProfile(updatedProfile)
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

  // Renderizar contenido según la sección activa
  const renderContent = () => {
    switch (activeSection) {
      case 'peliculas':
        return <PeliculasPage user={user} isHistory={true} />
      
      case 'recompensas':
        return (
          <RecompensasPage 
            userBalance={profile?.balance || 0}
            userId={user.id}
            onRedeem={handleRedeemReward}
            onBalanceUpdate={async () => {
              const updatedProfile = await getUserProfile(user.id)
              if (updatedProfile) {
                setProfile(updatedProfile)
              }
            }}
          />
        )
      case 'perfil':
      return <PerfilPage userId={user.id} /> 
      
      case 'dashboard':
      default:
        return (
          <div className="dashboard-content">
            {/* Película Destacada - Oferta Especial */}
            {featuredMovie && (
              <div className="featured-movie-card">
                <div 
                  className="featured-movie-backdrop"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%), url(${getMovieBackdropUrl(featuredMovie.backdrop_path)})`
                  }}
                >
                  <div className="featured-movie-content">
                    <div className="featured-movie-poster">
                      <img 
                        src={getMovieImageUrl(featuredMovie.poster_path)} 
                        alt={featuredMovie.title}
                      />
                    </div>
                    <div className="featured-movie-info">
                      <div className="featured-badge-text">
                        <MdEvent />
                        <span>Película de la Semana</span>
                      </div>
                      <h2 className="featured-movie-title">{featuredMovie.title}</h2>
                      <p className="featured-movie-overview">
                        {featuredMovie.overview.length > 200 
                          ? `${featuredMovie.overview.substring(0, 200)}...` 
                          : featuredMovie.overview}
                      </p>
                      <div className="featured-reward-compact">
                        <MdStars className="reward-icon-compact" />
                        <span className="reward-amount-compact">
                          {(10 + (profile?.streak || 0)) * 2} AURACOINS
                        </span>
                        <span className="reward-note-compact">(Doble puntos por ver y responder)</span>
                      </div>
                      <div className="featured-actions">
                        <button className="btn-featured-watch">
                          <MdPlayArrow />
                          Ver Película
                        </button>
                        <div className="featured-timer">
                          <MdTimer />
                          <span>Oferta válida hasta: {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Eventos Especiales */}
            <section className="events-section">
              <div className="section-header">
                <h2 className="events-title">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <MdEvent className="section-icon" />
                  </motion.div>
                  <span>Eventos Especiales</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="events-badge"
                  >
                    ¡NUEVO!
                  </motion.div>
                </h2>
              </div>
              
              <div className="events-grid-featured">
                <motion.div
                  className="event-card-featured featured-1"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="event-glow"></div>
                  <div className="event-content-featured">
                    <motion.div
                      className="event-icon-featured"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <MdTrendingUp />
                    </motion.div>
                    <div className="event-badge-featured">🔥 POPULAR</div>
                    <h3 className="event-title-featured">Racha de la Semana</h3>
                    <p className="event-description-featured">
                      Mantén tu racha activa durante 7 días consecutivos y obtén un bono especial
                    </p>
                    <motion.div
                      className="event-reward-featured"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <MdStars className="reward-star" />
                      <div>
                        <span className="reward-label">Recompensa</span>
                        <span className="reward-amount-featured">+50 AURACOINS</span>
                        <span className="reward-subtitle">Bonificación extra</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  className="event-card-featured featured-2"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="event-glow"></div>
                  <div className="event-content-featured">
                    <motion.div
                      className="event-icon-featured"
                      animate={{ rotate: [0, -360] }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    >
                      <MdLocalOffer />
                    </motion.div>
                    <div className="event-badge-featured">⭐ PREMIUM</div>
                    <h3 className="event-title-featured">Desafío Mensual</h3>
                    <p className="event-description-featured">
                      Completa 10 preguntas correctamente este mes y gana una recompensa épica
                    </p>
                    <motion.div
                      className="event-reward-featured"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <MdEmojiEvents className="reward-star" />
                      <div>
                        <span className="reward-label">Recompensa</span>
                        <span className="reward-amount-featured">+100 AURACOINS</span>
                        <span className="reward-subtitle">Recompensa máxima</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  className="event-card-featured featured-3"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="event-glow"></div>
                  <div className="event-content-featured">
                    <motion.div
                      className="event-icon-featured"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    >
                      <MdStars />
                    </motion.div>
                    <div className="event-badge-featured">
                      <MdCardGiftcard />
                      BIENVENIDA
                    </div>
                    <h3 className="event-title-featured">Primera Vez</h3>
                    <p className="event-description-featured">
                      Responde tu primera pregunta y recibe un bono de bienvenida especial
                    </p>
                    <motion.div
                      className="event-reward-featured"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <MdStars className="reward-star" />
                      <div>
                        <span className="reward-label">Recompensa</span>
                        <span className="reward-amount-featured">+25 AURACOINS</span>
                        <span className="reward-subtitle">Bono de bienvenida</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Ofertas Destacadas */}
            <section className="offers-section">
              <div className="section-header">
                <h2>
                  <MdWhatshot className="section-icon" />
                  Ofertas Destacadas
                </h2>
                <button 
                  className="btn-see-all"
                  onClick={() => setActiveSection('recompensas')}
                >
                  Ver todas →
                </button>
              </div>
              
              <div className="offers-slider-container">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    640: {
                      slidesPerView: 1,
                    },
                    768: {
                      slidesPerView: 2,
                    },
                    1024: {
                      slidesPerView: 2,
                    },
                  }}
                  className="offers-swiper"
                >
                  {featuredRewards.map((reward) => (
                    <SwiperSlide key={reward.id}>
                      <div className={`offer-card ${reward.badge?.toLowerCase() === 'popular' ? 'featured' : ''}`}>
                        {reward.badge && (
                          <div className="offer-badge">{reward.badge}</div>
                        )}
                        <div className="offer-content">
                          <h3>{reward.name}</h3>
                          <p className="offer-description">
                            {reward.description}
                          </p>
                          <div className="offer-price">
                            <span className="price-label">Desde</span>
                            <span className="price-amount">{reward.price.toLocaleString()}</span>
                            <span className="price-currency">AURACOINS</span>
                          </div>
                          {reward.cashback && (
                            <div className="offer-cashback">
                              <MdStars />
                              <span>{reward.cashback}% Cashback</span>
                            </div>
                          )}
                          <button 
                            className="btn-offer"
                            onClick={() => handleRedeemReward({ price: reward.price, name: reward.name })}
                          >
                            <MdCardGiftcard />
                            Canjear Ahora
                          </button>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </section>

          </div>
        )
    }
  }

  return (
    <div className={`app-container ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
      <Sidebar 
        onLogout={handleLogout} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onExpandedChange={setIsSidebarExpanded}
      />
      <div className="app-content">
        <header className="app-header">
          <h1 className="auracoins-title">
            <span className="auracoins-text">AuraCoins</span>
          </h1>
        </header>
        <main className="app-main">
          {renderContent()}
        </main>
      </div>

      {/* Modal de Confirmación de Canje (Dashboard) */}
      <RedemptionConfirmModal
        reward={rewardToRedeem}
        userBalance={profile?.balance || 0}
        isOpen={showConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmRedeem}
        isLoading={isRedeeming}
      />

      {/* Modal de Código de Canje (Dashboard) */}
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
