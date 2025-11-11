import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { checkAuth } from './services/authService'
import type { User } from './services/authService'

import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { Registro } from './pages/Registro'
import {Password} from './pages/Password'

import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleLogout = () => {
    setUser(null)
    setError(null)
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
          element={<Password userEmail={user?.email || ''} />}
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
  )
}

export default App