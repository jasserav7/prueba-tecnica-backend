import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import Toast from '../components/Toast';

function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{category ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Ej: Deportivo" required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Describe esta categoría..." rows={3} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            onClick={() => { if (!form.name.trim()) return; onSave(form); }}
          >
            {category ? 'Guardar Cambios' : 'Crear Categoría'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, getProductsByCategory } = useStore();
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', cat?: obj }
  const [confirm, setConfirm] = useState(null); // cat to delete
  const [selected, setSelected] = useState(null); // view products of cat
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  };

  const handleSave = (data) => {
    if (modal.mode === 'create') {
      addCategory(data);
      addToast('Categoría creada');
    } else {
      updateCategory(modal.cat.id, data);
      addToast('Categoría actualizada');
    }
    setModal(null);
  };

  const handleDelete = () => {
    deleteCategory(confirm.id);
    addToast('Categoría eliminada', 'info');
    setConfirm(null);
    if (selected?.id === confirm.id) setSelected(null);
  };

  const viewProducts = selected ? getProductsByCategory(selected.id) : [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">Gestiona las categorías de productos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          + Nueva Categoría
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><span className="material-symbols-rounded" style={{ fontSize:48, opacity:0.3, fontVariationSettings:"'FILL' 1" }}>sell</span></div>
            <div className="empty-title">Sin categorías</div>
            <div className="empty-text">Crea tu primera categoría de productos</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-3" style={{ marginBottom: selected ? 28 : 0 }}>
          {categories.map(cat => {
            const count = getProductsByCategory(cat.id).length;
            const isSelected = selected?.id === cat.id;
            return (
              <div
                key={cat.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                  background: isSelected ? 'var(--accent-glow)' : 'var(--bg-card)',
                  transition: 'var(--transition)',
                }}
                onClick={() => setSelected(isSelected ? null : cat)}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{
                    width:48, height:48, borderRadius:12,
                    background: isSelected ? 'rgba(201,168,76,0.3)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize:26, color:'var(--accent)', fontVariationSettings:"'FILL' 1" }}>sell</span>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={e => { e.stopPropagation(); setModal({ mode: 'edit', cat }); }}
                      title="Editar"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize:16 }}>edit</span>
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      onClick={e => { e.stopPropagation(); setConfirm(cat); }}
                      title="Eliminar"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize:16 }}>delete</span>
                    </button>
                  </div>
                </div>
                <h3 style={{ fontWeight:700, fontSize:16, color:'var(--text-primary)', marginBottom:4 }}>{cat.name}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.5 }}>{cat.description || '—'}</p>
                <span className="badge badge-gold">{count} producto{count !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Products of selected category */}
      {selected && (
        <div className="card" style={{ marginTop:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h2 style={{ fontWeight:700, fontSize:18 }}>
              Productos en «{selected.name}»
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕ Cerrar</button>
          </div>
          {viewProducts.length === 0 ? (
            <div className="empty-state" style={{ padding:'30px 20px' }}>
              <div className="empty-icon">👟</div>
              <div className="empty-title">Sin productos en esta categoría</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Talla</th>
                    <th>Precio base</th>
                    <th>IVA</th>
                  </tr>
                </thead>
                <tbody>
                  {viewProducts.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight:600 }}>{p.name}</td>
                      <td style={{ color:'var(--text-muted)' }}>{p.size || '—'}</td>
                      <td style={{ color:'var(--accent)', fontWeight:700 }}>
                        {new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(p.price)}
                      </td>
                      <td><span className="badge badge-gold">{p.iva}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <CategoryModal
          category={modal.cat || null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div className="modal" style={{ maxWidth:400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirmar eliminación</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color:'var(--text-secondary)', lineHeight:1.6 }}>
                ¿Estás seguro de eliminar la categoría <strong style={{ color:'var(--text-primary)' }}>«{confirm.name}»</strong>?
                Los productos asociados perderán su categoría.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts.map(t => ({ ...t, message: t.msg }))} />
    </div>
  );
}
