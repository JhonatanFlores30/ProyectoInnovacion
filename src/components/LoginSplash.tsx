import { useEffect, useState } from 'react'
import { Logo } from './Logo'
import './LoginSplash.css'

interface LoginSplashProps {
  onComplete: () => void
}

export const LoginSplash = ({ onComplete }: LoginSplashProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Iniciar animación después de un pequeño delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Completar la animación después de 2.5 segundos
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 2500)

    return () => {
      clearTimeout(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="login-splash">
      <div className={`splash-content ${isVisible ? 'visible' : ''}`}>
        <Logo size="xlarge" />
      </div>
      <div className="splash-background"></div>
    </div>
  )
}

