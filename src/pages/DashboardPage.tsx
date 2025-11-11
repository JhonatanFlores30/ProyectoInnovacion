import { logout } from '../services/authService'
import type { User } from '../services/authService'

interface DashboardPageProps {
  user: User
  onLogout: () => void
}

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const handleLogout = () => {
    logout()
    onLogout()
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Bienvenido, {user.name}</h1>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </header>
      <main className="app-main">
        <div className="dashboard-card">
          <h2>Dashboard</h2>
          <p>Email: {user.email}</p>
          <p className="coming-soon">
            Próximamente: Panel de recompensas y vinculación de cuentas de streaming
          </p>
        </div>
      </main>
    </div>
  )
}

