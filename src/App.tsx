import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { checkAuth } from './services/authService'
import type { User } from './services/authService'

import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { Registro } from './pages/Registro'
import {Password} from './pages/Password'
import { LogoutAnimation } from './components/LogoutAnimation'

import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authenticatedUser = await checkAuth()
        setUser(authenticatedUser)
        setError(null)
      } catch (err) {
        console.error('Error verificando autenticación:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
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

  const handleLogout = async () => {
    setShowLogoutAnimation(true)
    
    // Ejecutar el logout inmediatamente mientras se muestra la animación
    const { logout } = await import('./services/authService')
    try {
      // Ejecutar el logout y esperar a que se complete
      await logout()
      
      // Esperar un momento adicional para asegurar que Supabase procese el logout
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Limpiar el estado del usuario DESPUÉS de que el logout se complete
      setUser(null)
      setError(null)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Aún así, limpiar el estado en caso de error
      setUser(null)
      setError(null)
    }
  }

  const handleLogoutComplete = () => {
    // Solo ocultar la animación cuando termine
    setShowLogoutAnimation(false)
  }

  // 🌀 Mientras verifica la sesión
  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // ❌ Si hay un error crítico
  if (error && !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#fff',
          padding: '2rem'
        }}
      >
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

  // 🧭 Rutas principales
  return (
    <>
      <LogoutAnimation
        show={showLogoutAnimation}
        onComplete={handleLogoutComplete}
      />
      <Router>
      <Routes>
        {/* Página de inicio (Login) */}
        <Route
          path="/"
          element={
            !user ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Página de registro */}
        <Route
          path="/registro"
          element={!user ? <Registro /> : <Navigate to="/dashboard" replace />}
        />

        {/* Página de contraseña */}
        <Route
          path='/password'
          element={<Password />}
        ></Route>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <DashboardPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Ruta por defecto (404 o redirección) */}
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
      </Routes>
    </Router>
    </>
  )
}

export default App