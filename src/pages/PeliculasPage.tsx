import { useState, useEffect } from 'react'
import { getPopularMovies, getNowPlayingMovies, getMovieImageUrl, type Movie } from '../services/movieService'
import { supabase } from '../lib/supabase'
import type { User } from '../services/authService'
import { 
  MdPlayArrow,
  MdWhatshot,
  MdNewReleases,
  MdCalendarToday,
  MdStars,
  MdHistory
} from 'react-icons/md'

interface PeliculasPageProps {
  streak?: number
  user?: User
  isHistory?: boolean
}

interface MovieWithPoints extends Movie {
  auracoinsEarned: number
  answeredAt?: string
}

export const PeliculasPage = ({ user, isHistory = false }: PeliculasPageProps) => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([])
  const [historyMovies, setHistoryMovies] = useState<MovieWithPoints[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'popular' | 'nowPlaying'>('popular')

  // Cargar historial de películas con respuestas
  useEffect(() => {
    const loadHistory = async () => {
      if (!isHistory || !user) return
      
      setIsLoadingMovies(true)
      try {
        // Obtener todas las respuestas del usuario agrupadas por película
        const { data: answers, error } = await supabase
          .from('user_answers')
          .select('movie_id, points_earned, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error cargando historial:', error)
          setIsLoadingMovies(false)
          return
        }

        if (!answers || answers.length === 0) {
          setHistoryMovies([])
          setIsLoadingMovies(false)
          return
        }

        // Agrupar por movie_id y sumar los puntos
        const moviePointsMap = new Map<number, { points: number; lastAnswered: string }>()
        
        answers.forEach(answer => {
          const movieId = answer.movie_id
          const points = answer.points_earned || 0
          const answeredAt = answer.created_at || ''
          
          if (moviePointsMap.has(movieId)) {
            const existing = moviePointsMap.get(movieId)!
            existing.points += points
            // Mantener la fecha más reciente
            if (answeredAt > existing.lastAnswered) {
              existing.lastAnswered = answeredAt
            }
          } else {
            moviePointsMap.set(movieId, { points, lastAnswered: answeredAt })
          }
        })

        // Obtener información de las películas desde la base de datos
        const movieIds = Array.from(moviePointsMap.keys())
        const { data: moviesData, error: moviesError } = await supabase
          .from('movies')
          .select('*')
          .in('id', movieIds)

        if (moviesError) {
          console.error('Error cargando películas desde BD:', moviesError)
          setIsLoadingMovies(false)
          return
        }

        // Combinar datos de películas con puntos ganados
        const moviesWithPoints: MovieWithPoints[] = (moviesData || []).map(movie => {
          const pointsData = moviePointsMap.get(movie.id)!
          return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview || '',
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            release_date: movie.release_date || '',
            vote_average: 0,
            popularity: 0,
            auracoinsEarned: pointsData.points,
            answeredAt: pointsData.lastAnswered
          }
        })

        // Ordenar por fecha de respuesta más reciente
        moviesWithPoints.sort((a, b) => {
          const dateA = a.answeredAt ? new Date(a.answeredAt).getTime() : 0
          const dateB = b.answeredAt ? new Date(b.answeredAt).getTime() : 0
          return dateB - dateA
        })

        setHistoryMovies(moviesWithPoints)
      } catch (error) {
        console.error('Error cargando historial:', error)
      } finally {
        setIsLoadingMovies(false)
      }
    }

    if (isHistory) {
      loadHistory()
    }
  }, [isHistory, user])

  // Cargar películas populares y en estreno (solo si no es historial)
  useEffect(() => {
    if (isHistory) return

    const loadMovies = async () => {
      setIsLoadingMovies(true)
      try {
        const [popular, nowPlaying] = await Promise.all([
          getPopularMovies(),
          getNowPlayingMovies()
        ])
        setPopularMovies(popular)
        setNowPlayingMovies(nowPlaying)
      } catch (error) {
        console.error('Error cargando películas:', error)
      } finally {
        setIsLoadingMovies(false)
      }
    }
    loadMovies()
  }, [isHistory])

  const handleWatchMovie = (movie: Movie) => {
    // Aquí se abriría el reproductor o se marcaría la película como vista
    alert(`¡Viendo ${movie.title}! Después de verla, podrás responder la pregunta y ganar puntos.`)
    // TODO: Implementar lógica para marcar película como vista y mostrar pregunta después
  }

  const currentMovies = selectedCategory === 'popular' ? popularMovies : nowPlayingMovies

  // Si es historial, mostrar solo películas con respuestas
  if (isHistory) {
    return (
      <div className="peliculas-page">
        {/* Header del historial */}
        <div className="movies-header">
          <h2 className="history-title">
            <MdHistory className="tab-icon" />
            Historial de Películas
          </h2>
          <p className="history-subtitle">Películas con preguntas respondidas</p>
        </div>

        {/* Grid de Películas del Historial */}
        {isLoadingMovies ? (
          <div className="loading-movies">
            <div className="loading-spinner"></div>
            <p>Cargando historial...</p>
          </div>
        ) : historyMovies.length === 0 ? (
          <div className="empty-history">
            <MdHistory className="empty-icon" />
            <p>No has respondido preguntas de ninguna película aún.</p>
            <p className="empty-subtitle">¡Ve películas y responde preguntas para ganar AuraCoins!</p>
          </div>
        ) : (
          <div className="movies-grid">
            {historyMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster">
                  <img 
                    src={getMovieImageUrl(movie.poster_path)} 
                    alt={movie.title}
                    loading="lazy"
                  />
                  <div className="movie-badge completed">
                    <MdHistory />
                    Completada
                  </div>
                  <div className="movie-rating">
                    <MdStars />
                    {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'N/A'}
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-date">
                    <MdCalendarToday />
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                  <p className="movie-overview">
                    {movie.overview.length > 120 
                      ? `${movie.overview.substring(0, 120)}...` 
                      : movie.overview}
                  </p>
                  <div className="movie-reward earned">
                    <MdStars className="reward-icon" />
                    <span className="reward-amount">{movie.auracoinsEarned} AuraCoins ganados</span>
                  </div>
                  {movie.answeredAt && (
                    <p className="movie-answered-date">
                      Respondido: {new Date(movie.answeredAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Vista normal de películas (no historial)
  return (
    <div className="peliculas-page">
      {/* Header con categorías */}
      <div className="movies-header">
        <div className="category-tabs">
          <button 
            className={`category-tab ${selectedCategory === 'popular' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('popular')}
          >
            <MdWhatshot className="tab-icon" />
            Populares
          </button>
          <button 
            className={`category-tab ${selectedCategory === 'nowPlaying' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('nowPlaying')}
          >
            <MdNewReleases className="tab-icon" />
            En Estreno
          </button>
        </div>
      </div>

      {/* Grid de Películas */}
      {isLoadingMovies ? (
        <div className="loading-movies">
          <div className="loading-spinner"></div>
          <p>Cargando películas...</p>
        </div>
      ) : (
        <div className="movies-grid">
          {currentMovies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <div className="movie-poster">
                <img 
                  src={getMovieImageUrl(movie.poster_path)} 
                  alt={movie.title}
                  loading="lazy"
                />
                <div className="movie-overlay">
                  <button 
                    className="btn-watch-movie"
                    onClick={() => handleWatchMovie(movie)}
                  >
                    <MdPlayArrow className="play-icon" />
                    Ver Película
                  </button>
                </div>
                {selectedCategory === 'nowPlaying' && (
                  <div className="movie-badge new">
                    <MdNewReleases />
                    Nuevo
                  </div>
                )}
                <div className="movie-rating">
                  <MdStars />
                  {movie.vote_average.toFixed(1)}
                </div>
              </div>
              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-date">
                  <MdCalendarToday />
                  {new Date(movie.release_date).getFullYear()}
                </p>
                <p className="movie-overview">
                  {movie.overview.length > 120 
                    ? `${movie.overview.substring(0, 120)}...` 
                    : movie.overview}
                </p>
                <div className="movie-reward">
                  <MdStars className="reward-icon" />
                  <span>Gana AuraCoins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

