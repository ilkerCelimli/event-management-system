import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import EventCard from '../components/EventCard.jsx';

const CATEGORIES = ['CONFERENCE', 'WORKSHOP', 'MEETUP', 'CONCERT', 'SPORTS', 'EDUCATION', 'OTHER'];

export default function EventsPage({ onNotify, onCreate, onEdit, onDetail, currentUserId, isAdmin }) {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ title: '', category: '', city: '' });
  const [includeCancelled, setIncludeCancelled] = useState(false);

  const load = useCallback(async (pg = page, inc = includeCancelled) => {
    setLoading(true);
    try {
      const res = await api.searchEvents({ ...filters, includeCancelled: inc }, pg, 12);
      setEvents(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      onNotify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, includeCancelled, filters]);

  useEffect(() => { load(0); }, [load]);

  const doSearch = (e) => {
    e.preventDefault();
    setPage(0);
    load(0);
  };

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
        <h2>Etkinlikler</h2>
        {onCreate && <button className="btn-primary" onClick={onCreate}>+ Yeni Etkinlik</button>}
      </div>

      <form className="search-bar" onSubmit={doSearch}>
        <input placeholder="Başlık ara..." value={filters.title}
               onChange={(e) => setFilters({ ...filters, title: e.target.value })} />
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">Tüm Kategoriler</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Şehir" value={filters.city}
               onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <label className="chk">
          <input type="checkbox" checked={includeCancelled}
                 onChange={(e) => setIncludeCancelled(e.target.checked)} /> İptal edilenler dahil
        </label>
        <button className="btn-primary btn-sm" type="submit">Ara</button>
      </form>

      {loading ? <div className="spinner">Yükleniyor...</div> : events.length === 0 ? (
        <div className="empty">Sonuç bulunamadı.</div>
      ) : (
        <div className="card-grid">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onDetail={() => onDetail(ev)}
              onEdit={() => onEdit(ev)}
              onDelete={() => remove(ev)}
              canManage={canManage(ev, currentUserId, isAdmin)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pager">
          <button className="btn-ghost btn-sm" disabled={page === 0} onClick={() => { setPage(page - 1); load(page - 1); }}>‹ Önceki</button>
          <span className="pageinfo">Sayfa {page + 1} / {totalPages}</span>
          <button className="btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => { setPage(page + 1); load(page + 1); }}>Sonraki ›</button>
        </div>
      )}
    </section>
  );
}

function canManage(ev, currentUserId, isAdmin) {
  return currentUserId && (isAdmin || ev.organizerId === currentUserId);
}