import { useEffect, useState } from "react"
import { getUserProfile, updateUserProfile } from "../services/profileService"
import type { UserProfile } from "../services/profileService"
import "./PerfilPage.css"
import { motion } from "framer-motion"
import { FaEdit } from "react-icons/fa"

interface PerfilPageProps {
  userId: string
}

export const PerfilPage = ({ userId }: PerfilPageProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getUserProfile(userId)
      setProfile(data)
    }
    loadProfile()
  }, [userId])

  
  const handleSaveName = async () => {
    if (!newName.trim()) return

    await updateUserProfile(userId, { name: newName })
    setProfile(prev => prev ? { ...prev, name: newName } : prev)
    setEditingName(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      await updateUserProfile(userId, { avatar_url: base64 })
      setProfile(prev => prev ? { ...prev, avatar_url: base64 } : prev)
      setUploading(false)
    }

    reader.readAsDataURL(file)
  }

  if (!profile) {
    return <p className="perfil-loading">Cargando perfil...</p>
  }

  const xpPercent = Math.min((profile.experience_points % 100), 100)

  return (
    <div className="perfil-container">

      {/* CARD GENERAL */}
      <motion.div 
        className="perfil-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* AVATAR Y NOMBRE */}
        <div className="perfil-header">
          <div className="perfil-avatar-container">
            <img 
              src={profile.avatar_url || "/default-avatar.png"} 
              className="perfil-avatar" 
              alt="avatar"
            />

            <label className="perfil-avatar-edit">
            {uploading ? (
                "Subiendo..."
            ) : (
                <FaEdit size={16} />
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          {/* Nombre */}
          <div className="perfil-name-section">
            {editingName ? (
              <div className="perfil-name-edit">
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="perfil-input"
                />
                <button className="perfil-btn-save" onClick={handleSaveName}>Guardar</button>
                <button className="perfil-btn-cancel" onClick={() => setEditingName(false)}>Cancelar</button>
              </div>
            ) : (
              <>
                <h2 className="perfil-name">{profile.name}</h2>
                <button 
                  className="perfil-btn-edit"
                  onClick={() => { setEditingName(true); setNewName(profile.name) }}
                >
                  Editar Nombre
                </button>
              </>
            )}
          </div>
        </div>

        {/* NIVEL */}
        <div className="perfil-level-card">
          <h3>Nivel {profile.level}</h3>

          <div className="perfil-xp-bar">
            <div className="perfil-xp-fill" style={{ width: `${xpPercent}%` }}></div>
          </div>

          <p className="perfil-xp-text">
            {profile.experience_points % 100} / 100 XP
          </p>
        </div>

        {/* INFO */}
        <div className="perfil-info-card">
          <h3>Información</h3>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>ID:</strong> {profile.id}</p>
          <p><strong>Última actividad:</strong> {profile.last_activity_date || "Sin actividad"}</p>
        </div>

        {/* STATS */}
        <div className="perfil-stats-grid">
          <div className="perfil-stat">
            <h4>Balance</h4>
            <p>{profile.balance}</p>
          </div>

          <div className="perfil-stat">
            <h4>Racha Actual</h4>
                <p className="stat-with-icon">
                {profile.streak}
                <img src="/Logo/Logoo.png" alt="fuego" className="stat-icon" />
                </p>
          </div>

          <div className="perfil-stat">
            <h4>Racha Máxima</h4>
                <p className="stat-with-icon">
                {profile.longest_streak}
                <img src="/Logo/Logoo.png" alt="fuego" className="stat-icon" />
                </p>
          </div>

          <div className="perfil-stat">
            <h4>AURA COINS</h4>
            <p className="stat-with-icon">
            {profile.total_points_earned}
            <img src="/Logo/Logoo.png" alt="fuego" className="stat-icon" />
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  )
}