import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Settings.css";

// ICONOS CORRECTOS
import { RiNetflixFill, RiXboxFill } from "react-icons/ri";
import { SiGoogleplay, SiPlaystation, SiSteam } from "react-icons/si";

//  MODAL DE VINCULACIÓN
function ModalVinculacion({
  visible,
  platform,
  isLinked,
  onClose,
  icon,
}: {
  visible: boolean;
  platform: string;
  isLinked: boolean;
  onClose: () => void;
  icon: React.ReactNode;
}) {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-card modal-${platform}`}>
        <div className="modal-icon">{icon}</div>

        <h2 className="modal-title">
          {isLinked ? "Cuenta Vinculada" : "Cuenta Desvinculada"}
        </h2>

        <p className="modal-message">
          {isLinked
            ? `Has vinculado tu cuenta de ${platform.toUpperCase()} correctamente.`
            : `Has desvinculado tu cuenta de ${platform.toUpperCase()}.`}
        </p>

        <button className="modal-button" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}

//  SETTINGS PAGE
type Cuenta = {
  id: string;
  platform: string;
  is_linked: boolean;
};

interface SettingsPageProps {
  userId?: string;
}

export default function SettingsPage({ userId }: SettingsPageProps) {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [resolvedUserId, setResolvedUserId] = useState<string>("");

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPlatform, setModalPlatform] = useState("");
  const [modalLinked, setModalLinked] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(null);

  // Íconos react-icons — ahora SÍ válidos
  const platformIcons: Record<string, React.ReactNode> = {
    netflix: <RiNetflixFill />,
    playstore: <SiGoogleplay />,
    xbox: <RiXboxFill />,
    playstation: <SiPlaystation />,
    steam: <SiSteam />,
  };

  function toggleItem(item: string) {
    setOpenItem((prev) => (prev === item ? null : item));
  }

  //  CARGAR DATOS
  useEffect(() => {
    async function cargarDatos() {
      let uid = userId;

      if (!uid) {
        const { data } = await supabase.auth.getUser();
        uid = data?.user?.id ?? "";
      }

      if (!uid) return;

      setResolvedUserId(uid);

      const { data: linked } = await supabase
        .from("linked_accounts")
        .select("*")
        .eq("user_id", uid);

      if (linked) setCuentas(linked);
    }

    cargarDatos();
  }, [userId]);

  //  VINCULAR / DESVINCULAR
  async function toggleCuenta(cuenta: Cuenta) {
    if (!resolvedUserId) return;

    // Asegurar que exista registro por si fue borrado
    await supabase.rpc("ensure_linked_account", {
      userid: resolvedUserId,
      platformname: cuenta.platform,
    });

    // Actualizar Supabase
    const { error } = await supabase
      .from("linked_accounts")
      .update({
        is_linked: !cuenta.is_linked,
        updated_at: new Date(),
      })
      .eq("id", cuenta.id);

    if (!error) {
      const newState = !cuenta.is_linked;

      setCuentas((prev) =>
        prev.map((c) =>
          c.id === cuenta.id ? { ...c, is_linked: newState } : c
        )
      );

      // Modal
      setModalPlatform(cuenta.platform);
      setModalLinked(newState);
      setModalVisible(true);
    }
  }

  return (
    <div className="configuracion-container">
      {/* MODAL */}
      <ModalVinculacion
        visible={modalVisible}
        platform={modalPlatform}
        isLinked={modalLinked}
        icon={platformIcons[modalPlatform]}
        onClose={() => setModalVisible(false)}
      />

      <h1 className="config-title">Configuración</h1>

      {/* CUENTAS VINCULADAS */}
      <section className="config-card">
        <h2>Cuentas Vinculadas</h2>
        <div className="cuentas-list">
          {cuentas.map((c) => (
            <div key={c.id} className={`cuenta-item plataforma-${c.platform}`}>
              <div className="cuenta-info">
                <span className="icon-react">
                  {platformIcons[c.platform]}
                </span>
                <span className="cuenta-nombre">{c.platform.toUpperCase()}</span>
              </div>

              <button
                className={c.is_linked ? "desvincular" : "vincular"}
                onClick={() => toggleCuenta(c)}
              >
                {c.is_linked ? "Desvincular" : "Vincular"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SOPORTE */}
      <section className="config-card">
        <h2>Soporte</h2>
        <ul className="support-list">

          {/* Preguntas Frecuentes */}
          <li className="accordion-item">
            <div className="accordion-title" onClick={() => toggleItem("faq")}>
              ❓ Preguntas Frecuentes
            </div>
            {openItem === "faq" && (
              <div className="accordion-content">
                <h3>🔹 ¿Qué es Auracoins?</h3>
                <p>Auracoins es una plataforma donde ganas puntos por ver contenido en tus servicios de streaming vinculados. Estos puntos pueden canjearse por recompensas digitales.</p>

                <h3>🔹 ¿Cómo gano puntos?</h3>
                <ul>
                  <li>Viendo contenido validado en plataformas vinculadas.</li>
                  <li>Participando en retos, trivias y eventos especiales.</li>
                  <li>Manteniendo tu racha diaria activa.</li>
                </ul>

                <h3>🔹 ¿Por qué debo vincular mis cuentas?</h3>
                <p>La vinculación nos permite verificar tu actividad automáticamente para asignarte puntos sin acciones manuales.</p>

                <h3>🔹 ¿Puedo desvincular mis cuentas?</h3>
                <p>Sí. Puedes activar o desactivar cualquier plataforma desde <strong>Configuración → Cuentas Vinculadas</strong>.</p>

                <h3>🔹 ¿Qué hago si no recibí mis puntos?</h3>
                <p>Ve a <strong>Soporte → Reportar un Problema</strong>. Nuestro equipo te ayudará lo antes posible.</p>
              </div>
            )}
          </li>

          {/* Contactar Soporte */}
          <li className="accordion-item">
            <div className="accordion-title" onClick={() => toggleItem("soporte")}>
              📩 Contactar Soporte
            </div>
            {openItem === "soporte" && (
              <div className="accordion-content">
                Puedes enviarnos un mensaje a:<br />
                <strong>support@auracoins.com</strong><br /><br />
                Tiempo de respuesta promedio: <strong>menos de 24 horas</strong>.
              </div>
            )}
          </li>

          {/* Reportar problema */}
          <li className="accordion-item">
            <div className="accordion-title" onClick={() => toggleItem("bug")}>
              🐞 Reportar un Problema
            </div>
            {openItem === "bug" && (
              <div className="accordion-content">
                Si encuentras un error o algo no funciona correctamente, repórtalo desde tu panel o contáctanos directamente.<br />
                Tu retroalimentación nos ayuda a mejorar Auracoins para todos los usuarios.
              </div>
            )}
          </li>
        </ul>
      </section>

      {/* LEGAL */}
      <section className="config-card">
        <h2>Legal</h2>
        <ul className="support-list">

          {/* Términos y Condiciones */}
          <li className="accordion-item">
            <div className="accordion-title" onClick={() => toggleItem("terminos")}>
              📜 Términos y Condiciones
            </div>
            {openItem === "terminos" && (
              <div className="accordion-content">
                <h3>🔹 Uso de Auracoins</h3>
                <p>Auracoins es un servicio gratuito donde obtienes puntos por actividades verificadas en plataformas vinculadas.</p>

                <h3>🔹 Puntos y recompensas</h3>
                <p>Los puntos no representan dinero real. Su valor y reglas de uso pueden ajustarse sin previo aviso.</p>

                <h3>🔹 Conducta del usuario</h3>
                <ul>
                  <li>No manipular actividad para obtener puntos.</li>
                  <li>No usar bots o métodos automáticos.</li>
                  <li>No crear múltiples cuentas para obtener beneficios.</li>
                </ul>

                <h3>🔹 Cuentas vinculadas</h3>
                <p>Solo se solicita la información mínima necesaria para validar tu actividad. Nunca solicitamos contraseñas.</p>

                <h3>🔹 Limitación de responsabilidad</h3>
                <p>Auracoins no se responsabiliza por fallas, bloqueos o interrupciones en servicios externos como Netflix, Steam o PlayStation.</p>
              </div>
            )}
          </li>

          {/* Política de Privacidad */}
          <li className="accordion-item">
            <div className="accordion-title" onClick={() => toggleItem("privacidad")}>
              🔒 Política de Privacidad
            </div>
            {openItem === "privacidad" && (
              <div className="accordion-content">
                <h3>🔹 Datos que recopilamos</h3>
                <ul>
                  <li>Correo, nombre e ID de usuario.</li>
                  <li>Actividad dentro de Auracoins.</li>
                  <li>Información mínima para validar actividad en plataformas vinculadas.</li>
                </ul>

                <h3>🔹 Cómo usamos tus datos</h3>
                <ul>
                  <li>Asignar puntos y administrar recompensas.</li>
                  <li>Mejorar tu experiencia dentro de la plataforma.</li>
                  <li>Detectar actividad sospechosa o fraudulenta.</li>
                </ul>

                <h3>🔹 Seguridad</h3>
                <p>Tus datos están protegidos mediante sistemas de cifrado y acceso restringido.</p>

                <h3>🔹 Tus derechos</h3>
                <p>Puedes solicitar modificar o eliminar tu información, así como desvincular tus cuentas en cualquier momento.</p>

                <h3>🔹 Contacto</h3>
                <p>Si tienes dudas o inquietudes, escríbenos a: <strong>privacy@auracoins.com</strong></p>
              </div>
            )}
          </li>

        </ul>
      </section>
    </div>
  );
}