import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header'; 

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Use environment variable for the API base URL, fallback to localhost for local testing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/login/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save login state AND dynamic user data to browser memory
        localStorage.setItem('isCustomerLoggedIn', 'true');
        localStorage.setItem('customerData', JSON.stringify(data.user)); 
        
        // Redirect to home page
        window.location.href = '/'; 
      } else {
        alert(`❌ Login Failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ Failed to connect to server. Is your backend running?');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 20px', backgroundColor: '#f9f9f9', width: '100%', flex: 1, fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
        <div style={{ width: '450px' }}> 
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <Link to="/" style={{ color: '#1e88e5', textDecoration: 'none', display: 'flex', alignItems: 'center' }}><ArrowLeft size={26} strokeWidth={2.5} /></Link>
          </div>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '28px', fontWeight: 'normal' }}>Customer Login</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '11px', color: '#666' }}>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }} required />
              </div>
              <div style={{ marginBottom: '25px', position: 'relative' }}>
                <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '11px', color: '#666' }}>Password *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }} required />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#ff624d', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.5px' }}>LOGIN</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '30px', position: 'relative' }}>
              <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
              <span style={{ backgroundColor: 'white', padding: '0 10px', position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: '#888' }}>New to E-Commerce Store?</span>
              <Link to="/register"><button style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#4285F4', border: '1px solid #4285F4', borderRadius: '4px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold', fontSize: '13px' }}>CREATE NEW ACCOUNT</button></Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: '25px', position: 'relative' }}>
               <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
               <span style={{ backgroundColor: 'white', padding: '0 10px', position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: '#888' }}>Are you a seller?</span>
               <Link to="/seller-login" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', display: 'block', marginTop: '20px', letterSpacing: '0.5px' }}>SELLER LOGIN</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerLogin;