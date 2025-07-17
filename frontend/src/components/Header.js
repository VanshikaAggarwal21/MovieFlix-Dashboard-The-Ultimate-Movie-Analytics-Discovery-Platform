import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #ccc', background: '#f8f8f8' }}>
      <div style={{ fontWeight: 'bold', fontSize: 24, letterSpacing: 1 }}>MovieFlix Dashboard</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!user ? (
          <>
            <button onClick={() => navigate('/register')} style={{ padding: '6px 12px' }}>Register</button>
            <button onClick={() => navigate('/login')} style={{ padding: '6px 12px' }}>Login</button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 16 }}>Logged in as <b>{user}</b></span>
            <button onClick={onLogout} style={{ padding: '6px 12px' }}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header; 