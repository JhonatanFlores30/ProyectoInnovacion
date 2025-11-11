import { Login } from '../components/Login'
import type { User } from '../services/authService'

interface LoginPageProps {
  onLoginSuccess: (user: { id: string; email: string; name: string }) => void
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  return <Login onLoginSuccess={onLoginSuccess} />
}

