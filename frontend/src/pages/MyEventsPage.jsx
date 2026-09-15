import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import EventCard from '../components/EventCard.jsx';

export default function MyEventsPage({ onNotify, currentUserId, isAdmin, onCreate, onEdit, onDetail }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.eventsByOrganizer(currentUserId);
      setEvents(Array.isArray(res) ? res : (res.content || []));
    } catch (err) {
      onNotify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { load(); }, [load]);

  const remove = async (ev) => {
    if (!window.confirm(`${ev.title} etkinliği silinsin mi?`)) return;
    try {
      await api.deleteEvent(ev.id);
      onNotify('Etkinlik silindi');
      load();
    } catch (err) { onNotify(err.message, 'error'); }
  };

  return (
    <section className="page">
      <div className="page-head">
        <h2>Etkinliklerim</h2>
        <button className="btn-primary" onClick={onCreate}>+ Yeni Etkinlik</button>
      </div>

      {loading ? <div className="spinner">Yükleniyor...</div> : events.length === 0 ? (
        <div className="empty">Henüz etkinlik oluşturmadınız.</div>
      ) : (
        <div className="card-grid">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onDetail={() => onDetail(ev)}
              onEdit={() => onEdit(ev)}
              onDelete={() => remove(ev)}
              canManage={isAdmin || true}
            />
          ))}
        </div>
      )}
    </section>
  );
}