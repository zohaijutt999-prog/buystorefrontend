import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // When the Header loads, check if the customer is logged in
  useEffect(() => {
    const customerStatus = localStorage.getItem('isCustomerLoggedIn');
    if (customerStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    // Clear the login status and force a reload to the Home Page
    localStorage.removeItem('isCustomerLoggedIn');
    window.location.href = '/'; 
  };

  return (
    <>
      <style>
        {`
          .header-container { background-color: #ff624d; padding: 15px 50px; display: flex; justify-content: space-between; align-items: center; color: white; width: 100%; box-sizing: border-box; flex-wrap: wrap; gap: 15px; }
          .logo-container { order: 1; }
          .search-container { display: flex; width: 50%; position: relative; order: 2; }
          .auth-buttons { display: flex; gap: 20px; order: 3; align-items: center; }

          @media (max-width: 768px) {
            .header-container { padding: 15px 20px; }
            .search-container { width: 100%; order: 3; }
            .auth-buttons { order: 2; gap: 15px; }
          }
        `}
      </style>

      <header className="header-container">
        
        {/* Logo */}
        <Link to="/" className="logo-container" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold' }}>
          <ShoppingCart /> Buystore
        </Link>
        
        {/* Search Bar */}
        <div className="search-container">
          <input type="text" placeholder="Search products by name..." style={{ width: '100%', padding: '12px 40px 12px 20px', borderRadius: '25px', border: 'none', outline: 'none', color: '#333' }} />
          <Search size={18} color="#ff624d" style={{ position: 'absolute', right: '15px', top: '12px' }} />
        </div>

        {/* Dynamic Right Side */}
        <div className="auth-buttons">
          {isLoggedIn ? (
            
            // --- LOGGED IN STATE (Matches your screenshot) ---
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>MY DASHBOARD</Link>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={20} style={{ cursor: 'pointer' }} />
              </Link>
              <div onClick={handleLogout} style={{ cursor: 'pointer' }}>LOGOUT</div>
            </div>

          ) : (
            
            // --- LOGGED OUT STATE ---
            <>
              <Link to="/login"><button style={{ padding: '8px 25px', backgroundColor: 'white', color: '#ff624d', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button></Link>
              <Link to="/register"><button style={{ padding: '8px 25px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Register</button></Link>
            </>
            
          )}
        </div>

      </header>
    </>
  );
};

export default Header;