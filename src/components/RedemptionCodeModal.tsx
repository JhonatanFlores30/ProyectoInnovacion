import { motion } from 'framer-motion'
import { MdCheckCircle, MdClose, MdContentCopy, MdStars } from 'react-icons/md'
import './RedemptionCodeModal.css'

interface RedemptionCodeModalProps {
  isOpen: boolean
  rewardName: string
  redemptionCode: string
  cashbackAmount?: number
  onClose: () => void
}

export const RedemptionCodeModal = ({
  isOpen,
  rewardName,
  redemptionCode,
  cashbackAmount,
  onClose
}: RedemptionCodeModalProps) => {
  if (!isOpen) return null

  const copyToClipboard = () => {
    navigator.clipboard.writeText(redemptionCode)
    // Mostrar feedback visual (podrías agregar un toast aquí)
    alert('¡Código copiado al portapapeles!')
  }

  return (
    <div className="code-modal-overlay" onClick={onClose}>
      <motion.div
        className="code-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="code-modal-close" onClick={onClose}>
          <MdClose />
        </button>

        <div className="code-modal-success">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <MdCheckCircle className="success-icon" />
          </motion.div>
          <h2>¡Canje Exitoso!</h2>
          <p className="success-message">Has canjeado: <strong>{rewardName}</strong></p>
        </div>

        <div className="code-modal-content">
          <div className="code-section">
            <label className="code-label">Tu código de canje:</label>
            <div className="code-display">
              <span className="code-text">{redemptionCode}</span>
              <button 
                className="code-copy-btn"
                onClick={copyToClipboard}
                title="Copiar código"
              >
                <MdContentCopy />
              </button>
            </div>
            <p className="code-note">
              Guarda este código de forma segura. Lo necesitarás para activar tu recompensa.
            </p>
          </div>

          {cashbackAmount && cashbackAmount > 0 && (
            <div className="cashback-section">
              <MdStars className="cashback-icon" />
              <div>
                <p className="cashback-label">¡Cashback recibido!</p>
                <p className="cashback-amount">+{cashbackAmount.toLocaleString()} AURACOINS</p>
              </div>
            </div>
          )}
        </div>

        <div className="code-modal-actions">
          <button className="code-btn-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

