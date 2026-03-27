const Toast = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast toast-${t.type}`}>
        <span>
          {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
        </span>
        {t.message}
      </div>
    ))}
  </div>
);

export default Toast;
