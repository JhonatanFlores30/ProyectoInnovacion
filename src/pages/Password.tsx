import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLock, MdPlayArrow, MdPersonAdd } from "react-icons/md";
import "./Password.css";

interface PasswordProps {
  userEmail: string;
}

export const Password = ({ userEmail }: PasswordProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMensaje("Completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setMensaje("");

    setTimeout(() => {
      setLoading(false);
      setMensaje("Contraseña actualizada correctamente.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/"), 2000);
    }, 1500);
  };

  return (
    <div className="password-container">
      <div className="password-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="password-left">
        <img
          src="/Logo/Logoo.png"
          alt="AURACOINS"
          className="bg-floating"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />
        <div className="password-brand">
          <h1 className="password-title">AURACOINS</h1>
          <p className="password-subtitle">
            Sistema de Recompensas para Streaming
          </p>
        </div>

        <div className="password-info">
          <div className="info-item">
            <MdPlayArrow className="info-icon" />
            <div>
              <h3>Vincula tus Cuentas</h3>
              <p>Conéctate a Netflix. Próximamente más plataformas.</p>
            </div>
          </div>

          <div className="info-item">
            <MdPersonAdd className="info-icon" />
            <div>
              <h3>Crea tu Perfil</h3>
              <p>Únete al sistema para comenzar a ganar recompensas.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="password-right">
        <div className="password-card">
          <h2 className="password-title">Restablecer Contraseña</h2>
          <p className="password-subtitle">
            Correo asociado: <strong>{userEmail}</strong>
          </p>

          <form onSubmit={handleRegister} className="password-form">
            <label>
              <MdLock className="input-icon" />
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label>
              <MdLock className="input-icon" />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              className="btn-password"
              disabled={loading}
              style={{ marginTop: "1rem" }}
            >
              {loading ? "Actualizando..." : "Guardar contraseña"}
            </button>

            {mensaje && (
              <p
                className="mensaje"
                style={{
                  color: mensaje.includes("✅") ? "#00ffff" : "#ff6464",
                  marginTop: "1rem",
                }}
              >
                {mensaje}
              </p>
            )}
          </form>

          <div className="volver-login">
            <span>¿Ya tienes una cuenta?</span>
            <button onClick={() => navigate("/")}>Iniciar Sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
};
