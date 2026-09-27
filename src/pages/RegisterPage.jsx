import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Headphones, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', password: '',
    first_name: '', last_name: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        // field-level errors
        const fieldErrs = {};
        Object.entries(data).forEach(([key, val]) => {
          fieldErrs[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(fieldErrs);
      } else {
        setGlobalError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '', opts = {}) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`reg-${name}`}>{label}</label>
      <input
        id={`reg-${name}`}
        name={name}
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        style={errors[name] ? { borderColor: '#ef4444' } : {}}
        {...opts}
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Headphones size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Support<span style={{ color: 'var(--accent-light)' }}>ly</span>
          </span>
        </div>

        <h1 className="auth-heading">Create account</h1>
        <p className="auth-subheading">Join Supportly to submit and track your tickets</p>

        {globalError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{globalError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="grid-2">
            {field('first_name', 'First name', 'text', 'John')}
            {field('last_name', 'Last name', 'text', 'Doe')}
          </div>
          {field('username', 'Username', 'text', 'johndoe', { autoComplete: 'username', required: true })}
          {field('email', 'Email address', 'email', 'john@example.com', { autoComplete: 'email', required: true })}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: '2.75rem', ...(errors.password ? { borderColor: '#ef4444' } : {}) }}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
                aria-label="Toggle password"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
            <span className="form-hint">Password must be at least 8 characters</span>
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
