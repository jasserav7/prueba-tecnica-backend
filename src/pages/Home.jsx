import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);

function ProductCard({ product, category, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const priceWithIva = product.price * (1 + product.iva / 100);

  return (
    <div style={{
      background:'var(--bg-card)',
      border:'1px solid var(--border)',
      borderRadius:'var(--radius-lg)',
      overflow:'hidden',
      transition:'var(--transition-slow)',
      cursor:'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = 'var(--border-light)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.boxShadow = '';
    }}
    >
      {/* Image */}
      <div style={{
        height: 200,
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--bg-secondary)',
      }}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}
          alt={product.name}
          style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = ''}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'; }}
        />
        {category && (
          <span className="badge badge-gold" style={{
            position:'absolute', top:12, left:12,
          }}>{category.name}</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding:'16px 18px' }}>
        <h3 style={{ fontWeight:700, fontSize:16, color:'var(--text-primary)', marginBottom:6 }}>
          {product.name}
        </h3>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:10, lineHeight:1.5 }}>
          {product.description}
        </p>
        <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
          {product.size && (
            <span className="chip" style={{ cursor:'default' }}>
              <span className="material-symbols-rounded" style={{ fontSize:14, fontVariationSettings:"'FILL' 1" }}>straighten</span>
              Talla: {product.size}
            </span>
          )}
          {product.weight && (
            <span className="chip" style={{ cursor:'default' }}>
              <span className="material-symbols-rounded" style={{ fontSize:14, fontVariationSettings:"'FILL' 1" }}>monitor_weight</span>
              {product.weight}
            </span>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>
              Base {fmt(product.price)} + IVA {product.iva}%
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--accent)' }}>
              {fmt(priceWithIva)}
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm add-cart-btn"
            onClick={handleAdd}
            style={{ background: added ? 'var(--success)' : undefined, color: added ? '#fff' : undefined }}
          >
            {added ? (
              <>
                <span className="material-symbols-rounded" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="cart-btn-label">Agregado</span>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 800, lineHeight: 1 }}>+</span>
                <span className="material-symbols-rounded cart-icon-only" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                <span className="cart-btn-label">Carrito</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { products, categories, getCategoryById } = useStore();
  const { addItem } = useCart();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  };

  const handleAddToCart = (product) => {
    addItem(product);
    addToast(`"${product.name}" agregado al carrito 🛒`);
  };

  const filtered = useMemo(() => {
    return products
      .filter(p => filterCat === 'all' || p.categoryId === Number(filterCat))
      .filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
  }, [products, filterCat, search]);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section" style={{
        background: 'linear-gradient(135deg, #0d0d18 0%, #131320 60%, #1a1208 100%)',
        padding: '56px 40px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          position:'absolute', width:500, height:500, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          top:-100, right:-100, pointerEvents:'none',
        }}/>
        <div style={{ maxWidth:600, position:'relative' }}>
          <div style={{ fontSize:13, color:'var(--accent)', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', marginBottom:16 }}>
            Nueva Colección 2026
          </div>
          <h1 style={{ fontSize:48, fontWeight:900, color:'var(--text-primary)', letterSpacing:'-2px', lineHeight:1.1, marginBottom:16 }}>
            Calzado que<br />
            <span style={{ background:'linear-gradient(135deg, var(--accent), var(--accent-light))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              define tu estilo
            </span>
          </h1>
          <p style={{ fontSize:16, color:'var(--text-secondary)', lineHeight:1.7, maxWidth:480 }}>
            Descubre nuestra selección premium de calzado para cada ocasión. Desde lo deportivo hasta lo formal, tenemos el par perfecto para ti.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ padding:'24px 40px', borderBottom:'1px solid var(--border)', display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', maxWidth:280 }}>
          <span
            className="material-symbols-rounded"
            style={{
              position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
              fontSize:18, color:'var(--text-muted)', pointerEvents:'none',
            }}
          >search</span>
          <input
            className="form-control"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft:36 }}
          />
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button
            className={`chip ${filterCat === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCat('all')}
          >Todos</button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`chip ${filterCat === c.id ? 'active' : ''}`}
              onClick={() => setFilterCat(c.id)}
            >{c.name}</button>
          ))}
        </div>
        <div style={{ marginLeft:'auto', color:'var(--text-muted)', fontSize:13 }}>
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid */}
      <div className="product-grid-wrap" style={{ padding:'32px 40px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👟</div>
            <div className="empty-title">No se encontraron productos</div>
            <div className="empty-text">Intenta con otros filtros o palabras clave</div>
          </div>
        ) : (
          <div className="grid grid-4">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                category={getCategoryById(p.categoryId)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
