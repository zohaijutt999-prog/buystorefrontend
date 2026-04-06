import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Trash2, CheckCircle, X, MapPin, Phone, User } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);

    // Pre-fill data if ANY user (Customer OR Seller) is logged in
    const customerData = JSON.parse(localStorage.getItem('customerData'));
    const sellerData = JSON.parse(localStorage.getItem('sellerData'));
    const activeUser = customerData || sellerData;
    
    if(activeUser) {
      setShippingDetails(prev => ({ ...prev, name: activeUser.fullName, phone: activeUser.phoneNumber || '' }));
    }
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
  };

  const handleOpenCheckout = () => {
    const customerData = JSON.parse(localStorage.getItem('customerData'));
    const sellerData = JSON.parse(localStorage.getItem('sellerData'));
    
    if (!customerData && !sellerData) {
      alert("Please login to place an order!");
      navigate('/login');
      return;
    }
    setShowCheckoutModal(true);
  };

  const submitCartOrder = async () => {
    if(!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address) {
      alert("Please fill all shipping details!");
      return;
    }

    const customerData = JSON.parse(localStorage.getItem('customerData'));
    const sellerData = JSON.parse(localStorage.getItem('sellerData'));
    const activeUser = customerData || sellerData; // Use whichever account is logged in

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: activeUser.id, // Save active user's ID
          items: cartItems,
          shipping_name: shippingDetails.name,
          shipping_phone: shippingDetails.phone,
          shipping_address: shippingDetails.address
        })
      });

      if (response.ok) {
        alert("✅ Order Placed Successfully!");
        localStorage.removeItem('cart'); 
        setShowCheckoutModal(false);
        
        // Redirect to the correct dashboard
        if (sellerData) {
          navigate('/seller-dashboard');
        } else {
          navigate('/dashboard'); 
        }
      } else {
        alert("❌ Failed to place order.");
      }
    } catch (error) {
      alert("Server Error during checkout.");
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7fe', minHeight: '100vh', position: 'relative' }}>
      <Header />
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Complete Your Checkout</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#888' }} onClick={() => setShowCheckoutModal(false)} />
            </div>
            
            <div style={{ backgroundColor: '#f0f4ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{margin: 0, fontWeight: 'bold', color: '#333'}}>Total Payable:</p>
              <h2 style={{margin: 0, color: '#1e88e5'}}>${calculateTotal()}</h2>
            </div>

            <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', color: '#555' }}>Shipping Details</p>

            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <User size={18} color="#888" style={{ position: 'absolute', left: '15px', top: '15px' }} />
              <input type="text" placeholder="Full Name" value={shippingDetails.name} onChange={e => setShippingDetails({...shippingDetails, name: e.target.value})} style={{ width: '100%', padding: '15px 15px 15px 45px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}/>
            </div>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <Phone size={18} color="#888" style={{ position: 'absolute', left: '15px', top: '15px' }} />
              <input type="text" placeholder="Phone Number" value={shippingDetails.phone} onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})} style={{ width: '100%', padding: '15px 15px 15px 45px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}/>
            </div>
            <div style={{ position: 'relative', marginBottom: '25px' }}>
              <MapPin size={18} color="#888" style={{ position: 'absolute', left: '15px', top: '15px' }} />
              <textarea placeholder="Complete Delivery Address" value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} style={{ width: '100%', padding: '15px 15px 15px 45px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }}></textarea>
            </div>
            
            <button onClick={submitCartOrder} style={{ width: '100%', backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20}/> CONFIRM & ORDER
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
        <h1 style={{ color: '#333', marginBottom: '30px' }}>Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '50px', textAlign: 'center', borderRadius: '12px' }}>
            <p style={{ fontSize: '18px', color: '#888' }}>Your cart is empty.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: '20px', backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Continue Shopping</button>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={item.image_url || item.img} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #ddd' }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Qty: {item.quantity} x ${item.price}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <h4 style={{ margin: 0, color: '#1e88e5' }}>${(item.price * item.quantity).toFixed(2)}</h4>
                  <Trash2 size={20} color="#e53935" style={{ cursor: 'pointer' }} onClick={() => removeFromCart(item.id)} />
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: '30px', borderTop: '2px solid #333', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Total:</h2>
              <h2 style={{ margin: 0, color: '#ff624d' }}>${calculateTotal()}</h2>
            </div>
            
            <button onClick={handleOpenCheckout} style={{ width: '100%', marginTop: '30px', backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <CheckCircle /> COMPLETE CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;