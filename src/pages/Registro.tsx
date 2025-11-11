import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEmail, MdLock, MdPersonAdd, MdPlayArrow } from "react-icons/md";
import "./Registro.css";

export const Registro = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMensaje("Completa todos los campos");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("usuarios") || "[]");
    if (storedUsers.find((u: { email: string }) => u.email === email)) {
      setMensaje("El usuario ya existe");
      return;
    }

    storedUsers.push({ email, password });
    localStorage.setItem("usuarios", JSON.stringify(storedUsers));

    setMensaje("Cuenta creada exitosamente ✅");
    setTimeout(() => navigate("/"), 1500);
  };

  return (
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
              />
            </label>

            <label>
              <MdLock className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="btn-registrar">
              <MdPersonAdd /> Registrarse
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
  );
};