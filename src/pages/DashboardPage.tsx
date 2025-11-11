import { useState, useEffect } from 'react'
import { logout } from '../services/authService'
import type { User } from '../services/authService'
import { Sidebar } from '../components/Sidebar'
import { PeliculasPage } from './PeliculasPage'
import { getPopularMovies, getMovieImageUrl, getMovieBackdropUrl, type Movie } from '../services/movieService'
import { 
  MdStars, 
  MdEvent,
  MdWhatshot,
  MdCardGiftcard,
  MdLocalOffer,
  MdTrendingUp,
  MdPlayArrow,
  MdTimer,
  MdRocketLaunch,
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
  
  // Estado del usuario (en el futuro vendrá de la BD)
  const [balance, setBalance] = useState(() => {
    const stored = localStorage.getItem(`balance_${user.id}`)
    return stored ? parseInt(stored) : 0
  })
  
  const [streak, setStreak] = useState(() => {
    const stored = localStorage.getItem(`streak_${user.id}`)
    return stored ? parseInt(stored) : 0
  })

  // Película destacada para la oferta especial
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null)

  useEffect(() => {
    localStorage.setItem(`balance_${user.id}`, balance.toString())
  }, [balance, user.id])

  useEffect(() => {
    localStorage.setItem(`streak_${user.id}`, streak.toString())
  }, [streak, user.id])

  // Cargar película destacada
  useEffect(() => {
    const loadFeaturedMovie = async () => {
      try {
        const movies = await getPopularMovies()
        if (movies.length > 0) {
          // Seleccionar la primera película popular como destacada
          setFeaturedMovie(movies[0])
        }
      } catch (error) {
        console.error('Error cargando película destacada:', error)
      }
    }
    loadFeaturedMovie()
  }, [])

  const handleLogout = () => {
    logout()
    onLogout()
  }

  // Renderizar contenido según la sección activa
  const renderContent = () => {
    switch (activeSection) {
      case 'peliculas':
        return <PeliculasPage streak={streak} />
      
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
                      <div className="featured-badge">
                        <MdStars />
                        <span>OFERTA ESPECIAL</span>
                      </div>
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
                      <div className="featured-reward-info">
                        <div className="reward-highlight">
                          <MdStars className="reward-icon-large" />
                          <div>
                            <span className="reward-label">Gana puntos extra</span>
                            <span className="reward-amount">
                              {(10 + streak) * 2} AURACOINS
                            </span>
                            <span className="reward-note">(Doble puntos por ver y responder)</span>
                          </div>
                        </div>
                      </div>
                      <div className="featured-actions">
                        <button className="btn-featured-watch">
                          <MdPlayArrow />
                          Ver Película
                        </button>
                        <div className="featured-timer">
                          <MdTimer />
                          <span>Oferta válida hasta: 3 días</span>
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
                    <div className="event-badge-featured">🎁 BIENVENIDA</div>
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
                <button className="btn-see-all">Ver todas →</button>
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
                  <SwiperSlide>
                    <div className="offer-card featured">
                      <div className="offer-badge">POPULAR</div>
                      <div className="offer-content">
                        <h3>Netflix - 1 Mes</h3>
                        <p className="offer-description">
                          Suscripción mensual completa de Netflix. Disfruta de todo el catálogo sin límites.
                        </p>
                        <div className="offer-price">
                          <span className="price-label">Desde</span>
                          <span className="price-amount">500</span>
                          <span className="price-currency">AURACOINS</span>
                        </div>
                        <div className="offer-cashback">
                          <MdStars />
                          <span>11% Cashback</span>
                        </div>
                        <button className="btn-offer">
                          <MdCardGiftcard />
                          Canjear Ahora
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide>
                    <div className="offer-card">
                      <div className="offer-badge">OFERTA</div>
                      <div className="offer-content">
                        <h3>Netflix - 3 Meses</h3>
                        <p className="offer-description">
                          Suscripción trimestral de Netflix. Ahorra más con esta oferta especial.
                        </p>
                        <div className="offer-price">
                          <span className="price-label">Desde</span>
                          <span className="price-amount">1400</span>
                          <span className="price-currency">AURACOINS</span>
                        </div>
                        <div className="offer-cashback">
                          <MdStars />
                          <span>15% Cashback</span>
                        </div>
                        <button className="btn-offer">
                          <MdCardGiftcard />
                          Canjear
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
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
    </div>
  )
}
