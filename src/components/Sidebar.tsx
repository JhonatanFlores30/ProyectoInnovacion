import { useState } from 'react'
import { Logo } from './Logo'
import { 
  MdDashboard, 
  MdLocalMovies, 
  MdStars, 
  MdAccountCircle,
  MdSettings,
  MdLogout
} from 'react-icons/md'
import './Sidebar.css'

interface SidebarProps {
  onLogout: () => void
  activeSection?: string
  onSectionChange?: (section: string) => void
  onExpandedChange?: (expanded: boolean) => void
}

export const Sidebar = ({ onLogout, activeSection = 'dashboard', onSectionChange, onExpandedChange }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleMouseEnter = () => {
    setIsExpanded(true)
    if (onExpandedChange) {
      onExpandedChange(true)
    }
  }

  const handleMouseLeave = () => {
    setIsExpanded(false)
    if (onExpandedChange) {
      onExpandedChange(false)
    }
  }

  const menuItems = [
    { id: 'dashboard', icon: MdDashboard, label: 'Dashboard' },
    { id: 'peliculas', icon: MdLocalMovies, label: 'Historial' },
    { id: 'recompensas', icon: MdStars, label: 'Recompensas' },
    { id: 'perfil', icon: MdAccountCircle, label: 'Perfil' },
    { id: 'configuracion', icon: MdSettings, label: 'Configuración' },
  ]

  const handleItemClick = (id: string) => {
    if (onSectionChange) {
      onSectionChange(id)
    }
  }

  return (
    <aside 
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header">
        <Logo size="small" />
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={item.label}
            >
              <Icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="sidebar-item sidebar-logout" 
          onClick={onLogout}
          title="Cerrar Sesión"
        >
          <MdLogout className="sidebar-icon" />
          <span className="sidebar-label">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

