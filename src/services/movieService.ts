// Servicio para obtener películas de The Movie Database (TMDB) API
// Para obtener una API key gratuita: https://www.themoviedb.org/settings/api

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || ''
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

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

export interface MovieResponse {
  results: Movie[]
  page: number
  total_pages: number
  total_results: number
}

/**
 * Obtiene películas populares de TMDB
 * Si no hay API key, devuelve datos de ejemplo
 */
export const getPopularMovies = async (): Promise<Movie[]> => {
  if (!TMDB_API_KEY) {
    // Retornar datos de ejemplo si no hay API key
    return getExampleMovies()
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=1`
    )
    
    if (!response.ok) {
      throw new Error('Error al obtener películas')
    }
    
    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching movies:', error)
    // Si falla, retornar datos de ejemplo
    return getExampleMovies()
  }
}

/**
 * Obtiene películas en estreno
 */
export const getNowPlayingMovies = async (): Promise<Movie[]> => {
  if (!TMDB_API_KEY) {
    return getExampleMovies()
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=es-ES&page=1`
    )
    
    if (!response.ok) {
      throw new Error('Error al obtener películas')
    }
    
    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching movies:', error)
    return getExampleMovies()
  }
}

/**
 * Obtiene la URL completa de la imagen del poster
 */
export const getMovieImageUrl = (posterPath: string | null): string => {
  if (!posterPath) {
    return 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Sin+Imagen'
  }
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`
}

/**
 * Obtiene la URL completa de la imagen de fondo
 */
export const getMovieBackdropUrl = (backdropPath: string | null): string => {
  if (!backdropPath) {
    return 'https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Sin+Imagen'
  }
  return `https://image.tmdb.org/t/p/w1280${backdropPath}`
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

