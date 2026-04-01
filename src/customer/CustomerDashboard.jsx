import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, LayoutDashboard, ShoppingBag, ClipboardList, 
  User, LogOut, X, Search, Heart, Truck, Edit, Edit3, 
  MessageSquare, Send, RefreshCw, Image as ImageIcon 
} from 'lucide-react';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  
  // Use environment variable for the API base URL, fallback to localhost for local testing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  // Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userData, setUserData] = useState({ id: null, fullName: 'Loading...', email: 'Loading...', phoneNumber: '', initial: '' });
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', email: '' });

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
      setProfileForm({ fullName: parsedUser.fullName, phoneNumber: parsedUser.phoneNumber || '', email: parsedUser.email });
      
      fetchContacts(parsedUser.id);

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
  }, [navigate]);

  // Auto-scroll chat
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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

  // --- DUMMY PRODUCTS ---
  const dummyProducts = [
    { id: 1, title: "Acer Nitro 5 Gaming Laptop, 15.6\" FHD 144Hz", price: "$899.00", oldPrice: "$1099.00", img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=300&q=80" },
    { id: 2, title: "Aveeno Baby Daily Moisture Body Lotion", price: "$33.75", oldPrice: "$40.00", img: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=300&q=80" },
    { id: 3, title: "High-Speed Electric Scooter for Adults", price: "$540.77", oldPrice: "$600.00", img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=300&q=80" },
    { id: 4, title: "Canon EOS Rebel T7 DSLR Camera with Lens", price: "$527.24", oldPrice: "$599.00", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80" },
    { id: 5, title: "Smart Watch for Men Women, Fitness Tracker", price: "$62.49", oldPrice: "$89.99", img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=300&q=80" },
    { id: 6, title: "Women's Crossbody PU Leather Bag", price: "$35.00", oldPrice: "$55.00", img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=300&q=80" },
    { id: 7, title: "Men's Classic Timberland Waterproof Boots", price: "$148.75", oldPrice: "$180.00", img: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=300&q=80" },
    { id: 8, title: "Wireless Noise Cancelling Headphones", price: "$16.99", oldPrice: "$25.00", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" }
  ];


  // --- VIEWS ---
  const renderDashboard = () => (
    <div>
      <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', borderBottom: '2px solid #673ab7', display: 'inline-block', paddingBottom: '5px' }}>Dashboard Overview</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#673ab7', color: 'white', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(103, 58, 183, 0.3)' }}>
          <div><p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>Total Orders</p><h3 style={{ margin: 0, fontSize: '28px' }}>0</h3></div>
          <ClipboardList size={36} opacity={0.8} />
        </div>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#009688', color: 'white', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0, 150, 136, 0.3)' }}>
          <div><p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>Cart Items</p><h3 style={{ margin: 0, fontSize: '28px' }}>0</h3></div>
          <ShoppingCart size={36} opacity={0.8} />
        </div>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#e53935', color: 'white', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(229, 57, 53, 0.3)' }}>
          <div><p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>Wishlist</p><h3 style={{ margin: 0, fontSize: '28px' }}>0</h3></div>
          <Heart size={36} opacity={0.8} />
        </div>
      </div>

      <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', borderBottom: '2px solid #673ab7', display: 'inline-block', paddingBottom: '5px' }}>Recent Orders</h2>
      <div style={{ backgroundColor: 'white', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '40px' }}>
        <ClipboardList size={50} color="#ccc" style={{ margin: '0 auto 15px auto' }} />
        <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>No orders yet</h3>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Browse our products and place your first order!</p>
        <button onClick={() => setActiveTab('products')} style={{ backgroundColor: '#5c6bc0', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>SHOP NOW</button>
      </div>

      <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', borderBottom: '2px solid #673ab7', display: 'inline-block', paddingBottom: '5px' }}>Quick Shortcuts</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {[
          { icon: <ShoppingBag color="#5c6bc0" />, text: 'Shop Products', tab: 'products' },
          { icon: <ShoppingCart color="#009688" />, text: 'View Cart', tab: 'cart' },
          { icon: <Truck color="#8e24aa" />, text: 'Track Orders', tab: 'orders' },
          { icon: <User color="#e91e63" />, text: 'My Profile', tab: 'profile' }
        ].map((item, index) => (
          <div key={index} onClick={() => setActiveTab(item.tab)} style={{ flex: 1, minWidth: '150px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ marginBottom: '10px' }}>{item.icon}</div>
            <p style={{ margin: 0, fontSize: '14px', color: '#555', fontWeight: 'bold' }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Shop Products</h2>
      
      <div style={{ display: 'flex', position: 'relative', marginBottom: '30px' }}>
        <input type="text" placeholder="Search products by name..." style={{ width: '100%', padding: '15px 40px 15px 20px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }} />
        <Search size={20} color="#888" style={{ position: 'absolute', right: '15px', top: '15px' }} />
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {dummyProducts.map(product => (
          <div key={product.id} className="customer-product-card" style={{ width: '220px', border: '1px solid #eaeaea', borderRadius: '8px', padding: '15px', backgroundColor: 'white', transition: 'box-shadow 0.3s, transform 0.2s' }}>
            <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
              <img src={product.img} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
            </div>
            <div style={{ color: '#fbbf24', fontSize: '12px', marginBottom: '8px' }}>★★★★★</div>
            <p style={{ fontSize: '13px', color: '#444', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>{product.title}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <h4 style={{ color: '#ff624d', fontSize: '18px', margin: 0 }}>{product.price}</h4>
              <p style={{ textDecoration: 'line-through', color: '#999', margin: 0, fontSize: '12px' }}>{product.oldPrice}</p>
            </div>
            <button style={{ width: '100%', backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              <ShoppingCart size={16} /> Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCart = () => (
    <div>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Shopping Cart</h2>
      <div style={{ backgroundColor: 'white', padding: '40px 20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
        <p style={{ color: '#666', fontSize: '15px' }}>Your cart is empty. Browse products to add items to your cart.</p>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>My Orders</h2>
      <div style={{ backgroundColor: 'white', padding: '60px 20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
        <p style={{ color: '#666', fontSize: '15px', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
        <button onClick={() => setActiveTab('products')} style={{ backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>BROWSE PRODUCTS</button>
      </div>
    </div>
  );

  const renderChat = () => (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
      <div style={{ width: '250px', borderRight: '1px solid #eee', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', backgroundColor: '#673ab7', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare size={18}/> Sellers</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatContacts.length === 0 && !activeChatSeller && <div style={{padding: '20px', color: '#888', fontSize: '13px'}}>Go to the Home page to chat with a seller!</div>}
          
          {activeChatSeller && !chatContacts.find(c => c.id === activeChatSeller.id) && (
             <div style={{ padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#eedeeb', fontWeight: 'bold' }}>🛒 {activeChatSeller.shopName}</div>
          )}

          {chatContacts.map(contact => (
            <div key={contact.id} onClick={() => { setActiveChatSeller(contact); fetchMessages(userData.id, contact.id); }} style={{ padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: activeChatSeller?.id === contact.id ? '#eedeeb' : 'transparent', fontWeight: activeChatSeller?.id === contact.id ? 'bold' : 'normal' }}>
              🛒 {contact.shopName}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        {activeChatSeller ? (
          <>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{activeChatSeller.shopName}</span>
              <RefreshCw size={18} style={{ cursor: 'pointer', color: '#673ab7' }} onClick={() => fetchMessages(userData.id, activeChatSeller.id)}/>
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#f8f9fa' }}>
              {messages.length === 0 && !attachedImageUrl ? <div style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>Send a message to start the conversation!</div> : 
                messages.map(msg => (
                  <div key={msg.id} style={{ alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start', display: 'flex', gap: '10px' }}>
                    <div style={{ backgroundColor: msg.sender === 'customer' ? '#673ab7' : 'white', color: msg.sender === 'customer' ? 'white' : '#333', padding: '10px 15px', borderRadius: msg.sender === 'customer' ? '15px 15px 0 15px' : '15px 15px 15px 0', fontSize: '13px', border: msg.sender === 'customer' ? 'none' : '1px solid #ddd', maxWidth: '400px', lineHeight: '1.4' }}>
                      {msg.message && <div>{msg.message}</div>}
                      {msg.image_url && <img src={msg.image_url} alt="attachment" style={{ maxWidth: '100%', borderRadius: '4px', marginTop: msg.message ? '10px' : '0' }} />}
                    </div>
                  </div>
                ))
              }
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '10px', alignItems: 'center' }}>
              
              {/* Product Thumbnail from Home Page */}
              {attachedImageUrl && (
                <div style={{ position: 'relative', marginRight: '5px' }}>
                  <img src={attachedImageUrl} alt="Product" style={{ height: '40px', borderRadius: '4px', border: '1px solid #ddd' }} />
                  <X size={14} style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#e53935', color: 'white', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setAttachedImageUrl(null)} />
                </div>
              )}

              <input type="file" accept="image/*" ref={chatFileInputRef} onChange={(e) => setChatImageFile(e.target.files[0])} style={{ display: 'none' }} />
              <button onClick={() => chatFileInputRef.current.click()} style={{ backgroundColor: chatImageFile ? '#eedeeb' : 'transparent', border: 'none', cursor: 'pointer', color: chatImageFile ? '#673ab7' : '#888', borderRadius: '50%', padding: '5px' }}><ImageIcon size={24} /></button>
              {chatImageFile && <span style={{fontSize:'11px', color:'#673ab7', maxWidth:'50px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{chatImageFile.name}</span>}
              <input type="text" placeholder="Type a message..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} style={{ flex: 1, padding: '12px 15px', border: '1px solid #ddd', borderRadius: '25px', outline: 'none', fontSize: '14px' }} />
              <button onClick={handleSendMessage} style={{ backgroundColor: '#673ab7', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}><Send size={18}/></button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888', flexDirection: 'column', gap: '10px' }}>
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
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, color: '#333', fontWeight: 'normal' }}>Personal Information</h4>
          {!isEditingProfile ? (
            <button onClick={() => setIsEditingProfile(true)} style={{ border: '1px solid #1e88e5', color: '#1e88e5', backgroundColor: 'transparent', padding: '5px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><Edit3 size={14}/> EDIT</button>
          ) : (
            <button onClick={() => setIsEditingProfile(false)} style={{ border: '1px solid #f44336', color: '#f44336', backgroundColor: 'transparent', padding: '5px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><X size={14}/> CANCEL</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <label style={{ position: 'absolute', top: '-8px', left: '15px', backgroundColor: 'white', padding: '0 5px', fontSize: '12px', color: '#888' }}>Your Name</label>
            <input type="text" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.fullName : userData.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} style={{ width: '100%', padding: '15px', border: isEditingProfile ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <label style={{ position: 'absolute', top: '-8px', left: '15px', backgroundColor: 'white', padding: '0 5px', fontSize: '12px', color: '#888' }}>Phone Number</label>
            <input type="text" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.phoneNumber : userData.phoneNumber} onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})} style={{ width: '100%', padding: '15px', border: isEditingProfile ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '15px', backgroundColor: 'white', padding: '0 5px', fontSize: '12px', color: '#888', zIndex: 1 }}>Email</label>
          <input type="email" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.email : userData.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} style={{ width: '100%', padding: '15px', border: isEditingProfile ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '15px', backgroundColor: 'white', padding: '0 5px', fontSize: '12px', color: '#888', zIndex: 1 }}>Password</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '5px 5px 5px 15px' }}>
            <input type="password" readOnly defaultValue="........" style={{ flex: 1, border: 'none', outline: 'none', color: '#888' }} />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <textarea placeholder="Complete Address" style={{ width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical' }}></textarea>
        </div>

        <div style={{ marginBottom: '30px', maxWidth: '300px' }}>
          <input type="text" placeholder="Postal Code" style={{ width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {isEditingProfile && (
          <button onClick={handleUpdateProfile} style={{ backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>UPDATE PROFILE</button>
        )}
      </div>
    </div>
  );

  // --- MAIN LAYOUT ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', fontFamily: 'sans-serif', backgroundColor: '#f4f7fe' }}>
      <style>
        {`
          .customer-product-card:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; transform: translateY(-3px); }
          .customer-product-card button:hover { background-color: #1565c0 !important; }
        `}
      </style>

      {/* HEADER */}
      <header style={{ backgroundColor: '#ff624d', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', zIndex: 10 }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold' }}>
          <ShoppingCart size={28} /> Weyfeir
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '13px', fontWeight: 'bold' }}>
          <span style={{ cursor: 'pointer' }}>MY DASHBOARD</span>
          <div onClick={handleLogout} style={{ color: 'white', cursor: 'pointer' }}>LOGOUT</div>
        </div>
      </header>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* SIDEBAR */}
        <div style={{ width: '260px', backgroundColor: '#2b3674', color: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          <div style={{ padding: '40px 20px 20px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#5c6bc0', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', margin: '0 auto 15px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
              {userData.initial}
            </div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{userData.fullName}</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#b0bec5' }}>{userData.email}</p>
          </div>

          <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
            {[
              { id: 'dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
              { id: 'products', icon: <ShoppingBag size={20} />, text: 'Products' },
              { id: 'cart', icon: <ShoppingCart size={20} />, text: 'Shopping Cart' },
              { id: 'orders', icon: <ClipboardList size={20} />, text: 'My Orders' },
              { id: 'chat', icon: <MessageSquare size={20} />, text: 'Conversations' },
              { id: 'profile', icon: <User size={20} />, text: 'Manage Profile' }
            ].map(item => (
              <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', cursor: 'pointer', backgroundColor: activeTab === item.id ? '#3949ab' : 'transparent', borderLeft: activeTab === item.id ? '4px solid white' : '4px solid transparent', transition: 'background-color 0.2s' }}>
                {item.icon}
                <span style={{ fontSize: '15px', fontWeight: activeTab === item.id ? 'bold' : 'normal' }}>{item.text}</span>
              </div>
            ))}
          </nav>

          <div style={{ padding: '20px', textAlign: 'center' }}>
             <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 30px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', width: '100%', transition: 'background-color 0.2s' }}>Sign Out</button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'cart' && renderCart()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'profile' && renderProfile()}
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;