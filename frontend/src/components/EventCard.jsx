export const STATUS_META = {
  DRAFT: { label: 'Taslak', cls: 'st-draft' },
  PUBLISHED: { label: 'Yayında', cls: 'st-pub' },
  CANCELLED: { label: 'İptal', cls: 'st-canc' },
  COMPLETED: { label: 'Tamamlandı', cls: 'st-done' }
};

export const CATEGORY_ICON = {
  CONFERENCE: '🎤', WORKSHOP: '🛠️', MEETUP: '🤝', CONCERT: '🎶', SPORTS: '⚽', EDUCATION: '🎓', OTHER: '✨'
};

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function statusBadge(status) {
  const meta = STATUS_META[status] || { label: status, cls: 'st-draft' };
  return <span className={`status ${meta.cls}`}>{meta.label}</span>;
}

export default function EventCard({ event, onDetail, onEdit, onDelete, canManage }) {
  const fill = event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
  const full = event.registeredCount >= event.capacity;

  return (
    <div className="event-card">
      <div className="card-top">
        <span className="card-cat">{CATEGORY_ICON[event.category] || '✨'} {event.category}</span>
        {statusBadge(event.status)}
      </div>
      <h3 className="card-title" onClick={() => onDetail(event)}>{event.title}</h3>
      <p className="card-desc">{truncate(event.description, 140)}</p>
      <div className="card-meta">
        <span>📍 {event.city || event.venueName || '—'}</span>
        <span>🗓 {fmtDate(event.startTime)}</span>
      </div>
      <div className="card-meta muted">
        <span>👤 {event.organizerName}</span>
      </div>
      <div className="capacity-bar">
        <div className="capacity-fill" style={{ width: Math.min(fill, 100) + '%' }} />
        <span className="capacity-label">{event.registeredCount}/{event.capacity} kayıt{full ? ' • DOLU' : ''}</span>
      </div>
      <div className="card-actions">
        <button className="btn-primary btn-sm" onClick={() => onDetail(event)}>Detay</button>
        {canManage && <>
          <button className="btn-ghost btn-sm" onClick={() => onEdit(event)}>Düzenle</button>
          <button className="btn-danger btn-sm" onClick={() => onDelete(event)}>Sil</button>
        </>}
      </div>
    </div>
  );
}

function truncate(s, n) {
  return s && s.length > n ? s.slice(0, n) + '…' : s;
}