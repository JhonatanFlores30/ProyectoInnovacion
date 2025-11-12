import { useEffect, useState } from "react";
import { MdLogout } from "react-icons/md";
import { Logo } from "./Logo";
import "./LogoutAnimation.css";

interface LogoutAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const LogoutAnimation = ({ show, onComplete }: LogoutAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      const completeTimer = setTimeout(() => {
        setIsAnimating(false);
        setIsVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }, 3500);
      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className={`logout-animation-overlay ${isAnimating ? "active" : ""}`}>
      <div className="logout-background"></div>
      <div className={`logout-animation-content ${isVisible ? "visible" : ""}`}>
        <div className="logout-logo">
          <Logo size="xlarge" />
        </div>
        <div className="logout-icon">
          <MdLogout />
        </div>
        <p className="logout-message">Cerrando sesión...</p>
        <div className="logout-particles">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className={`particle particle-${i}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

