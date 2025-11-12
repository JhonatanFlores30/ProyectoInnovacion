import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEmail, MdLock, MdPersonAdd, MdPlayArrow } from "react-icons/md";
import { register } from "../services/authService";
import { SuccessAnimation } from "../components/SuccessAnimation";
import "./Registro.css";

export const Registro = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setIsLoading(true);

    if (!email || !password) {
      setMensaje("Completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        email,
        password,
        name: name || undefined
      });

      if (result.success) {
        setShowSuccessAnimation(true);
        setMensaje("Cuenta creada exitosamente ✅");
      } else {
        setMensaje(result.error || "Error al crear la cuenta");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error en registro:", error);
      setMensaje("Error al crear la cuenta. Intenta de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <SuccessAnimation
        show={showSuccessAnimation}
        message="¡Cuenta creada exitosamente!"
        onComplete={() => navigate("/")}
      />
      <div className="registro-container">
        <div className="registro-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
      <div className="registro-left">
              <img
                src="/Logo/Logoo.png"
                alt="AURACOINS"
                className="bg-floating"
                onClick={() => navigate("/")} 
                style={{ cursor: "pointer" }}
              />
        <div className="registro-brand">
          <h1 className="registro-title">AURACOINS</h1>
          <p className="registro-subtitle">Sistema de Recompensas para Streaming</p>
        </div>
        <div className="registro-info">
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

      <div className="registro-right">
        <div className="registro-card">
          <h2>Crear Cuenta</h2>
          <p>Regístrate para comenzar a ganar AURACOINS</p>

          <form onSubmit={handleRegister} className="registro-form">
            <label>
              <MdEmail className="input-icon" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </label>

            <label>
              <MdLock className="input-icon" />
              <input
                type="password"
                placeholder="•••••••• (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </label>

            <label>
              <MdPersonAdd className="input-icon" />
              <input
                type="text"
                placeholder="Nombre (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </label>

            <button type="submit" className="btn-registrar" disabled={isLoading}>
              <MdPersonAdd /> {isLoading ? "Registrando..." : "Registrarse"}
            </button>

            {mensaje && <p className="mensaje">{mensaje}</p>}
          </form>

          <div className="volver-login">
            <span>¿Ya tienes una cuenta?</span>
            <button onClick={() => navigate("/")}>Iniciar Sesión</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};