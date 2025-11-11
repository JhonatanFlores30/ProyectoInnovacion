import './Logo.css'

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge'
}

export const Logo = ({ size = 'medium' }: LogoProps) => {
  return (
    <div className={`logo-container logo-${size}`}>
      <div className="logo-aura">
        <div className="aura-left"></div>
        <div className="aura-right"></div>
      </div>
      <div className="logo-image-wrapper">
        <img 
          src="/Logo/Logoo.png" 
          alt="AURACOINS Logo" 
          className="logo-image"
        />
      </div>
    </div>
  )
}

