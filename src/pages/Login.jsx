import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Left panel – branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0d0d18 0%, #161625 50%, #1a1208 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position:'absolute', width:400, height:400, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
          top:-100, right:-100,
        }}/>
        <div style={{
          position:'absolute', width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          bottom:-50, left:-50,
        }}/>

        <div style={{ textAlign:'center', position:'relative', animation:'slideIn 0.6s ease' }}>
          <div style={{
            width:90, height:90, borderRadius:24,
            background:'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:48, margin:'0 auto 24px',
            boxShadow:'0 12px 40px rgba(201,168,76,0.3)',
          }}>👟</div>
          <h1 style={{
            fontSize:48, fontWeight:900, color:'var(--text-primary)',
            letterSpacing:'-2px', margin:'0 0 8px',
          }}>STRYDE</h1>
          <p style={{ fontSize:15, color:'var(--accent)', fontWeight:600, letterSpacing:'6px', textTransform:'uppercase' }}>
            FOOTWEAR
          </p>
          <p style={{ marginTop:20, color:'var(--text-secondary)', fontSize:16, maxWidth:320, lineHeight:1.6 }}>
            La tienda de calzado premium donde cada paso cuenta.
          </p>

          {/* Decorative shoe line */}
          <div style={{ marginTop:48, display:'flex', gap:16, justifyContent:'center', opacity:0.4 }}>
            {['👟','👠','🥾','👞','🩴'].map((e, i) => (
              <span key={i} style={{ fontSize:28 }}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{
        width: 460,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:48,
        background:'var(--bg-secondary)',
        borderLeft:'1px solid var(--border)',
      }}>
        <div style={{ width:'100%', maxWidth:360, animation:'slideUp 0.5s ease' }}>
          <h2 style={{ fontSize:28, fontWeight:800, color:'var(--text-primary)', marginBottom:6 }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:36 }}>
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div style={{ position:'relative' }}>
                <input
                  className="form-control"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{ paddingRight:42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{
                    position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer',
                    color:'var(--text-muted)', fontSize:16,
                  }}
                >{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {error && (
              <div style={{
                background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.3)',
                borderRadius:'var(--radius-md)', padding:'12px 16px',
                color:'var(--error)', fontSize:13, fontWeight:600,
                display:'flex', alignItems:'center', gap:8,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className="btn btn-primary btn-lg w-full"
              type="submit"
              disabled={loading}
              style={{ justifyContent:'center', marginTop:4 }}
            >
              {loading ? (
                <span style={{ display:'inline-block', animation:'spin 0.8s linear infinite' }}>⟳</span>
              ) : '→ Ingresar'}
            </button>
          </form>

          <div style={{ marginTop:32, padding:20, background:'var(--bg-primary)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>
              Credenciales de prueba
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'var(--text-muted)' }}>Usuario</span>
                <code style={{ color:'var(--accent)', fontWeight:700 }}>admin</code>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'var(--text-muted)' }}>Contraseña</span>
                <code style={{ color:'var(--accent)', fontWeight:700 }}>admin123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
