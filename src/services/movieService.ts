// Servicio para obtener películas de Netflix usando TMDB API
// Para obtener una API key gratuita: https://www.themoviedb.org/settings/api

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || ''
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'
const NETFLIX_PROVIDER_ID = 8 // ID de Netflix en TMDB (8 es el ID oficial de Netflix)
const DEFAULT_REGION = 'MX' // Región por defecto (puedes cambiarla a 'ES', 'US', 'AR', etc.)
// Nota: El filtro with_watch_providers=8 asegura que SOLO se muestren películas disponibles en Netflix

// Debug: mostrar API key en desarrollo (solo primeros y últimos caracteres por seguridad)
if (import.meta.env.DEV && TMDB_API_KEY) {
  const maskedKey = TMDB_API_KEY.length > 10 
    ? `${TMDB_API_KEY.substring(0, 10)}...${TMDB_API_KEY.substring(TMDB_API_KEY.length - 5)}`
    : '***'
  console.log('🔑 TMDB API Key cargada:', maskedKey, `(Longitud: ${TMDB_API_KEY.length})`)
}

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  popularity: number
}

// Interfaces para la respuesta de TMDB API
interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  popularity: number
  vote_count: number
}

interface TMDBResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

/**
 * Convierte un objeto de TMDB a la interfaz Movie
 */
const convertTMDBToMovie = (movie: TMDBMovie): Movie => {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview || 'Sin descripción disponible.',
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date || '1900-01-01',
    vote_average: movie.vote_average || 0,
    popularity: movie.popularity || 0
  }
}

/**
 * Obtiene películas disponibles en Netflix usando TMDB
 * Si no hay API key, devuelve datos de ejemplo
 */
export const getPopularMovies = async (): Promise<Movie[]> => {
  if (!TMDB_API_KEY) {
    if (import.meta.env.DEV) {
      console.log('ℹ️ TMDB API key no configurada, usando películas de ejemplo')
    }
    return getExampleMovies()
  }

  try {
    // TMDB endpoint para descubrir películas disponibles EXCLUSIVAMENTE en Netflix
    // with_watch_providers=8 filtra SOLO películas disponibles en Netflix
    // watch_region especifica la región (MX = México, ES = España, US = Estados Unidos, etc.)
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=${NETFLIX_PROVIDER_ID}&watch_region=${DEFAULT_REGION}&sort_by=popularity.desc&page=1&language=es-MX`
    
    if (import.meta.env.DEV) {
      console.log(`🔍 Solicitando películas populares de Netflix (región: ${DEFAULT_REGION}) desde TMDB...`)
      console.log(`📺 Filtro aplicado: Solo películas disponibles en Netflix (Provider ID: ${NETFLIX_PROVIDER_ID})`)
    }
    
    const response = await fetch(url)
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`
      let errorDetails = ''
      try {
        const errorData = await response.json()
        if (errorData.status_message) {
          errorMessage = errorData.status_message
        }
        if (errorData.errors) {
          errorDetails = errorData.errors.join(', ')
        }
      } catch {
        try {
          errorDetails = await response.text()
        } catch {
          // Si no se puede leer, usar el mensaje por defecto
        }
      }
      
      if (import.meta.env.DEV) {
        console.error('❌ Error al obtener películas de TMDB:', errorMessage)
        if (errorDetails) {
          console.error('📋 Detalles del error:', errorDetails)
        }
        console.log('ℹ️ Usando películas de ejemplo como fallback')
      }
      
      return getExampleMovies()
    }
    
    const data: TMDBResponse = await response.json()
    
    // Convertir las películas al formato Movie
    const movies = data.results.map(convertTMDBToMovie)
    
    if (import.meta.env.DEV) {
      console.log(`✅ Se obtuvieron ${movies.length} películas de Netflix desde TMDB`)
    }
    
    return movies.length > 0 ? movies : getExampleMovies()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Error al obtener películas de TMDB:', error instanceof Error ? error.message : 'Error desconocido')
      console.log('ℹ️ Usando películas de ejemplo como fallback')
    }
    return getExampleMovies()
  }
}

/**
 * Obtiene películas en estreno de Netflix usando TMDB
 */
