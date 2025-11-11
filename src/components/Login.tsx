import { useState } from 'react'
import type { FormEvent } from 'react'
import { Logo } from './Logo'
import { login } from '../services/authService'
import type { LoginCredentials } from '../services/authService'
import { MdEmail, MdLock, MdPlayArrow, MdStars, MdCardGiftcard, MdPersonAdd, MdHelpOutline } from 'react-icons/md'
import './Login.css'

interface LoginProps {
  onLoginSuccess: (user: { id: string; email: string; name: string }) => void
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(credentials)
      
      if (result.success && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
        onLoginSuccess(result.user)
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.')
    } finally {
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
            <Logo size="xlarge" />
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
                    onClick={() => console.log('Olvidar contraseña')}
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
                onClick={() => console.log('Registrarse')}
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

