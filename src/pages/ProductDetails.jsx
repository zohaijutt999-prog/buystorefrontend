import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ShoppingCart, CreditCard, X, MapPin, Phone, User } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({ name: '', phone: '', address: '' });
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/single/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error(err));
      
    // Pre-fill data if ANY user (Customer OR Seller) is logged in
    const customerData = JSON.parse(localStorage.getItem('customerData'));
    const sellerData = JSON.parse(localStorage.getItem('sellerData'));
    const activeUser = customerData || sellerData;

    if(activeUser) {
      setShippingDetails(prev => ({ ...prev, name: activeUser.fullName, phone: activeUser.phoneNumber || '' }));
    }
  }, [id, API_BASE_URL]);

  const addToCart = () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('✅ Product added to Cart!');
    navigate('/cart');
  };

  const handleBuyNow = () => {
    const customerData = JSON.parse(localStorage.getItem('customerData'));
    const sellerData = JSON.parse(localStorage.getItem('sellerData'));
    
    if (!customerData && !sellerData) {
      alert("Please login to place an order!");
      navigate('/login');
      return;
    }
    setShowCheckoutModal(true);
  };

  const submitDirectOrder = async () => {
    if(!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address) {
      alert("Please fill all shipping details!");
      return;
    }

    const customerData = JSON.parse(localStorage.getItem('customerData'));
    const sellerData = JSON.parse(localStorage.getItem('sellerData'));
    const activeUser = customerData || sellerData;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: activeUser.id,
          items: [{ ...product, quantity: 1 }],
          shipping_name: shippingDetails.name,
          shipping_phone: shippingDetails.phone,
          shipping_address: shippingDetails.address
        })
      });

      if (response.ok) {
        alert("✅ Order Placed Successfully!");
        setShowCheckoutModal(false);
        
        // Redirect to correct dashboard
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

  if (!product) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading Product Details...</div>;

  return (
    <div style={{ backgroundColor: '#f4f7fe', minHeight: '100vh', position: 'relative' }}>
      <Header />
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Complete Your Order</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#888' }} onClick={() => setShowCheckoutModal(false)} />
            </div>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={product.image_url} alt="img" style={{width: '50px', height: '50px', objectFit: 'contain'}} />
              <div>
                <p style={{margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold'}}>{product.title}</p>
                <p style={{margin: 0, color: '#ff624d', fontWeight: 'bold'}}>${product.price}</p>
              </div>
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
            
            <button onClick={submitDirectOrder} style={{ width: '100%', backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={20}/> PLACE ORDER NOW
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
          <img src={product.image_url} alt={product.title} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
        </div>
        
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ backgroundColor: '#ff624d', color: 'white', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', width: 'fit-content', marginBottom: '15px' }}>{product.category}</span>
          <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>{product.title}</h1>
          <p style={{ color: '#888', margin: '0 0 20px 0' }}>Sold by: <b>{product.shopName}</b></p>
          <h2 style={{ color: '#1e88e5', fontSize: '32px', margin: '0 0 20px 0' }}>${product.price}</h2>
          <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '30px' }}>{product.description || "High quality product from Weyfeir Store."}</p>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={addToCart} style={{ flex: 1, backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={18}/> ADD TO CART
            </button>
            <button onClick={handleBuyNow} style={{ flex: 1, backgroundColor: '#ff624d', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={18}/> BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;