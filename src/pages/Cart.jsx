import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);

export default function Cart() {
  const { items, updateQty, removeItem, clearCart, subtotal, totalIva, total, totalItems } = useCart();
  const { placeOrder } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [confirming, setConfirming] = useState(false);

  const addToast = (msg, type='success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message: msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const handlePlaceOrder = async () => {
    try {
      await placeOrder(items, { subtotal, totalIva, total });
      await clearCart();
      addToast('¡Pedido realizado con éxito! 🎉');
      setConfirming(false);
      setTimeout(() => navigate('/orders'), 1800);
    } catch (err) {
      addToast(err.message || 'Error al realizar el pedido', 'error');
      setConfirming(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Carrito de Compras</h1>
            <p className="page-subtitle">Tu selección de productos</p>
          </div>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <div className="empty-title">Tu carrito está vacío</div>
            <div className="empty-text">Agrega productos desde el inicio para comenzar</div>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
              Explorar Productos
            </button>
          </div>
        </div>
        <Toast toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Carrito de Compras</h1>
          <p className="page-subtitle">{totalItems} ítem{totalItems !== 1 ? 's' : ''} en tu carrito</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { clearCart(); addToast('Carrito vaciado','info'); }}>
          🗑️ Vaciar carrito
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
        {/* Items list */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {items.map(({ product: p, qty }) => {
            const lineTotal = p.price * (1 + p.iva / 100) * qty;
            return (
              <div key={p.id} className="card" style={{ padding:'16px 20px', display:'flex', gap:16, alignItems:'center' }}>
                <img
                  src={p.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=60'}
                  alt={p.name}
                  style={{ width:80, height:80, borderRadius:10, objectFit:'cover', border:'1px solid var(--border)', flexShrink:0 }}
                  onError={e => { e.target.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=60'; }}
                />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{p.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>
                    Talla: {p.size || '—'} &bull; IVA: {p.iva}%
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
                    {fmt(p.price * (1 + p.iva/100))} c/u
                  </div>
                </div>

                {/* Qty control */}
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(p.id, qty - 1)}>−</button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(p.id, qty + 1)}>+</button>
                </div>

                <div style={{ minWidth:110, textAlign:'right' }}>
                  <div style={{ fontWeight:800, fontSize:16, color:'var(--accent)' }}>{fmt(lineTotal)}</div>
                </div>

                <button
                  className="btn btn-danger btn-icon btn-sm"
                  onClick={() => { removeItem(p.id); addToast(`«${p.name}» eliminado del carrito`, 'info'); }}
                  title="Eliminar"
                >🗑️</button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ position:'sticky', top:24 }}>
          <div className="card">
            <h3 style={{ fontWeight:700, fontSize:17, marginBottom:20 }}>Resumen del pedido</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              {items.map(({ product:p, qty }) => (
                <div key={p.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>
                    {p.name} ×{qty}
                  </span>
                  <span style={{ fontWeight:600 }}>{fmt(p.price * qty)}</span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                <span style={{ color:'var(--text-secondary)' }}>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                <span style={{ color:'var(--text-secondary)' }}>IVA</span>
                <span style={{ color:'var(--warning)' }}>{fmt(totalIva)}</span>
              </div>
              <hr className="divider" style={{ margin:'8px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:800 }}>
                <span>Total</span>
                <span style={{ color:'var(--accent)' }}>{fmt(total)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg w-full"
              style={{ marginTop:20, justifyContent:'center' }}
              onClick={() => setConfirming(true)}
            >
              ✓ Realizar Pedido
            </button>
            <button
              className="btn btn-ghost w-full"
              style={{ marginTop:8, justifyContent:'center' }}
              onClick={() => navigate('/')}
            >
              ← Seguir comprando
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirming && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirming(false)}>
          <div className="modal" style={{ maxWidth:400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirmar pedido</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setConfirming(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color:'var(--text-secondary)', lineHeight:1.7 }}>
                Vas a realizar un pedido por <strong style={{ color:'var(--accent)' }}>{fmt(total)}</strong> ({totalItems} ítem{totalItems !== 1 ? 's' : ''}).
                ¿Confirmas la compra?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirming(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handlePlaceOrder}>✓ Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
