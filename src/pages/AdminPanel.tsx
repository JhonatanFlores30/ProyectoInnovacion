import { useEffect, useState } from "react";
import type { User } from "../services/authService";
import { supabase } from "../lib/supabase";
import "./AdminPanel.css";

interface AdminPanelProps {
  user: User;
   onLogout: () => Promise<void>;
}

export default function AdminPanel({ user , onLogout}: AdminPanelProps) {
  // Estados principales
  const [rewards, setRewards] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form estados
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");

  const [offerTitle, setOfferTitle] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerDiscount, setOfferDiscount] = useState<number | "">("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: rewardsData } = await supabase.from("rewards").select("*");
    const { data: eventsData } = await supabase.from("special_events").select("*");
    const { data: moviesData } = await supabase.from("movies").select("*");
    const { data: offersData } = await supabase.from("offers").select("*");

    setRewards(rewardsData || []);
    setEvents(eventsData || []);
    setMovies(moviesData || []);
    setOffers(offersData || []);
    setLoading(false);
  }

  // CRUD Rewards
  async function updateRewardPrice(id: string, price: number) {
    await supabase.from("rewards").update({ price }).eq("id", id);
    loadData();
  }

  // CRUD Eventos
  async function addEvent() {
    if (!eventTitle || !eventDesc) return;

    await supabase
      .from("special_events")
      .insert([{ title: eventTitle, description: eventDesc }]);

    setEventTitle("");
    setEventDesc("");
    loadData();
  }

  async function deleteEvent(id: string) {
    await supabase.from("special_events").delete().eq("id", id);
    loadData();
  }

  // Película semanal
  async function setMovieOfWeek(id: string) {
    await supabase.from("movies").update({ is_weekly: false });
    await supabase.from("movies").update({ is_weekly: true }).eq("id", id);
    loadData();
  }

  // CRUD Ofertas
  async function addOffer() {
    if (!offerTitle || !offerDesc || !offerDiscount) return;

    await supabase
      .from("offers")
      .insert([{ title: offerTitle, description: offerDesc, discount: offerDiscount }]);

    setOfferTitle("");
    setOfferDesc("");
    setOfferDiscount("");
    loadData();
  }

  async function deleteOffer(id: string) {
    await supabase.from("offers").delete().eq("id", id);
    loadData();
  }

  if (loading) return <p style={{ padding: 20 }}>Cargando panel...</p>;

  return (
    <div className="admin-panel-container">
      <h1 className="admin-title">Panel de Administración</h1>
      <button className="admin-logout-btn" onClick={onLogout}>
        Cerrar sesión
      </button>
      <p className="admin-subtitle">Administrador: {user.name}</p>

      <div className="tabs">
        <input type="radio" id="tab1" name="tabs" defaultChecked />
        <label htmlFor="tab1">Recompensas</label>

        <input type="radio" id="tab2" name="tabs" />
        <label htmlFor="tab2">Eventos</label>

        <input type="radio" id="tab3" name="tabs" />
        <label htmlFor="tab3">Película de la Semana</label>

        <input type="radio" id="tab4" name="tabs" />
        <label htmlFor="tab4">Ofertas</label>

        {/* TAB 1 */}
        <section id="content1">
          <h2>Recompensas</h2>

          {rewards.map((r) => (
            <div key={r.id} className="card-item">
              <div>
                <h3>{r.title}</h3>
                <p>Puntos actuales: {r.price}</p>
              </div>

              <input
                type="number"
                value={r.price}
                onChange={(e) => updateRewardPrice(r.id, Number(e.target.value))}
                className="input-number"
              />
            </div>
          ))}
        </section>

        {/* TAB 2 */}
        <section id="content2">
          <h2>Eventos Especiales</h2>

          <div className="form">
            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Título"
              className="input-text"
            />
            <input
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              placeholder="Descripción"
              className="input-text"
            />

            <button className="btn" onClick={addEvent}>
              Agregar Evento
            </button>
          </div>

          {events.map((ev) => (
            <div key={ev.id} className="card-item">
              <div>
                <h3>{ev.title}</h3>
                <p>{ev.description}</p>
              </div>

              <button className="btn-delete" onClick={() => deleteEvent(ev.id)}>
                Eliminar
              </button>
            </div>
          ))}
        </section>

        {/* TAB 3 */}
        <section id="content3">
          <h2>Película de la Semana</h2>

          {movies.map((m) => (
            <div key={m.id} className="card-item">
              <div>
                <h3>{m.title}</h3>
                <p>{m.synopsis}</p>
                {m.is_weekly && <span className="badge">SELECCIONADA</span>}
              </div>

              <button className="btn" onClick={() => setMovieOfWeek(m.id)}>
                Seleccionar
              </button>
            </div>
          ))}
        </section>

        {/* TAB 4 */}
        <section id="content4">
          <h2>Ofertas</h2>

          <div className="form">
            <input
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="Título"
              className="input-text"
            />

            <input
              value={offerDesc}
              onChange={(e) => setOfferDesc(e.target.value)}
              placeholder="Descripción"
              className="input-text"
            />

            <input
              type="number"
              value={offerDiscount}
              onChange={(e) => setOfferDiscount(Number(e.target.value))}
              placeholder="Descuento (%)"
              className="input-number"
            />

            <button className="btn" onClick={addOffer}>
              Agregar Oferta
            </button>
          </div>

          {offers.map((o) => (
            <div key={o.id} className="card-item">
              <div>
                <h3>{o.title}</h3>
                <p>{o.description}</p>
                <p>Descuento: {o.discount}%</p>
              </div>

              <button className="btn-delete" onClick={() => deleteOffer(o.id)}>
                Eliminar
              </button>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
