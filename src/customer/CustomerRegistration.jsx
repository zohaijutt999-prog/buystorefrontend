import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header'; 

const CustomerRegistration = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
  const navigate = useNavigate();

  // Use environment variable for the API base URL, fallback to localhost for local testing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => { 
    e.preventDefault(); 
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/register/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('🎉 Customer Registration Successful! You can now log in.');
        navigate('/login'); 
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('❌ Failed to connect to the server. Is your backend running?');
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
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '28px', fontWeight: 'normal' }}>Customer Registration</h2>
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '20px' }}><input type="text" name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} required /></div>
              <div style={{ marginBottom: '20px' }}><input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} required /></div>
              <div style={{ marginBottom: '20px' }}><input type="tel" name="phoneNumber" placeholder="Phone Number *" value={formData.phoneNumber} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} required /></div>
              <div style={{ marginBottom: '25px' }}><input type="password" name="password" placeholder="Password *" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} required /></div>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#ff624d', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.5px' }}>REGISTER</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
               <Link to="/login" style={{ color: '#4285F4', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>ALREADY HAVE AN ACCOUNT? LOGIN</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerRegistration;