import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import Toast from '../components/Toast';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);

const EMPTY_FORM = { name:'', description:'', image:'', size:'', weight:'', price:'', iva:'19', categoryId:'' };

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(
    product
      ? { ...product, price: String(product.price), iva: String(product.iva), categoryId: String(product.categoryId || '') }
      : { ...EMPTY_FORM }
  );
  const [imgError, setImgError] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === 'image') setImgError(false);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return;
    onSave({
      ...form,
      price: parseFloat(form.price),
      iva: parseFloat(form.iva) || 19,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 className="modal-title">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid grid-2" style={{ gap:14 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Nombre *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Nombre del producto" />
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Descripción</label>
              <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Describe el producto..." />
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">URL de Foto</label>
              <input className="form-control" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
              {form.image && !imgError && (
                <img
                  src={form.image}
                  alt="preview"
                  style={{ marginTop:8, height:80, objectFit:'cover', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}
                  onError={() => setImgError(true)}
                />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Talla (ej: 38-46)</label>
              <input className="form-control" name="size" value={form.size} onChange={handleChange} placeholder="38-46" />
            </div>
            <div className="form-group">
              <label className="form-label">Peso (ej: 280g)</label>
              <input className="form-control" name="weight" value={form.weight} onChange={handleChange} placeholder="280g" />
            </div>
            <div className="form-group">
              <label className="form-label">Precio unitario (COP) *</label>
              <input className="form-control" name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">IVA (%)</label>
              <input className="form-control" name="iva" type="number" value={form.iva} onChange={handleChange} placeholder="19" min="0" max="100" />
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Categoría</label>
              <select className="form-control" name="categoryId" value={form.categoryId} onChange={handleChange}>
                <option value="">— Sin categoría —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {product ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct, getCategoryById } = useStore();
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message: msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  };

  const handleSave = (data) => {
    if (modal.mode === 'create') { addProduct(data); addToast('Producto creado'); }
    else { updateProduct(modal.product.id, data); addToast('Producto actualizado'); }
    setModal(null);
  };

  const handleDelete = () => {
    deleteProduct(confirm.id);
    addToast('Producto eliminado', 'info');
    setConfirm(null);
  };

  const filtered = products.filter(p =>
    filterCat === 'all' || p.categoryId === Number(filterCat)
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">Gestiona el catálogo de calzado</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode:'create' })}>
          + Nuevo Producto
        </button>
      </div>

      {/* Category filter chips */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        <button className={`chip ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')}>
          Todos ({products.length})
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`chip ${filterCat === c.id ? 'active' : ''}`}
            onClick={() => setFilterCat(c.id)}
          >
            {c.name} ({products.filter(p => p.categoryId === c.id).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👟</div>
            <div className="empty-title">Sin productos</div>
            <div className="empty-text">Crea tu primer producto</div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width:60 }}>Foto</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Talla</th>
                  <th>Precio base</th>
                  <th>IVA</th>
                  <th>Total</th>
                  <th style={{ width:100 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const cat = getCategoryById(p.categoryId);
                  const total = p.price * (1 + p.iva / 100);
                  return (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&q=60'}
                          alt={p.name}
                          style={{ width:44, height:44, borderRadius:8, objectFit:'cover', border:'1px solid var(--border)' }}
                          onError={e => { e.target.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&q=60'; }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight:700 }}>{p.name}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</div>
                      </td>
                      <td>
                        {cat ? <span className="badge badge-gold">{cat.name}</span> : <span style={{ color:'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ color:'var(--text-secondary)' }}>{p.size || '—'}</td>
                      <td style={{ fontWeight:600 }}>{fmt(p.price)}</td>
                      <td><span className="badge badge-green">{p.iva}%</span></td>
                      <td style={{ color:'var(--accent)', fontWeight:700 }}>{fmt(total)}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal({ mode:'edit', product:p })} title="Editar">
                            <span className="material-symbols-rounded" style={{ fontSize:16 }}>edit</span>
                          </button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => setConfirm(p)} title="Eliminar">
                            <span className="material-symbols-rounded" style={{ fontSize:16 }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal.product || null}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div className="modal" style={{ maxWidth:400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Eliminar producto</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color:'var(--text-secondary)' }}>
                ¿Eliminar <strong style={{ color:'var(--text-primary)' }}>«{confirm.name}»</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
