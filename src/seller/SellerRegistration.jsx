import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header'; 

const SellerRegistration = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', shopName: '', invitationCode: '', password: '', confirmPassword: '', idProofType: 'Id Card' });
  const [idImages, setIdImages] = useState({ front: null, back: null });
  const navigate = useNavigate();

  // Use environment variable for the API base URL, fallback to localhost for local testing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e, side) => setIdImages({ ...idImages, [side]: e.target.files[0] });
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("❌ Passwords do not match!");
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/register/seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // We are sending text data first. File uploading requires advanced backend setup (multer) which we can add later!
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('🎉 Seller Registration Successful! Your account is pending verification.');
        navigate('/seller-login'); // Redirect to seller login
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
        <div style={{ width: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <Link to="/" style={{ color: '#1e88e5', textDecoration: 'none', display: 'flex', alignItems: 'center' }}><ArrowLeft size={26} strokeWidth={2.5} /></Link>
          </div>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '28px', fontWeight: 'normal' }}>Seller Registration</h2>
            <form onSubmit={handleRegister}>
              {['fullName', 'email', 'phoneNumber', 'shopName', 'invitationCode'].map((field, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <input type={field === 'email' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'} name={field} placeholder={`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${field !== 'invitationCode' ? '*' : ''}`} value={formData[field]} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} required={field !== 'invitationCode'} />
                </div>
              ))}
              <div style={{ marginBottom: '15px' }}>
                <input type="password" name="password" placeholder="Password *" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} required />
                <p style={{ fontSize: '10px', color: '#888', marginTop: '4px', marginLeft: '5px' }}>Password must match exactly with the confirm Password field</p>
              </div>
              <div style={{ marginBottom: '25px' }}>
                <input type="password" name="confirmPassword" placeholder="confirm password *" value={formData.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>Select ID Proof</p>
                {['Id Card', 'Passport', 'Driving License', 'Social Security Card'].map(type => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <input type="radio" id={type} name="idProofType" value={type} checked={formData.idProofType === type} onChange={handleChange} style={{ marginRight: '10px', cursor: 'pointer' }} />
                    <label htmlFor={type} style={{ fontSize: '13px', color: '#333', cursor: 'pointer' }}>{type}</label>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '30px' }}>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>ID Proof Images</p>
                <div style={{ border: '1px dashed #ccc', padding: '15px', borderRadius: '4px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                  <p style={{ fontSize: '12px', color: '#555', marginBottom: '10px', marginTop: 0 }}>Front Side of ID *</p>
                  <input type="file" onChange={(e) => handleFileChange(e, 'front')} required style={{ fontSize: '12px' }}/>
                </div>
                <div style={{ border: '1px dashed #ccc', padding: '15px', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                  <p style={{ fontSize: '12px', color: '#555', marginBottom: '10px', marginTop: 0 }}>Back Side of ID *</p>
                  <input type="file" onChange={(e) => handleFileChange(e, 'back')} required style={{ fontSize: '12px' }}/>
                </div>
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#ff624d', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.5px' }}>REGISTER AS SELLER</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
               <Link to="/seller-login" style={{ color: '#4285F4', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>Already have a seller account? Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SellerRegistration;