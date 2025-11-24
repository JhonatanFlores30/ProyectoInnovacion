import { useState } from 'react'
import type { FormEvent } from 'react'
import { Logo } from './Logo'
import { LoginSplash } from './LoginSplash'
import { useNavigate } from "react-router-dom";
import { login } from '../services/authService'
import { supabase } from '../lib/supabase'
import type { LoginCredentials, User } from '../services/authService'
import { MdEmail, MdLock, MdPlayArrow, MdStars, MdCardGiftcard, MdPersonAdd, MdHelpOutline } from 'react-icons/md'
import './Login.css'

interface LoginProps {
  onLoginSuccess: (user: User) => void  
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showSplash, setShowSplash] = useState<boolean>(false)

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(credentials)
      
      if (result.success && result.user) {

        // refrescar sesión
        await supabase.auth.getSession();

        // Guardar usuario completo (incluye app_role)
        localStorage.setItem('user', JSON.stringify(result.user))
        setLoggedInUser(result.user)

        console.log("🔵 SESSION DESPUÉS DEL LOGIN:", 
          JSON.stringify(await supabase.auth.getSession(), null, 2)
        );

        setShowSplash(true)
      } else {
        setError(result.error || 'Error al iniciar sesión')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSplashComplete = () => {
    if (loggedInUser) {
      onLoginSuccess(loggedInUser) // ← ahora pasa app_role correctamente
    }
  }

  // Mostrar splash si el login fue exitoso
  if (showSplash) {
    return <LoginSplash onComplete={handleSplashComplete} />
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="login-wrapper">
        <div className="login-left">
          <div className="login-brand">
            <Logo size="large" />
            <h1 className="login-title">AURACOINS</h1>
            <p className="login-subtitle">
              Sistema de Recompensas para Streaming
            </p>
          </div>

          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">
                <MdPlayArrow />
              </div>
              <div className="feature-content">
                <h3>Vincula tus Cuentas</h3>
                <p>Conectate a Netflix. Por el momento...</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <MdStars />
              </div>
              <div className="feature-content">
                <h3>Gana Recompensas</h3>
                <p>Acumula puntos diariamente.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <MdCardGiftcard />
              </div>
              <div className="feature-content">
                <h3>Canjea Premios</h3>
                <p>Intercambia tus puntos por increíbles beneficios</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <h2>Iniciar Sesión</h2>
              <p>Ingresa tus credenciales para acceder</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <MdEmail className="label-icon" />
                  Correo Electrónico
                </label>
                <div className="input-wrapper">
                  <MdEmail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="tu@email.com"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-header">
                  <label htmlFor="password" className="form-label">
                    <MdLock className="label-icon" />
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={()  => navigate("/password")}
                  >
                    <MdHelpOutline className="forgot-icon" />
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="input-wrapper">
                  <MdLock className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <MdPlayArrow className="button-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="login-actions">
              <div className="divider">
                <span>¿No tienes una cuenta?</span>
              </div>
              <button
                type="button"
                className="register-button"
                onClick={() => navigate("/registro")}
              >
                <MdPersonAdd className="register-icon" />
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
