import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);
const fmtDate = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle:'medium', timeStyle:'short' });

export default function Orders() {
  const { orders, refreshOrders } = useStore();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (user) refreshOrders();
  }, [user, refreshOrders]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">Historial de compras realizadas en la plataforma</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span className="badge badge-gold">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Sin pedidos</div>
            <div className="empty-text">Los pedidos realizados aparecerán aquí</div>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {orders.map(order => (
            <div
              key={order.id}
              className="card"
              style={{
                cursor:'pointer',
                transition:'var(--transition)',
                borderColor: selected?.id === order.id ? 'var(--accent)' : 'var(--border)',
              }}
              onClick={() => setSelected(s => s?.id === order.id ? null : order)}
            >
              {/* Order header */}
              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                <div style={{
                  width:44, height:44, borderRadius:10, flexShrink:0,
                  background:'var(--accent-glow)',
                  border:'1px solid rgba(201,168,76,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
                }}>📦</div>

                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>
                    Pedido #{String(order.id).slice(-6)}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                    {fmtDate(order.created_at || order.date)}
                  </div>
                </div>

                <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {order.items?.length ?? 0} ítem{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontWeight:800, fontSize:18, color:'var(--accent)' }}>{fmt(order.total)}</div>
                  </div>
                  <span className="badge badge-green">{order.status}</span>
                  <span style={{ color:'var(--text-muted)', fontSize:18 }}>
                    {selected?.id === order.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Order detail */}
              {selected?.id === order.id && (
                <div style={{ marginTop:20, animation:'slideUp 0.2s ease' }}>
                  <hr className="divider" />
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio unitario</th>
                          <th>IVA</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((item, idx) => {
                          // Support both API shape and legacy localStorage shape
                          const nombre = item.product_name || item.product?.name || '—';
                          const precio = Number(item.unit_price ?? item.product?.price ?? 0);
                          const iva    = Number(item.iva_pct   ?? item.product?.iva   ?? 0);
                          const qty    = item.quantity ?? item.qty ?? 1;
                          const unitWithIva = precio * (1 + iva / 100);
                          return (
                            <tr key={item.id ?? idx}>
                              <td style={{ fontWeight:600 }}>{nombre}</td>
                              <td style={{ color:'var(--text-secondary)' }}>×{qty}</td>
                              <td>{fmt(precio)}</td>
                              <td><span className="badge badge-gold">{iva}%</span></td>
                              <td style={{ color:'var(--accent)', fontWeight:700 }}>{fmt(unitWithIva * qty)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                    <div style={{
                      background:'var(--bg-secondary)',
                      border:'1px solid var(--border)',
                      borderRadius:'var(--radius-md)',
                      padding:'14px 20px',
                      display:'flex', flexDirection:'column', gap:8, minWidth:220,
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                        <span style={{ color:'var(--text-secondary)' }}>Subtotal</span>
                        <span>{fmt(order.subtotal)}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                        <span style={{ color:'var(--text-secondary)' }}>IVA</span>
                        <span style={{ color:'var(--warning)' }}>{fmt(order.total_iva)}</span>
                      </div>
                      <hr className="divider" style={{ margin:'4px 0' }} />
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:800 }}>
                        <span>Total</span>
                        <span style={{ color:'var(--accent)' }}>{fmt(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
