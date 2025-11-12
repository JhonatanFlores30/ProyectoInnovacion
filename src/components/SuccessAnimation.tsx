import { useEffect, useState } from "react";
import { MdCheckCircle } from "react-icons/md";
import { Logo } from "./Logo";
import "./SuccessAnimation.css";

interface SuccessAnimationProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

export const SuccessAnimation = ({ show, message, onComplete }: SuccessAnimationProps) => {
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
      }, 2500);
      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className={`success-animation-overlay ${isAnimating ? "active" : ""}`}>
      <div className="success-background"></div>
      <div className={`success-animation-content ${isVisible ? "visible" : ""}`}>
        <div className="success-logo">
          <Logo size="xlarge" />
        </div>
        <div className="success-checkmark">
          <MdCheckCircle />
        </div>
        <p className="success-message">{message}</p>
        <div className="confetti-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`confetti confetti-${i}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

