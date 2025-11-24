import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { checkAuth, logout } from './services/authService'
import type { User } from './services/authService'

import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { Registro } from './pages/Registro'
import { Password } from './pages/Password'
import { LogoutAnimation } from './components/LogoutAnimation'

import AdminPanel from "./pages/AdminPanel"

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

        console.log("🟦 Usuario cargado desde checkAuth():", authenticatedUser)

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

  const handleLoginSuccess = (loggedInUser: User) => {
    console.log("🟩 Login Success. Usuario recibido:", loggedInUser)

    setUser(loggedInUser)
    setError(null)
  }

  const handleLogout = async () => {
    setShowLogoutAnimation(true)

    try {
      await logout()
      await new Promise(resolve => setTimeout(resolve, 300))
      setUser(null)
      setError(null)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setUser(null)
      setError(null)
    }
  }

  const handleLogoutComplete = () => {
    setShowLogoutAnimation(false)
  }

  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="error-screen">
        <p className="error-text">{error}</p>
        <button className="reload-button" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </div>
    )
  }

  return (
    <>
      <LogoutAnimation show={showLogoutAnimation} onComplete={handleLogoutComplete} />

      <Router>
        <Routes>

          {/* LOGIN */}
          <Route
            path="/"
            element={
              !user ? (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              ) : (
                user.app_role === "admin"
                  ? <Navigate to="/admin" replace />
                  : <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* REGISTRO */}
          <Route
            path="/registro"
            element={!user ? <Registro /> : <Navigate to="/dashboard" replace />}
          />

          {/* RECUPERAR CONTRASEÑA */}
          <Route path="/password" element={<Password />} />

          {/* DASHBOARD */}
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

          {/* ADMIN PANEL */}
          <Route
            path="/admin"
            element={
              user?.app_role === "admin" ? (
                <AdminPanel user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={<Navigate to={user ? "/dashboard" : "/"} replace />}
          />

        </Routes>
      </Router>
    </>
  )
}

export default App
