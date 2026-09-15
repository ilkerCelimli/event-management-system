export default function Toast({ message, type }) {
  return (
    <div className={`toast toast-${type}`} role="status">
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {message}
    </div>
  );
}