import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import heroImage from '../assets/hero.png'; 

const brands = [
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg" },
  { name: "Xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg" }
];

const categories = [
  { name: 'Women Clothing', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&q=80' },
  { name: 'Men Clothing', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=150&q=80' },
  { name: 'Computers & Tech', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80' },
  { name: 'Kids & Toys', img: 'https://images.unsplash.com/photo-1596461404969-9ce20c714228?auto=format&fit=crop&w=150&q=80' }, 
  { name: 'Sports & Outdoor', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=150&q=80' },
  { name: 'Health & Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=150&q=80' },
  { name: 'Jewelry & Watches', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80' },
  { name: 'Automobiles', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=150&q=80' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [liveProducts, setLiveProducts] = useState([]);

  // Use environment variable for the API base URL, fallback to localhost for local testing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/all`)
      .then(res => res.json())
      .then(data => setLiveProducts(data))
      .catch(err => console.error(err));
  }, [API_BASE_URL]);

  const handleStartChat = (product) => {
    const isLogged = localStorage.getItem('isCustomerLoggedIn');
    if (!isLogged) {
      alert('Please Login as a Customer to chat with sellers!');
      navigate('/login');
      return;
    }
    
    // Pass the entire product context to local storage
    localStorage.setItem('pendingChatSeller', JSON.stringify({ 
      id: product.seller_id, 
      shopName: product.shopName,
      productContext: {
        title: product.title,
        price: product.price,
        image_url: product.image_url || product.img
      }
    }));
    navigate('/dashboard');
  };

  const ProductCard = ({ product }) => (
    <div style={{ minWidth: '220px', width: '220px', border: '1px solid #eaeaea', borderRadius: '8px', padding: '15px', backgroundColor: 'white', transition: 'box-shadow 0.3s', display: 'flex', flexDirection: 'column' }} className="product-card">
      <div style={{ height: '180px', backgroundColor: '#f4f5f8', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
        <img src={product.image_url || product.img} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
      </div>
      <h4 style={{ color: '#c62828', fontSize: '18px', margin: '0 0 5px 0' }}>${product.price}</h4>
      <p style={{ fontSize: '11px', color: '#888', margin: '0 0 10px 0' }}>Sold by: <b>{product.shopName || 'Store'}</b></p>
      <div style={{ color: '#fbbf24', fontSize: '12px', marginBottom: '8px' }}>★★★★★</div>
      <p style={{ fontSize: '13px', color: '#444', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.title}</p>
      
      <div style={{ display: 'flex', gap: '5px', marginTop: '15px' }}>
        <button style={{ flex: 1, backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🛒 Cart</button>
        {product.seller_id && (
          <button onClick={() => handleStartChat(product)} style={{ flex: 1, backgroundColor: '#673ab7', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>💬 Chat</button>
        )}
      </div>
    </div>
  );

  const ProductSlider = ({ title, tag, products }) => (
    <div style={{ marginBottom: '40px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #f5f5f5', paddingBottom: '10px' }}>
        <h2 style={{ color: '#c62828', fontSize: '22px', margin: 0 }}>{title}</h2>
        {tag && <span style={{ backgroundColor: '#ff3d00', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{tag}</span>}
      </div>
      {products.length === 0 ? (
         <p style={{ color: '#888' }}>Loading products from database...</p>
      ) : (
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', scrollSnapType: 'x mandatory' }}>
          {products.map((item, index) => (
            <div key={index} style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ fontFamily: 'sans-serif', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .category-item { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .category-item:hover { transform: translateY(-5px) scale(1.05); }
          .category-img-wrapper { transition: border-color 0.3s ease; }
          .category-item:hover .category-img-wrapper { border-color: #ff624d !important; }
          .product-card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        `}
      </style>
      <Header />
      <main style={{ width: '100%', padding: '20px 50px', boxSizing: 'border-box' }}>
        <section style={{ display: 'flex', gap: '20px', marginBottom: '40px', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flex: 3, minWidth: '300px', backgroundColor: '#222', color: 'white', padding: '80px 40px', borderRadius: '8px', backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>ONE DAY SPECIAL:</h1>
            <h2 style={{ fontSize: '42px', margin: '0 0 30px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>UP TO 50% OFF</h2>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '4px', fontSize: '14px' }}>25% off with<br/>min. spend $150</div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '4px', fontSize: '14px' }}>Buy 3,<br/>get 15% off</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '250px', backgroundColor: '#fff5f4', padding: '20px', borderRadius: '8px', border: '1px solid #fee2e2', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Todays Deal</h3>
            <span style={{ backgroundColor: 'red', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Hot</span>
            <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '15px', border: '1px solid #fecaca', borderRadius: '8px' }}>
              <div style={{ backgroundColor: '#f4f5f8', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                <img src={liveProducts[0]?.image_url} alt="Deal" style={{ height: '120px', width: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
              </div>
              <h4 style={{ color: '#c62828', fontSize: '24px', margin: '10px 0 0 0' }}>${liveProducts[0]?.price}</h4>
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', justifyContent: 'center', gap: '30px', padding: '40px 0', flexWrap: 'wrap', width: '100%', backgroundColor: '#fff', borderRadius: '12px', marginBottom: '40px' }}>
          {categories.map((category, index) => (
            <div key={index} className="category-item" style={{ textAlign: 'center', width: '120px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="category-img-wrapper" style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f0f0f0', padding: '3px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <img src={category.img} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <p style={{ fontSize: '14px', marginTop: '15px', color: '#2c3e50', fontWeight: '600', lineHeight: '1.2' }}>{category.name}</p>
            </div>
          ))}
        </section>

        <ProductSlider title="All Live Store Products" tag="New" products={liveProducts} />

        <div style={{ marginBottom: '40px', width: '100%' }}>
          <h2 style={{ color: '#004aad', fontSize: '22px', borderBottom: '2px solid #f5f5f5', paddingBottom: '10px', marginBottom: '20px' }}>Featured Brands</h2>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {brands.map((brand, index) => (
              <div key={index} style={{ minWidth: '180px', height: '100px', border: '1px solid #eaeaea', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', cursor: 'pointer' }}>
                <img src={brand.logo} alt={brand.name} style={{ maxHeight: '40px', maxWidth: '100px', objectFit: 'contain', marginBottom: '10px' }} />
                <span style={{ fontSize: '13px', color: '#555' }}>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;