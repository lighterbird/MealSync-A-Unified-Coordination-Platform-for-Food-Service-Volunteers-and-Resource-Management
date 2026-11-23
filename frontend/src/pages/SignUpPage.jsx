import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpPage() {
const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Signup failed');

        // Show success and the generated mealsync_id
        setSuccess(data);
    } catch (err) {
        setError(err.message);
    }
    };

    if (success) {
    return (
        <div className="auth-container">
        <div className="auth-box success-box">
            <h2>Registration Successful!</h2>
            <p>Your MealSync ID is: <strong>{success.mealsync_id}</strong></p>
            <p>Please keep this safe.</p>
            <Link to="/signin" className="button primary">Go to Sign In</Link>
        </div>
        </div>
    );
    }

    return (
    <div className="auth-container">
        <div className="auth-box">
        <h2>Create an Account</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
            <label className="form-field">Name
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </label>
            
            <label className="form-field">Email
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </label>
            
            <label className="form-field">Password
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </label>
            
            <button type="submit" className="button primary">Sign Up</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/signin">Sign In</Link></p>
        </div>
    </div>
    );
}
