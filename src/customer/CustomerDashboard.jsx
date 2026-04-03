import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, LayoutDashboard, ShoppingBag, ClipboardList, 
  User, LogOut, X, Search, Heart, Truck, Edit, Edit3, 
  MessageSquare, Send, RefreshCw, Image as ImageIcon, Menu, ArrowLeft 
} from 'lucide-react';
import logoImage from '../assets/1.png'; // Imported the custom logo

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar toggle
  const navigate = useNavigate();
  
  // Use environment variable for the API base URL, fallback to localhost for local testing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  // Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userData, setUserData] = useState({ id: null, fullName: 'Loading...', email: 'Loading...', phoneNumber: '', initial: '' });
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', email: '' });

  // Live Data States
  const [liveProducts, setLiveProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatImageFile, setChatImageFile] = useState(null); 
  const [attachedImageUrl, setAttachedImageUrl] = useState(null); // Used for pre-attached products
  
  const [activeChatSeller, setActiveChatSeller] = useState(null);
  const [chatContacts, setChatContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const chatFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const storedUser = localStorage.getItem('customerData');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData({ 
        id: parsedUser.id, 
        fullName: parsedUser.fullName, 
        email: parsedUser.email, 
        phoneNumber: parsedUser.phoneNumber || '', 
        initial: parsedUser.fullName.charAt(0).toUpperCase() 
      });
      // FIXED THE ERROR HERE: Changed parsedSeller to parsedUser
      setProfileForm({ fullName: parsedUser.fullName, phoneNumber: parsedUser.phoneNumber || '', email: parsedUser.email });
      
      // Fetch Live Data
      fetchContacts(parsedUser.id);
      fetchProducts();
      fetchOrders(parsedUser.id);
      updateCartCount();

      const pendingChat = localStorage.getItem('pendingChatSeller');
      if (pendingChat) {
        const seller = JSON.parse(pendingChat);
        setActiveTab('chat');
        setActiveChatSeller({ id: seller.id, shopName: seller.shopName });
        fetchMessages(parsedUser.id, seller.id);
        
        // If we passed a product from the home page, pre-fill the chat!
        if (seller.productContext) {
          setChatMessage(`Hi, I am interested in this product: ${seller.productContext.title} ($${seller.productContext.price})`);
          setAttachedImageUrl(seller.productContext.image_url);
        }
        
        localStorage.removeItem('pendingChatSeller');
      }
    } else {
      navigate('/login');
    }

    // Handle screen resize for sidebar
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [navigate]);

  // Auto-scroll chat
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- LIVE API CALLS (Products, Orders, Cart) ---
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/all`);
      if (res.ok) setLiveProducts(await res.json());
    } catch (e) { console.error("Error fetching live products", e); }
  };

  const fetchOrders = async (custId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/customer/${custId}`);
      if (res.ok) setMyOrders(await res.json());
    } catch (e) { console.error("Error fetching customer orders", e); }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('✅ Product added to Cart!');
  };

  // --- CHAT API CALLS ---
  const fetchContacts = async (custId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/customer/${custId}/contacts`);
      if (res.ok) setChatContacts(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (custId, sellerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${custId}/${sellerId}`);
      if (res.ok) setMessages(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() && !chatImageFile && !attachedImageUrl) return;
    if (!activeChatSeller) return;
    
    try {
      const formData = new FormData();
      formData.append('customer_id', userData.id);
      formData.append('seller_id', activeChatSeller.id);
      formData.append('sender', 'customer');
      formData.append('message', chatMessage);
      if (chatImageFile) formData.append('chatImage', chatImageFile);
      if (attachedImageUrl) formData.append('existing_image_url', attachedImageUrl); // Pass the product image URL!

      await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        body: formData 
      });
      
      setChatMessage('');
      setChatImageFile(null); 
      setAttachedImageUrl(null);
      fetchMessages(userData.id, activeChatSeller.id); 
      fetchContacts(userData.id); 
    } catch (e) { console.error(e); }
  };

  // --- PROFILE API CALLS ---
  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/profile/${userData.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(profileForm) 
      });
      if (res.ok) {
        alert('✅ Profile Updated Successfully!');
        setIsEditingProfile(false);
        const updatedUser = { ...userData, ...profileForm, initial: profileForm.fullName.charAt(0).toUpperCase() };
        setUserData(updatedUser);
        localStorage.setItem('customerData', JSON.stringify(updatedUser));
      }
    } catch (e) { alert('Error updating profile.'); }
  };

  const handleLogout = () => { 
    localStorage.removeItem('isCustomerLoggedIn'); 
    localStorage.removeItem('customerData'); 
    window.location.href = '/'; 
  };

  // Helper for tab navigation on mobile
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selecting a tab
  };

  // --- VIEWS ---
  const renderDashboard = () => (
    <div>
      <h2 className="section-title">Dashboard Overview</h2>
      <div className="dashboard-cards-container">
        <div onClick={() => handleTabChange('orders')} className="dashboard-card bg-purple">
          <div><p className="card-subtitle">Total Orders</p><h3 className="card-value">{myOrders.length}</h3></div>
          <ClipboardList size={36} opacity={0.8} />
        </div>
        <div onClick={() => navigate('/cart')} className="dashboard-card bg-teal">
          <div><p className="card-subtitle">Cart Items</p><h3 className="card-value">{cartCount}</h3></div>
          <ShoppingCart size={36} opacity={0.8} />
        </div>
      </div>

      <h2 className="section-title">Quick Shortcuts</h2>
      <div className="shortcuts-container">
        {[
          { icon: <ShoppingBag color="#5c6bc0" />, text: 'Shop Products', action: () => handleTabChange('products') },
          { icon: <ShoppingCart color="#009688" />, text: 'View Cart', action: () => navigate('/cart') },
          { icon: <Truck color="#8e24aa" />, text: 'Track Orders', action: () => handleTabChange('orders') },
          { icon: <User color="#e91e63" />, text: 'My Profile', action: () => handleTabChange('profile') }
        ].map((item, index) => (
          <div key={index} onClick={item.action} className="shortcut-card">
            <div style={{ marginBottom: '10px' }}>{item.icon}</div>
            <p style={{ margin: 0, fontSize: '14px', color: '#555', fontWeight: 'bold' }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Shop Live Products</h2>
      
      <div style={{ display: 'flex', position: 'relative', marginBottom: '30px' }}>
        <input type="text" placeholder="Search live products..." className="search-input" />
        <Search size={20} color="#888" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>
      
      <div className="products-grid">
        {liveProducts.length === 0 ? (
           <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: '#888' }}>No live products found. Sellers need to add items.</div>
        ) : (
          liveProducts.map(product => (
            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="customer-product-card">
              <div className="product-image-container">
                <img src={product.image_url} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
              </div>
              <div style={{ color: '#fbbf24', fontSize: '12px', marginBottom: '8px' }}>★★★★★</div>
              <p className="product-title">{product.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <h4 style={{ color: '#ff624d', fontSize: '18px', margin: 0 }}>${product.price}</h4>
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>By: {product.shopName}</p>
              </div>
              <button onClick={(e) => handleAddToCart(e, product)} className="add-to-cart-btn">
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#333', margin: 0 }}>My Orders</h2>
        <RefreshCw size={20} color="#1e88e5" style={{ cursor: 'pointer' }} onClick={() => fetchOrders(userData.id)} />
      </div>
      
      <div className="table-container">
        {myOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <ClipboardList size={50} color="#ccc" style={{ margin: '0 auto 15px auto' }} />
            <p style={{ color: '#666', fontSize: '15px', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
            <button onClick={() => handleTabChange('products')} className="browse-btn">BROWSE PRODUCTS</button>
          </div>
        ) : (
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 'bold', color: '#1e88e5' }}>{order.order_number}</td>
                  <td style={{ color: '#333' }}>{order.product_name}</td>
                  <td style={{ color: '#555' }}>${parseFloat(order.price).toFixed(2)}</td>
                  <td style={{ color: '#555' }}>{order.quantity}</td>
                  <td style={{ fontWeight: 'bold', color: '#ff624d' }}>${parseFloat(order.total_price).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.status === 'Pending' ? 'status-pending' : 'status-success'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: '#888', fontSize: '13px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="chat-container">
      
      {/* Sidebar: Contacts */}
      <div className={`chat-sidebar ${activeChatSeller ? 'hidden-mobile' : ''}`}>
        <div className="chat-sidebar-header">
           <MessageSquare size={18}/> Sellers
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatContacts.length === 0 && !activeChatSeller && <div style={{padding: '20px', color: '#888', fontSize: '13px'}}>Go to the Home page to chat with a seller!</div>}
          
          {activeChatSeller && !chatContacts.find(c => c.id === activeChatSeller.id) && (
             <div className="chat-contact active">🛒 {activeChatSeller.shopName}</div>
          )}

          {chatContacts.map(contact => (
            <div key={contact.id} onClick={() => { setActiveChatSeller(contact); fetchMessages(userData.id, contact.id); }} className={`chat-contact ${activeChatSeller?.id === contact.id ? 'active' : ''}`}>
              🛒 {contact.shopName}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main ${!activeChatSeller ? 'hidden-mobile' : ''}`}>
        {activeChatSeller ? (
          <>
            <div className="chat-header">
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                 <button className="back-btn-mobile" onClick={() => setActiveChatSeller(null)}><ArrowLeft size={18}/></button>
                 <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{activeChatSeller.shopName}</span>
              </div>
              <RefreshCw size={18} style={{ cursor: 'pointer', color: '#673ab7' }} onClick={() => fetchMessages(userData.id, activeChatSeller.id)}/>
            </div>
            
            <div className="chat-messages">
              {messages.length === 0 && !attachedImageUrl ? <div style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>Send a message to start the conversation!</div> : 
                messages.map(msg => (
                  <div key={msg.id} className={`chat-message-row ${msg.sender === 'customer' ? 'sent' : 'received'}`}>
                    <div className={`chat-bubble ${msg.sender === 'customer' ? 'sent-bubble' : 'received-bubble'}`}>
                      {msg.message && <div>{msg.message}</div>}
                      {msg.image_url && <img src={msg.image_url} alt="attachment" style={{ maxWidth: '100%', borderRadius: '4px', marginTop: msg.message ? '10px' : '0' }} />}
                    </div>
                  </div>
                ))
              }
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              
              {/* Product Thumbnail from Home Page */}
              {attachedImageUrl && (
                <div style={{ position: 'relative', marginRight: '5px' }}>
                  <img src={attachedImageUrl} alt="Product" style={{ height: '40px', borderRadius: '4px', border: '1px solid #ddd' }} />
                  <X size={14} className="remove-image-icon" onClick={() => setAttachedImageUrl(null)} />
                </div>
              )}

              <input type="file" accept="image/*" ref={chatFileInputRef} onChange={(e) => setChatImageFile(e.target.files[0])} style={{ display: 'none' }} />
              <button onClick={() => chatFileInputRef.current.click()} className={`upload-btn ${chatImageFile ? 'has-file' : ''}`}><ImageIcon size={24} /></button>
              {chatImageFile && <span className="file-name">{chatImageFile.name}</span>}
              <input type="text" placeholder="Type a message..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="chat-input" />
              <button onClick={handleSendMessage} className="send-btn"><Send size={18}/></button>
            </div>
          </>
        ) : (
          <div className="empty-chat-state">
            <MessageSquare size={50} color="#ddd" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Manage Profile</h2>
      <div className="profile-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, color: '#333', fontWeight: 'normal' }}>Personal Information</h4>
          {!isEditingProfile ? (
            <button onClick={() => setIsEditingProfile(true)} className="edit-btn"><Edit3 size={14}/> EDIT</button>
          ) : (
            <button onClick={() => setIsEditingProfile(false)} className="cancel-btn"><X size={14}/> CANCEL</button>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.fullName : userData.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} className={isEditingProfile ? 'input-editing' : ''} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.phoneNumber : userData.phoneNumber} onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})} className={isEditingProfile ? 'input-editing' : ''} />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Email</label>
          <input type="email" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.email : userData.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className={isEditingProfile ? 'input-editing' : ''} />
        </div>

        <div className="form-group full-width">
          <label>Password</label>
          <input type="password" readOnly defaultValue="........" className="password-input" />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <textarea placeholder="Complete Address" className="address-input"></textarea>
        </div>

        <div style={{ marginBottom: '30px', maxWidth: '300px' }}>
          <input type="text" placeholder="Postal Code" className="postal-input" />
        </div>

        {isEditingProfile && (
          <button onClick={handleUpdateProfile} className="save-profile-btn">UPDATE PROFILE</button>
        )}
      </div>
    </div>
  );

  // --- MAIN LAYOUT ---
  return (
    <div className="dashboard-wrapper">
      <style>
        {`
          /* Core Variables & Resets */
          * { box-sizing: border-box; }
          .dashboard-wrapper { display: flex; flex-direction: column; height: 100vh; width: 100vw; font-family: sans-serif; background-color: #f4f7fe; overflow: hidden; }
          
          /* Header */
          .header { background-color: #ff624d; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; color: white; z-index: 20; position: relative; }
          .logo-container { display: flex; alignItems: center; cursor: pointer; max-width: 150px; }
          .logo-container img { width: 100%; height: auto; max-height: 40px; object-fit: contain; }
          .header-right { display: flex; gap: 20px; align-items: center; font-size: 13px; font-weight: bold; }
          .cart-btn { cursor: pointer; background-color: rgba(0,0,0,0.1); padding: 8px 15px; border-radius: 20px; display: flex; align-items: center; gap: 5px; }
          .mobile-menu-btn { display: none; background: none; border: none; color: white; cursor: pointer; padding: 5px; }

          /* Layout */
          .body-container { display: flex; flex: 1; overflow: hidden; position: relative; }
          
          /* Sidebar */
          .sidebar { width: 260px; background-color: #2b3674; color: white; display: flex; flex-direction: column; transition: transform 0.3s ease; z-index: 15; }
          .sidebar-profile { padding: 40px 20px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .profile-initial { width: 70px; height: 70px; border-radius: 50%; background-color: #5c6bc0; color: white; display: flex; justify-content: center; align-items: center; font-size: 28px; margin: 0 auto 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
          .nav-item { display: flex; align-items: center; gap: 15px; padding: 15px 30px; cursor: pointer; border-left: 4px solid transparent; transition: background-color 0.2s; }
          .nav-item.active { background-color: #3949ab; border-left-color: white; }
          .nav-item span { font-size: 15px; }
          .nav-item.active span { font-weight: bold; }
          
          /* Main Content */
          .content-area { flex: 1; padding: 40px 50px; overflow-y: auto; background-color: #f4f7fe; }
          .section-title { font-size: 20px; color: #333; margin-bottom: 20px; border-bottom: 2px solid #673ab7; display: inline-block; padding-bottom: 5px; }
          
          /* Dashboard Cards */
          .dashboard-cards-container { display: flex; gap: 20px; margin-bottom: 40px; flex-wrap: wrap; }
          .dashboard-card { flex: 1; min-width: 200px; color: white; padding: 25px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.2s; }
          .dashboard-card:hover { transform: translateY(-3px); }
          .bg-purple { background-color: #673ab7; box-shadow: 0 4px 10px rgba(103, 58, 183, 0.3); }
          .bg-teal { background-color: #009688; box-shadow: 0 4px 10px rgba(0, 150, 136, 0.3); }
          .card-subtitle { margin: 0 0 5px 0; font-size: 13px; font-weight: bold; }
          .card-value { margin: 0; font-size: 28px; }

          /* Shortcuts */
          .shortcuts-container { display: flex; gap: 20px; flex-wrap: wrap; }
          .shortcut-card { flex: 1; min-width: 140px; background-color: white; padding: 20px; border-radius: 12px; text-align: center; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; }
          .shortcut-card:hover { transform: translateY(-5px); }

          /* Products */
          .search-input { width: 100%; padding: 15px 40px 15px 20px; border-radius: 8px; border: 1px solid #ddd; outline: none; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
          .products-grid { display: flex; flex-wrap: wrap; gap: 20px; }
          .customer-product-card { width: calc(33.333% - 14px); min-width: 220px; border: 1px solid #eaeaea; border-radius: 8px; padding: 15px; background-color: white; transition: box-shadow 0.3s, transform 0.2s; cursor: pointer; }
          .customer-product-card:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.1); transform: translateY(-3px); }
          .product-image-container { height: 180px; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; background-color: #f9f9f9; border-radius: 6px; }
          .product-title { font-size: 13px; color: #444; margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 36px; }
          .add-to-cart-btn { width: 100%; background-color: #1e88e5; color: white; border: none; padding: 10px; border-radius: 4px; display: flex; justify-content: center; align-items: center; gap: 8px; font-weight: bold; cursor: pointer; font-size: 13px; transition: background-color 0.2s; }
          .add-to-cart-btn:hover { background-color: #1565c0; }

          /* Tables */
          .table-container { background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.02); overflow-x: auto; }
          .responsive-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; min-width: 600px; }
          .responsive-table th { padding: 15px; border-bottom: 2px solid #ddd; background-color: #f4f7fe; color: #333; }
          .responsive-table td { padding: 15px; border-bottom: 1px solid #eee; }
          .status-badge { color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
          .status-pending { background-color: #ff9800; }
          .status-success { background-color: #4caf50; }
          .browse-btn { background-color: #1e88e5; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }

          /* Chat */
          .chat-container { height: calc(100vh - 120px); display: flex; background-color: white; border-radius: 8px; border: 1px solid #eee; overflow: hidden; }
          .chat-sidebar { width: 250px; border-right: 1px solid #eee; background-color: #fafafa; display: flex; flex-direction: column; flex-shrink: 0; }
          .chat-sidebar-header { padding: 15px; background-color: #673ab7; color: white; font-weight: bold; display: flex; align-items: center; gap: 10px; }
          .chat-contact { padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; }
          .chat-contact.active { background-color: #eedeeb; font-weight: bold; }
          .chat-main { flex: 1; display: flex; flex-direction: column; background-color: #fff; min-width: 0; }
          .chat-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
          .chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background-color: #f8f9fa; }
          .chat-message-row { display: flex; gap: 10px; }
          .chat-message-row.sent { align-self: flex-end; }
          .chat-message-row.received { align-self: flex-start; }
          .chat-bubble { padding: 10px 15px; font-size: 13px; max-width: 80%; line-height: 1.4; word-wrap: break-word; }
          .sent-bubble { background-color: #673ab7; color: white; border-radius: 15px 15px 0 15px; }
          .received-bubble { background-color: white; color: #333; border-radius: 15px 15px 15px 0; border: 1px solid #ddd; }
          .chat-input-area { padding: 15px; background-color: white; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
          .remove-image-icon { position: absolute; top: -5px; right: -5px; background-color: #e53935; color: white; border-radius: 50%; cursor: pointer; }
          .upload-btn { background-color: transparent; border: none; cursor: pointer; color: #888; border-radius: 50%; padding: 5px; }
          .upload-btn.has-file { background-color: #eedeeb; color: #673ab7; }
          .file-name { font-size: 11px; color: #673ab7; max-width: 50px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .chat-input { flex: 1; padding: 12px 15px; border: 1px solid #ddd; border-radius: 25px; outline: none; font-size: 14px; min-width: 100px; }
          .send-btn { background-color: #673ab7; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; cursor: pointer; flex-shrink: 0; }
          .empty-chat-state { flex: 1; display: flex; justify-content: center; align-items: center; color: #888; flex-direction: column; gap: 10px; }
          .back-btn-mobile { display: none; background: none; border: none; cursor: pointer; color: #333; padding: 0; }

          /* Profile */
          .profile-container { background-color: white; padding: 30px; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
          .edit-btn { border: 1px solid #1e88e5; color: #1e88e5; background-color: transparent; padding: 5px 15px; border-radius: 4px; display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; font-weight: bold; }
          .cancel-btn { border: 1px solid #f44336; color: #f44336; background-color: transparent; padding: 5px 15px; border-radius: 4px; display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; font-weight: bold; }
          .form-row { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
          .form-group { flex: 1; min-width: 200px; position: relative; }
          .form-group.full-width { margin-bottom: 20px; width: 100%; }
          .form-group label { position: absolute; top: -8px; left: 15px; background-color: white; padding: 0 5px; font-size: 12px; color: #888; z-index: 1; }
          .form-group input { width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 4px; outline: none; box-sizing: border-box; }
          .input-editing { border-color: #1e88e5 !important; }
          .password-input { flex: 1; border: none; outline: none; color: #888; padding: 15px; width: 100%; border: 1px solid #ddd; border-radius: 4px; }
          .address-input { width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 4px; outline: none; box-sizing: border-box; min-height: 100px; resize: vertical; }
          .postal-input { width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 4px; outline: none; box-sizing: border-box; }
          .save-profile-btn { background-color: #1e88e5; color: white; border: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; cursor: pointer; }


          /* --- MEDIA QUERIES FOR RESPONSIVENESS --- */
          
          /* Tablet (max-width: 992px) */
          @media (max-width: 992px) {
            .content-area { padding: 30px; }
            .customer-product-card { width: calc(50% - 10px); }
          }

          /* Mobile (max-width: 768px) */
          @media (max-width: 768px) {
            .header { padding: 15px 20px; }
            .mobile-menu-btn { display: block; }
            
            /* Sidebar hidden by default on mobile, toggled via state */
            .sidebar { position: absolute; top: 0; left: 0; height: 100%; z-index: 100; transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            
            /* Overlay when sidebar is open */
            .sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 90; }
            .sidebar-overlay.open { display: block; }

            .content-area { padding: 20px; }
            .customer-product-card { width: 100%; }
            .dashboard-cards-container { flex-direction: column; }
            .shortcuts-container { flex-direction: column; }
            
            /* Chat Responsiveness */
            .hidden-mobile { display: none !important; }
            .back-btn-mobile { display: block; }
            .chat-sidebar { width: 100%; border-right: none; }
            
            .form-row { flex-direction: column; gap: 15px; }
          }

          /* Small Mobile (max-width: 480px) */
          @media (max-width: 480px) {
            .header-right span { font-size: 11px; padding: 6px 10px; }
            .header-right div { font-size: 11px; }
            .logo-container img { max-height: 30px; }
          }
        `}
      </style>

      {/* HEADER */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>
          
          {/* Custom Logo Integration - fixed logout issue */}
          <div className="logo-container" onClick={() => window.location.href = '/'}>
            <img src={logoImage} alt="Weyfeir Logo" />
          </div>
        </div>
        
        <div className="header-right">
          <span className="cart-btn" onClick={() => navigate('/cart')}>
             <ShoppingCart size={16} /> CART ({cartCount})
          </span>
          <div onClick={handleLogout} style={{ color: 'white', cursor: 'pointer' }}>LOGOUT</div>
        </div>
      </header>

      {/* BODY */}
      <div className="body-container">
        
        {/* Mobile Sidebar Overlay */}
        <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

        {/* SIDEBAR */}
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          
          <div className="sidebar-profile">
            <div className="profile-initial">
              {userData.initial}
            </div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{userData.fullName}</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#b0bec5' }}>{userData.email}</p>
          </div>

          <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
            {[
              { id: 'dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
              { id: 'products', icon: <ShoppingBag size={20} />, text: 'Shop Products' },
              { id: 'cart', icon: <ShoppingCart size={20} />, text: 'Shopping Cart', action: () => { navigate('/cart'); setIsSidebarOpen(false); } },
              { id: 'orders', icon: <ClipboardList size={20} />, text: 'My Orders' },
              { id: 'chat', icon: <MessageSquare size={20} />, text: 'Conversations' },
              { id: 'profile', icon: <User size={20} />, text: 'Manage Profile' }
            ].map(item => (
              <div 
                key={item.id} 
                onClick={() => item.action ? item.action() : handleTabChange(item.id)} 
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </nav>

          <div style={{ padding: '20px', textAlign: 'center' }}>
             <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 30px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', width: '100%', transition: 'background-color 0.2s' }}>Sign Out</button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="content-area">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'profile' && renderProfile()}
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;