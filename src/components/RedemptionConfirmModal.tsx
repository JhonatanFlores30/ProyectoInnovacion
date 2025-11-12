import { motion } from 'framer-motion'
import { MdCheckCircle, MdClose, MdCardGiftcard, MdStars, MdWarning } from 'react-icons/md'
import type { Reward } from '../services/rewardService'
import './RedemptionConfirmModal.css'

interface RedemptionConfirmModalProps {
  reward: Reward | null
  userBalance: number
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export const RedemptionConfirmModal = ({
  reward,
  userBalance,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: RedemptionConfirmModalProps) => {
  if (!isOpen || !reward) return null

  const hasEnoughBalance = userBalance >= reward.price
  const balanceAfter = userBalance - reward.price
  const cashbackAmount = reward.cashback 
    ? Math.floor(reward.price * (reward.cashback / 100))
    : 0

  return (
    <div className="redemption-modal-overlay" onClick={onClose}>
      <motion.div
        className="redemption-confirm-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="redemption-modal-close" onClick={onClose}>
          <MdClose />
        </button>

        <div className="redemption-modal-header">
          <div className="redemption-modal-icon">
            <MdCardGiftcard />
          </div>
          <h2>Confirmar Canje</h2>
        </div>

        <div className="redemption-modal-content">
          <div className="redemption-reward-info">
            <h3>{reward.name}</h3>
            <p className="redemption-reward-description">{reward.description}</p>
          </div>

          <div className="redemption-details">
            <div className="redemption-detail-row">
              <span className="detail-label">Costo:</span>
              <span className="detail-value cost">{reward.price.toLocaleString()} AURACOINS</span>
            </div>

            {reward.cashback && (
              <div className="redemption-detail-row cashback">
                <span className="detail-label">
                  <MdStars /> Cashback ({reward.cashback}%):
                </span>
                <span className="detail-value">+{cashbackAmount.toLocaleString()} AURACOINS</span>
              </div>
            )}

            <div className="redemption-detail-row">
              <span className="detail-label">Tu balance actual:</span>
              <span className="detail-value">{userBalance.toLocaleString()} AURACOINS</span>
            </div>

            <div className="redemption-detail-row balance-after">
              <span className="detail-label">Balance después del canje:</span>
              <span className={`detail-value ${hasEnoughBalance ? '' : 'insufficient'}`}>
                {hasEnoughBalance 
                  ? `${(balanceAfter + cashbackAmount).toLocaleString()} AURACOINS${cashbackAmount > 0 ? ' (incluye cashback)' : ''}`
                  : 'Insuficiente'
                }
              </span>
            </div>
          </div>

          {!hasEnoughBalance && (
            <div className="redemption-warning">
              <MdWarning />
              <div>
                <strong>Balance insuficiente</strong>
                <p>Necesitas {reward.price.toLocaleString()} AURACOINS pero tienes {userBalance.toLocaleString()}.</p>
                <p>Te faltan {(reward.price - userBalance).toLocaleString()} AURACOINS.</p>
              </div>
            </div>
          )}

          {hasEnoughBalance && (
            <div className="redemption-note">
              <p>Al confirmar, se generará un código único para tu recompensa.</p>
              <p>El código aparecerá después de la confirmación.</p>
            </div>
          )}
        </div>

        <div className="redemption-modal-actions">
          <button 
            className="redemption-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className={`redemption-btn-confirm ${hasEnoughBalance ? '' : 'disabled'}`}
            onClick={onConfirm}
            disabled={!hasEnoughBalance || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner-small"></span>
                Procesando...
              </>
            ) : (
              <>
                <MdCheckCircle />
                Confirmar Canje
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

