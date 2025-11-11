import { useState, useEffect } from 'react'
import { getPopularMovies, getNowPlayingMovies, getMovieImageUrl, type Movie } from '../services/movieService'
import { 
  MdPlayArrow,
  MdWhatshot,
  MdNewReleases,
  MdCalendarToday,
  MdStars
} from 'react-icons/md'

interface PeliculasPageProps {
  streak: number
}

export const PeliculasPage = ({ streak }: PeliculasPageProps) => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'popular' | 'nowPlaying'>('popular')

  // Cargar películas
  useEffect(() => {
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
  }, [])

  const handleWatchMovie = (movie: Movie) => {
    // Aquí se abriría el reproductor o se marcaría la película como vista
    alert(`¡Viendo ${movie.title}! Después de verla, podrás responder la pregunta y ganar puntos.`)
    // TODO: Implementar lógica para marcar película como vista y mostrar pregunta después
  }

  const currentMovies = selectedCategory === 'popular' ? popularMovies : nowPlayingMovies

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