export const getNowPlayingMovies = async (): Promise<Movie[]> => {
  if (!TMDB_API_KEY) {
    if (import.meta.env.DEV) {
      console.log('ℹ️ TMDB API key no configurada, usando películas de ejemplo')
    }
    return getExampleMovies()
  }

  try {
    const currentYear = new Date().getFullYear()
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    // TMDB endpoint para películas nuevas disponibles EXCLUSIVAMENTE en Netflix
    // with_watch_providers=8 filtra SOLO películas disponibles en Netflix
    // primary_release_date filtra películas del último año
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=${NETFLIX_PROVIDER_ID}&watch_region=${DEFAULT_REGION}&primary_release_date.gte=${currentYear - 1}-01-01&primary_release_date.lte=${currentDate}&sort_by=release_date.desc&page=1&language=es-MX`
    
    if (import.meta.env.DEV) {
      console.log(`🔍 Solicitando películas en estreno de Netflix (región: ${DEFAULT_REGION}) desde TMDB...`)
      console.log(`📺 Filtro aplicado: Solo películas disponibles en Netflix (Provider ID: ${NETFLIX_PROVIDER_ID})`)
    }
    
    const response = await fetch(url)
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.status_message) {
          errorMessage = errorData.status_message
        }
      } catch {
        // Si no se puede parsear el error, usar el mensaje por defecto
      }
      
      if (import.meta.env.DEV) {
        console.warn('⚠️ Error al obtener películas en estreno de TMDB:', errorMessage)
        console.log('ℹ️ Usando películas de ejemplo como fallback')
      }
      
      return getExampleMovies()
    }
    
    const data: TMDBResponse = await response.json()
    
    // Convertir las películas al formato Movie
    const movies = data.results.map(convertTMDBToMovie)
    
    if (import.meta.env.DEV) {
      console.log(`✅ Se obtuvieron ${movies.length} películas en estreno de Netflix desde TMDB`)
    }
    
    return movies.length > 0 ? movies : getExampleMovies()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Error al obtener películas en estreno de TMDB:', error instanceof Error ? error.message : 'Error desconocido')
      console.log('ℹ️ Usando películas de ejemplo como fallback')
    }
    return getExampleMovies()
  }
}

/**
 * Obtiene la URL completa de la imagen del poster
 * TMDB proporciona URLs relativas que necesitan el base URL
 */
export const getMovieImageUrl = (posterPath: string | null): string => {
  if (!posterPath) {
    return 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Sin+Imagen'
  }
  
  // Si ya es una URL completa, retornarla directamente
  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
    return posterPath
  }
  
  // Construir la URL completa usando el CDN de TMDB
  return `${TMDB_IMAGE_BASE_URL}/w500${posterPath}`
}

/**
 * Obtiene la URL completa de la imagen de fondo
 * TMDB proporciona URLs relativas que necesitan el base URL
 */
export const getMovieBackdropUrl = (backdropPath: string | null): string => {
  if (!backdropPath) {
    return 'https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Sin+Imagen'
  }
  
  // Si ya es una URL completa, retornarla directamente
  if (backdropPath.startsWith('http://') || backdropPath.startsWith('https://')) {
    return backdropPath
  }
  
  // Construir la URL completa usando el CDN de TMDB
  return `${TMDB_IMAGE_BASE_URL}/w1280${backdropPath}`
}

/**
 * Datos de ejemplo para cuando no hay API key
 */
const getExampleMovies = (): Movie[] => {
  return [
    {
      id: 1,
      title: 'Inception',
      overview: 'Un ladrón que roba secretos a través de la tecnología de compartir sueños, recibe la tarea inversa de plantar una idea en la mente de un CEO.',
      poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
      release_date: '2010-07-16',
      vote_average: 8.8,
      popularity: 100.0
    },
    {
      id: 2,
      title: 'The Dark Knight',
      overview: 'Batman debe aceptar uno de los mayores desafíos psicológicos y físicos de su capacidad para luchar contra la injusticia.',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      backdrop_path: '/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
      release_date: '2008-07-18',
      vote_average: 9.0,
      popularity: 95.5
    },
    {
      id: 3,
      title: 'Interstellar',
      overview: 'Las aventuras de un grupo de exploradores que hacen uso de un agujero de gusano recientemente descubierto para superar las limitaciones de los viajes espaciales humanos.',
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop_path: '/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
      release_date: '2014-11-07',
      vote_average: 8.6,
      popularity: 88.2
    },
    {
      id: 4,
      title: 'The Matrix',
      overview: 'Un programador informático descubre que el mundo en el que vive es una simulación creada por máquinas inteligentes.',
      poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      backdrop_path: '/ncEsesgOJDLr9ed0Wlq0i0pNW.jpg',
      release_date: '1999-03-31',
      vote_average: 8.7,
      popularity: 92.1
    },
    {
      id: 5,
      title: 'Pulp Fiction',
      overview: 'Las vidas de dos mafiosos, un boxeador, la esposa de un gángster y un par de bandidos se entrelazan en cuatro historias de violencia y redención.',
      poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
      release_date: '1994-10-14',
      vote_average: 8.9,
      popularity: 85.7
    },
    {
      id: 6,
      title: 'Fight Club',
      overview: 'Un empleado de oficina insomne y un fabricante de jabón forman un club de lucha clandestino que se convierte en algo mucho más grande.',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdrop_path: '/87hTDiay2N2qWyX4amjyn2SLZFD.jpg',
      release_date: '1999-10-15',
      vote_average: 8.8,
      popularity: 78.3
    }
  ]
}
