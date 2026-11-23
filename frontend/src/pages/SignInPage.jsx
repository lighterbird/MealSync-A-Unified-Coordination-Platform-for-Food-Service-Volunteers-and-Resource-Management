import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignInPage({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      onLogin(data); // Save user state in App.jsx
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="form-field">Email
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </label>
          
          <label className="form-field">Password
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </label>
          
          <button type="submit" className="button primary">Sign In</button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}
