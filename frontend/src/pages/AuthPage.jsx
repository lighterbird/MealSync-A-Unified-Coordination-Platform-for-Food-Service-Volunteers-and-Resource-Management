// Demo sign-in and sign-up screens; credentials are never sent anywhere.
// DEMO DATA BOUNDARY: reads/writes use AppContext's in-memory seeded records. Replace these calls with the agreed Flask API; see docs/FRONTEND_TASKS_BY_PERSON.md.
import { useState } from 'react';
import Brand from '../components/Brand';
import Button from '../components/Button';
import { useMealSync } from '../context/AppContext';
import { roleInfo } from '../data/demoData';

export default function AuthPage() {
  const { authMode, setAuthMode, setView, signIn, showToast } = useMealSync();
  const isSignup = authMode === 'signup';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('aarav@example.test');
  const [password, setPassword] = useState('mealsync-demo');
  const [city, setCity] = useState('Mumbai');
  const [roles, setRoles] = useState(['volunteer']);
  const submit = (event) => {
    event.preventDefault();
    if (isSignup && roles.length < 1) { showToast('Choose at least one role', 'One MealSync account must have at least one active role.'); return; }
    signIn({ fullName: isSignup ? fullName : undefined, email, roles: isSignup ? roles : undefined, city: isSignup ? city : undefined });
  };
  const toggleRole = (role) => setRoles((current) => current.includes(role) ? current.filter((value) => value !== role) : [...current, role]);
  return <main className="auth-page"><aside className="auth-art"><Brand onClick={() => setView('landing')}/><div className="auth-art-copy"><span className="eyebrow" style={{ color: 'var(--lime)' }}>{isSignup ? 'Find your way to contribute' : 'Welcome to your workspace'}</span><h1>{isSignup ? 'Many hands. One shared mission.' : 'Good to have you back.'}</h1><p>{isSignup ? 'Choose the role or roles that fit you today. You can update them later from your profile.' : 'Pick up where your community left off — your events, people and food-service plans, all connected.'}</p><div className="auth-bullet"><b>✓</b><span>One account can serve multiple roles.</span></div><div className="auth-bullet"><b>✓</b><span>Keep volunteer work and kitchen needs in sync.</span></div><div className="auth-bullet"><b>✓</b><span>Demo interactions use sample data only.</span></div></div><span className="small" style={{ color: '#8eae9a', position: 'relative', zIndex: 1 }}>MealSync · Community food, better coordinated</span></aside>
    <section className="auth-main"><div className="auth-card"><Button variant="quiet" size="sm" onClick={() => setView('landing')}>← Back to home</Button><div style={{ marginTop: 21 }}><span className="eyebrow">{isSignup ? 'Create your account' : 'Sign in'}</span><h2>{isSignup ? 'Join MealSync' : 'Welcome back'}</h2><p>{isSignup ? 'Start with the roles you want to play.' : 'Use the demo form to enter the interactive workspace.'}</p></div>
      <form onSubmit={submit}>{isSignup && <div className="field"><label htmlFor="signup-name">Full name</label><input id="signup-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="e.g. Aanya Sharma" autoComplete="name"/></div>}<div className="field"><label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email"/></div><div className="field"><label htmlFor="signup-password">Password</label><input id="signup-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={isSignup ? 'new-password' : 'current-password'}/></div>
      {isSignup ? <><div className="field"><label>Which roles would you like to serve? <span className="muted">(choose 1–4)</span></label><div className="check-grid">{Object.entries(roleInfo).map(([key, role]) => <label className="check-option" key={key}><input type="checkbox" checked={roles.includes(key)} onChange={() => toggleRole(key)}/><span><strong>{role.icon} {role.label}</strong><span>{role.desc}</span></span></label>)}</div></div><div className="field"><label htmlFor="signup-city">City / primary service area</label><input id="signup-city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Mumbai"/></div></> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}><label style={{ display: 'flex', alignItems: 'center', gap: 7 }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--forest)' }}/> Keep me signed in</label><button type="button" className="linkish" style={{ border: 0, background: 'none' }} onClick={() => showToast('Password reset is not connected', 'A live app needs a server-side reset flow and verified email.')}>Forgot password?</button></div>}
      <Button variant="primary" className="btn-block" type="submit">{isSignup ? 'Create demo account ↗' : 'Sign in to MealSync ↗'}</Button></form><div className="demo-note">Demo only: this page does not create a server account or securely authenticate credentials. Use a throwaway value, not a real password.</div><p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to MealSync?'} <button type="button" className="linkish" style={{ border: 0, background: 'none' }} onClick={() => { setAuthMode(isSignup ? 'login' : 'signup'); setPassword(isSignup ? 'mealsync-demo' : ''); }}>{isSignup ? 'Sign in' : 'Create an account'}</button></p></div></section></main>;
}
