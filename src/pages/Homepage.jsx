import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import heroImage from '../assets/hero.png'; 

// --- BRANDS ---
const brands = [
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg" },
  { name: "Xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg" }
];

// --- EXACT CATEGORIES FROM WEYFEIR.VERCEL.APP (With updated Kids image) ---
const categories = [
  { name: 'Women Clothing & Fashion', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&q=80' },
  { name: 'Men Clothing & Fashion', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=150&q=80' },
  { name: 'Computers & Cameras', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80' },
  { name: 'Kids & toy', img: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=150&q=80' }, 
  { name: 'Sports & outdoor', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=150&q=80' },
  { name: 'Automobile & Motorcycle', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=150&q=80' },
  { name: 'Jewelry & Watches', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [liveProducts, setLiveProducts] = useState([]);
  
  // Categorized Live Products
  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);

  // Use environment variable for the API base URL, fallback to localhost for local testing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Helper function to shuffle array randomly
  const shuffleArray = (array) => {
    return array.slice().sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/all`)
      .then(res => res.json())
      .then(data => {
        setLiveProducts(data);
        
        // Create 3 different shuffled arrays from the live database
        setNewProducts(shuffleArray(data).slice(0, 10)); // Top 10 random for New
        setFeaturedProducts(shuffleArray(data).slice(0, 10)); // Top 10 random for Featured
        setBestSellingProducts(shuffleArray(data).slice(0, 10)); // Top 10 random for Best Selling
      })
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

  // --- ADD TO CART LOGIC ---
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Prevents the card click event (Product Details) from firing
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('✅ Product added to Cart!');
  };

  const ProductCard = ({ product }) => (
    <div 
      onClick={() => navigate(`/product/${product.id}`)} 
      style={{ minWidth: '220px', width: '220px', border: '1px solid #eaeaea', borderRadius: '8px', padding: '15px', backgroundColor: 'white', transition: 'box-shadow 0.3s', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} 
      className="product-card"
    >
      <div style={{ height: '180px', backgroundColor: '#f4f5f8', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
        <img src={product.image_url || product.img} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
      </div>
      <h4 style={{ color: '#c62828', fontSize: '18px', margin: '0 0 5px 0' }}>${product.price}</h4>
      <p style={{ fontSize: '11px', color: '#888', margin: '0 0 10px 0' }}>Sold by: <b>{product.shopName || 'Weyfeir Store'}</b></p>
      <div style={{ color: '#fbbf24', fontSize: '12px', marginBottom: '8px' }}>★★★★★</div>
      <p style={{ fontSize: '13px', color: '#444', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.title}</p>
      
      <div style={{ display: 'flex', gap: '5px', marginTop: '15px' }}>
        <button onClick={(e) => handleAddToCart(e, product)} style={{ flex: 1, backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🛒 Cart</button>
        {/* Always show chat since these are live products now */}
        <button onClick={(e) => { e.stopPropagation(); handleStartChat(product); }} style={{ flex: 1, backgroundColor: '#673ab7', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>💬 Chat</button>
      </div>
    </div>
  );

  const ProductSlider = ({ title, products, highlight }) => (
    <div style={{ marginBottom: '40px', width: '100%' }}>
      <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{ color: highlight ? '#c62828' : '#333', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>{title}</h2>
      </div>
      {products.length === 0 ? (
         <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No products available yet.</p>
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
          .banner-card { transition: transform 0.3s ease; cursor: pointer; }
          .banner-card:hover { transform: scale(1.02); }
        `}
      </style>
      <Header />
      <main style={{ width: '100%', padding: '20px 50px', boxSizing: 'border-box', backgroundColor: '#fff' }}>
        
        {/* HERO SECTION */}
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
                {liveProducts[0] ? (
                   <img src={liveProducts[0].image_url} alt="Deal" style={{ height: '120px', width: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                ) : (
                   <div style={{ height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>No Deals</div>
                )}
              </div>
              <h4 style={{ color: '#c62828', fontSize: '24px', margin: '10px 0 0 0' }}>${liveProducts[0]?.price || '0.00'}</h4>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section style={{ display: 'flex', justifyContent: 'center', gap: '30px', padding: '10px 0 40px 0', flexWrap: 'wrap', width: '100%', backgroundColor: '#fff', borderRadius: '12px', marginBottom: '20px' }}>
          {categories.map((category, index) => (
            <div key={index} className="category-item" style={{ textAlign: 'center', width: '120px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="category-img-wrapper" style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f0f0f0', padding: '3px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <img src={category.img} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <p style={{ fontSize: '14px', marginTop: '15px', color: '#2c3e50', fontWeight: '600', lineHeight: '1.2' }}>{category.name}</p>
            </div>
          ))}
        </section>

        {/* LIVE DATABASE PRODUCTS CATEGORIZED */}
        <ProductSlider title="New Products" products={newProducts} highlight={true} />
        <ProductSlider title="Featured Products" products={featuredProducts} highlight={true} />
        <ProductSlider title="Best Selling Products" products={bestSellingProducts} highlight={true} />

        {/* PROMO BANNERS */}
        <section style={{ display: 'flex', gap: '20px', marginBottom: '40px', marginTop: '20px', flexWrap: 'wrap' }}>
          <div className="banner-card" style={{ flex: 1, minWidth: '300px', height: '150px', backgroundImage: 'url(https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,150,136,0.6)' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Valentine's Big Sale</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Flash Sale 15% Off Everything</p>
            </div>
          </div>
          <div className="banner-card" style={{ flex: 1, minWidth: '300px', height: '150px', backgroundImage: 'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,87,34,0.7)' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '900', textShadow: '1px 1px 3px rgba(0,0,0,0.5)', fontStyle: 'italic' }}>Weekend Special! 🌟</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Buy 1 Get 1 Free on Fashion Items</p>
            </div>
          </div>
        </section>

        {/* BRANDS */}
        <div style={{ marginBottom: '40px', width: '100%' }}>
          <h2 style={{ color: '#333', fontSize: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>Featured Brands</h2>
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