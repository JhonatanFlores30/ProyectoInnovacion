import { Login } from '../components/Login'
import type { User } from '../services/authService'

interface LoginPageProps {
  onLoginSuccess: (user: User) => void 
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  return <Login onLoginSuccess={onLoginSuccess} />
}
