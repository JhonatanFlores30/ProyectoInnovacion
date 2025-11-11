import { useState, useEffect } from 'react'
import { checkAuth } from './services/authService'
import type { User } from './services/authService'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar la app
    const verifyAuth = async () => {
      try {
        const authenticatedUser = await checkAuth()
        setUser(authenticatedUser)
        setError(null)
      } catch (err) {
        console.error('Error verificando autenticación:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        // Si hay error, asegurar que no hay usuario
        setUser(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    verifyAuth()
  }, [])

  const handleLoginSuccess = (loggedInUser: { id: string; email: string; name: string }) => {
    setUser(loggedInUser as User)
    setError(null)
  }

  const handleLogout = () => {
    setUser(null)
    setError(null)
  }

  // Mostrar spinner de carga solo brevemente mientras verifica
  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Si hay un error crítico, mostrarlo
  if (error && !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fff',
        padding: '2rem'
      }}>
        <p style={{ color: '#ff6464', marginBottom: '1rem' }}>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#00ffff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Recargar
        </button>
      </div>
    )
  }

  // Si no hay usuario, mostrar la página de login (página inicial)
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // Si hay usuario autenticado, mostrar el dashboard
  return <DashboardPage user={user} onLogout={handleLogout} />
}

export default App
