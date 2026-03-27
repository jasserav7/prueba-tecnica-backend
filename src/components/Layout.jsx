import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV = [
  { to: '/',           icon: 'home',          label: 'Inicio' },
  { to: '/categories', icon: 'sell',           label: 'Categorías' },
  { to: '/products',   icon: 'styler',         label: 'Productos' },
  { to: '/cart',       icon: 'shopping_cart',  label: 'Carrito' },
  { to: '/orders',     icon: 'receipt_long',   label: 'Pedidos' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      {/* ── Desktop Sidebar ── */}
      <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span
              className="material-symbols-rounded"
              style={{ fontSize: 20, color: '#0a0a0f', fontVariationSettings: "'FILL' 1" }}
            >footprint</span>
          </div>
          {!collapsed && (
            <div>
              <div className="brand-name">STRYDE</div>
              <div className="brand-sub">FOOTWEAR</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {NAV.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 22, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}
              >{link.icon}</span>
              {!collapsed && <span className="sidebar-link-label">{link.label}</span>}
              {link.to === '/cart' && totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {!collapsed && user && (
            <div className="sidebar-user">
              <div className="sidebar-user-role-label">Sesión iniciada</div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          )}
          <button
            className="btn btn-danger w-full btn-sm"
            onClick={handleLogout}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>logout</span>
            {!collapsed && 'Cerrar Sesión'}
          </button>
          <button
            className="btn btn-ghost w-full btn-sm mt-2"
            onClick={() => setCollapsed(c => !c)}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
            {!collapsed && 'Ocultar'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        {children}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        {NAV.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <div className="bottom-nav-icon-wrap">
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}
              >{link.icon}</span>
              {link.to === '/cart' && totalItems > 0 && (
                <span className="bottom-nav-badge">{totalItems}</span>
              )}
            </div>
            <span className="bottom-nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
