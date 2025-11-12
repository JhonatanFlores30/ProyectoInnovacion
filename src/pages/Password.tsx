import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdLock, MdPlayArrow, MdPersonAdd, MdEmail } from "react-icons/md";
import { sendVerificationCode, resetPassword } from "../services/authService";
import { SuccessAnimation } from "../components/SuccessAnimation";
import { supabase } from "../lib/supabase";
import "./Password.css";

export const Password = () => {
  // Estados para el flujo de pasos
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Esperando enlace, 3: Nueva contraseña
  
  // Estados para el paso 1 (Email)
  const [email, setEmail] = useState("");
  
  // Estados para el paso 3 (Nueva contraseña)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados generales
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Verificar si hay una sesión de recuperación al cargar la página
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        // Verificar si hay una sesión activa (usuario que hizo clic en el enlace del email)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Si hay sesión, significa que el usuario hizo clic en el enlace del email
          // Obtener el email del usuario de la sesión
          const userEmail = session.user.email || "";
          setEmail(userEmail);
          setStep(3); // Saltar directamente al paso de cambiar contraseña
          setMensaje("✅ Enlace verificado. Ahora puedes cambiar tu contraseña.");
        } else {
          // Verificar si hay un hash de recuperación en la URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');
          
          if (accessToken && type === 'recovery') {
            // Hay un token de recuperación en la URL, intentar establecer la sesión
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || ''
            });
            
            if (!error && data.session) {
              const userEmail = data.session.user.email || "";
              setEmail(userEmail);
              setStep(3);
              setMensaje("✅ Enlace verificado. Ahora puedes cambiar tu contraseña.");
              // Limpiar la URL
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        }
      } catch (error) {
        console.error('Error verificando sesión de recuperación:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, []);

  // Paso 1: Verificar correo y enviar enlace de recuperación
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMensaje("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setMensaje("✅ Enlace de recuperación enviado a tu correo. Por favor, revisa tu bandeja de entrada y haz clic en el enlace.");
        setStep(2); // Mostrar paso de espera
      } else {
        setMensaje(result.error || "Error al enviar el enlace de recuperación");
      }
    } catch (error) {
      setMensaje("Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Cambiar contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMensaje("Completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const result = await resetPassword(email, password);
      
      if (result.success) {
        setShowSuccessAnimation(true);
        setMensaje("✅ Contraseña actualizada correctamente");
      } else {
        setMensaje(result.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      setMensaje("Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la sesión
  if (checkingSession) {
    return (
      <div className="password-container">
        <div className="password-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: '#fff'
        }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SuccessAnimation
        show={showSuccessAnimation}
        message="¡Contraseña actualizada exitosamente!"
        onComplete={() => navigate("/")}
      />
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
          
          {/* Indicador de pasos */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Correo</p>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Enlace</p>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Nueva Contraseña</p>
            </div>
          </div>

          {/* Paso 1: Ingresar correo */}
          {step === 1 && (
            <>
              <p className="password-subtitle">
                Ingresa tu correo electrónico para recibir un enlace de recuperación
              </p>
              <form onSubmit={handleEmailSubmit} className="password-form">
                <label>
                  <MdEmail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="btn-password"
                  disabled={loading}
                  style={{ marginTop: "1rem" }}
                >
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
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
            </>
          )}

          {/* Paso 2: Esperando enlace del email */}
          {step === 2 && (
            <>
              <p className="password-subtitle">
                Se ha enviado un enlace de recuperación a <strong>{email}</strong>
              </p>
              <div className="password-form" style={{ textAlign: 'center' }}>
                <div style={{ 
                  padding: '2rem', 
                  background: 'rgba(0, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  marginBottom: '1rem'
                }}>
                  <MdEmail style={{ fontSize: '3rem', color: '#00ffff', marginBottom: '1rem' }} />
                  <p style={{ color: '#fff', marginBottom: '0.5rem' }}>
                    Revisa tu bandeja de entrada
                  </p>
                  <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Haz clic en el enlace que te enviamos por correo para continuar con el restablecimiento de tu contraseña.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setMensaje("");
                  }}
                  className="btn-secondary"
                  style={{ marginTop: "0.5rem" }}
                >
                  Cambiar correo
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const result = await sendVerificationCode(email);
                      if (result.success) {
                        setMensaje("✅ Enlace reenviado a tu correo");
                      } else {
                        setMensaje(result.error || "Error al reenviar el enlace");
                      }
                    } catch (error) {
                      setMensaje("Error al reenviar el enlace");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="btn-secondary"
                  style={{ marginTop: "0.5rem" }}
                  disabled={loading}
                >
                  {loading ? "Reenviando..." : "Reenviar enlace"}
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
              </div>
            </>
          )}

          {/* Paso 3: Nueva contraseña */}
          {step === 3 && (
            <>
              <p className="password-subtitle">
                Ingresa tu nueva contraseña
              </p>
              <form onSubmit={handlePasswordSubmit} className="password-form">
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
            </>
          )}

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
