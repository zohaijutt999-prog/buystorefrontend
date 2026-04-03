import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Store } from 'lucide-react';
import logoImage from '../assets/1.png'; 

const Header = () => {
  const [isCustomer, setIsCustomer] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  // Check both Customer and Seller login status when Header loads
  useEffect(() => {
    const customerStatus = localStorage.getItem('isCustomerLoggedIn');
    const sellerStatus = localStorage.getItem('isSellerLoggedIn');
    
    if (customerStatus === 'true') {
      setIsCustomer(true);
    }
    if (sellerStatus === 'true') {
      setIsSeller(true);
    }
  }, []);

  const handleLogout = () => {
    // Clear both login sessions completely
    localStorage.removeItem('isCustomerLoggedIn');
    localStorage.removeItem('customerData');
    localStorage.removeItem('isSellerLoggedIn');
    localStorage.removeItem('sellerData');
    window.location.href = '/'; 
  };

  return (
    <>
      <style>
        {`
          .header-container { 
            background-color: #ff624d; 
            padding: 15px 5%; /* Percent base padding for better responsiveness */
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            color: white; 
            width: 100%; 
            box-sizing: border-box; 
            flex-wrap: wrap; 
            gap: 15px; 
          }
          .logo-container { 
            order: 1; 
            display: flex; 
            align-items: center; 
            max-width: 200px; 
            text-decoration: none;
          }
          .logo-img {
            width: 100%; 
            height: auto; 
            max-height: 60px; 
            object-fit: contain;
          }
          .search-container { 
            display: flex; 
            flex: 1; /* Takes available space */
            min-width: 250px;
            position: relative; 
            order: 2; 
            margin: 0 20px;
          }
          .search-input {
            width: 100%; 
            padding: 12px 40px 12px 20px; 
            border-radius: 25px; 
            border: none; 
            outline: none; 
            color: #333;
            font-size: 14px;
          }
          .search-icon {
            position: absolute; 
            right: 15px; 
            top: 50%;
            transform: translateY(-50%);
          }
          .auth-buttons { 
            display: flex; 
            gap: 20px; 
            order: 3; 
            align-items: center; 
          }
          .auth-nav {
            display: flex; 
            gap: 25px; 
            align-items: center; 
            font-size: 13px; 
            font-weight: bold; 
            text-transform: uppercase;
          }
          .nav-link {
            color: white; 
            text-decoration: none; 
            display: flex; 
            align-items: center; 
            gap: 5px;
          }
          .logout-btn {
            cursor: pointer;
          }
          .btn {
            padding: 8px 25px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          .btn-login {
            background-color: white; 
            color: #ff624d; 
            border: 1px solid white; 
          }
          .btn-register {
            background-color: transparent; 
            color: white; 
            border: 1px solid white; 
          }

          /* --- TABLET VIEW --- */
          @media (max-width: 900px) {
            .search-container { 
              order: 3; 
              flex-basis: 100%; /* Force search bar to next line */
              margin: 5px 0 0 0;
            }
            .auth-buttons { 
              order: 2; 
            }
          }

          /* --- MOBILE VIEW --- */
          @media (max-width: 480px) {
            .header-container { 
              padding: 12px 15px; 
            }
            .logo-container {
              max-width: 120px; /* Shrink logo */
            }
            .logo-img {
              max-height: 40px;
            }
            .auth-buttons { 
              gap: 10px; 
            }
            .btn {
              padding: 6px 15px;
              font-size: 12px;
            }
            .auth-nav {
              gap: 15px;
              font-size: 11px; /* Shrink text slightly to prevent breaking */
            }
          }
        `}
      </style>

      <header className="header-container">
        
        {/* Custom Logo */}
        <Link to="/" className="logo-container">
          <img 
            src={logoImage} 
            alt="Weyfeir Logo" 
            className="logo-img"
          />
        </Link>
        
        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="search-input"
          />
          <Search size={18} color="#ff624d" className="search-icon" />
        </div>

        {/* Dynamic Right Side Options */}
        <div className="auth-buttons">
          
          {isCustomer ? (
            // --- IF CUSTOMER IS LOGGED IN ---
            <div className="auth-nav">
              <Link to="/dashboard" className="nav-link">MY DASHBOARD</Link>
              <Link to="/cart" className="nav-link">
                <ShoppingCart size={20} style={{ cursor: 'pointer' }} />
              </Link>
              <div onClick={handleLogout} className="logout-btn">LOGOUT</div>
            </div>

          ) : isSeller ? (
            // --- IF SELLER IS LOGGED IN ---
            <div className="auth-nav">
              <Link to="/seller-dashboard" className="nav-link">
                <Store size={18} /> <span className="seller-text">SELLER DASHBOARD</span>
              </Link>
              <div onClick={handleLogout} className="logout-btn">LOGOUT</div>
            </div>

          ) : (
            // --- IF NO ONE IS LOGGED IN (GUEST) ---
            <>
              <Link to="/login">
                <button className="btn btn-login">Login</button>
              </Link>
              <Link to="/register">
                <button className="btn btn-register">Register</button>
              </Link>
            </>
          )}
          
        </div>
      </header>
    </>
  );
};

export default Header;