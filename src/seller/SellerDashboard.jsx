import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Box, ShoppingCart, ChevronDown, ChevronUp, Wallet, 
  MessageSquare, User, Settings, LogOut, Plus, Eye, 
  Truck, CheckSquare, XCircle, Image as ImageIcon, Send, 
  RefreshCw, ArrowLeft, Edit3, X
} from 'lucide-react';
import logoImage from '../assets/1.png'; // Imported the custom logo

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  
  // Use environment variable for the API base URL, fallback to localhost for local testing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Edit & Modal States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Chat States
  const [chatMessage, setChatMessage] = useState('');
  const [chatImageFile, setChatImageFile] = useState(null); // Allows Seller to attach image
  const [activeChatCustomer, setActiveChatCustomer] = useState(null);
  const [chatContacts, setChatContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const chatFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([
    { id: "ORD-1772665021059-105", price: "$79.99", status: "Unpicked", source: "Direct" },
    { id: "ORD-1772665012751-541", price: "$169.96", status: "Unpicked", source: "Direct" }
  ]); // Dummy orders for the table view

  const [sellerData, setSellerData] = useState({
    id: null,
    fullName: 'Loading...',
    email: 'Loading...',
    phoneNumber: '',
    shopName: 'Loading...',
    initial: ''
  });

  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', email: '' });
  const [shopForm, setShopForm] = useState({ shopName: '', email: '', phoneNumber: '' });
  const [newProduct, setNewProduct] = useState({ title: '', category: '', price: '', stock_qty: '', description: '' });
  const [productImageFile, setProductImageFile] = useState(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const storedSeller = localStorage.getItem('sellerData');
    if (storedSeller) {
      const parsedSeller = JSON.parse(storedSeller);
      setSellerData({
        id: parsedSeller.id,
        fullName: parsedSeller.fullName,
        email: parsedSeller.email,
        phoneNumber: parsedSeller.phoneNumber || '',
        shopName: parsedSeller.shopName || 'My Shop',
        initial: parsedSeller.fullName.charAt(0).toUpperCase() 
      });
      
      setProfileForm({ fullName: parsedSeller.fullName, phoneNumber: parsedSeller.phoneNumber || '', email: parsedSeller.email });
      setShopForm({ shopName: parsedSeller.shopName || 'My Shop', email: parsedSeller.email, phoneNumber: parsedSeller.phoneNumber || '' });
      
      fetchProducts(parsedSeller.id);
      fetchContacts(parsedSeller.id);
    } else {
      window.location.href = '/seller-login';
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);


  // --- API CALLS ---
  const fetchProducts = async (sellerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/products/${sellerId}`);
      const data = await response.json();
      if (response.ok) setProducts(data);
    } catch (error) { console.error('Error fetching products:', error); }
  };

  const handleAddProduct = async () => {
    try {
      const calculatedProfit = parseFloat(newProduct.price) * 0.20;
      const formData = new FormData();
      formData.append('seller_id', sellerData.id);
      formData.append('title', newProduct.title);
      formData.append('category', newProduct.category);
      formData.append('price', newProduct.price);
      formData.append('stock_qty', newProduct.stock_qty);
      formData.append('description', newProduct.description);
      formData.append('profit', calculatedProfit);
      if (productImageFile) formData.append('productImage', productImageFile);

      const response = await fetch(`${API_BASE_URL}/api/seller/products`, { method: 'POST', body: formData });

      if (response.ok) {
        alert('✅ Product Added Successfully!');
        setShowAddProductModal(false);
        setNewProduct({ title: '', category: '', price: '', stock_qty: '', description: '' });
        setProductImageFile(null);
        fetchProducts(sellerData.id);
      } else {
        alert('❌ Failed to add product.');
      }
    } catch (error) {
      alert('❌ Server error while adding product.');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/profile/${sellerData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      if (response.ok) {
        alert('✅ Profile Updated!');
        setIsEditingProfile(false);
        const updatedSeller = { ...sellerData, ...profileForm };
        setSellerData(updatedSeller);
        localStorage.setItem('sellerData', JSON.stringify(updatedSeller));
      }
    } catch (error) { alert('Error updating profile'); }
  };

  const handleUpdateShop = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/shop/${sellerData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopForm)
      });
      if (response.ok) {
        alert('✅ Shop Details Updated!');
        setIsEditingShop(false);
        const updatedSeller = { ...sellerData, ...shopForm };
        setSellerData(updatedSeller);
        localStorage.setItem('sellerData', JSON.stringify(updatedSeller));
      }
    } catch (error) { alert('Error updating shop'); }
  };

  // --- CHAT API CALLS ---
  const fetchContacts = async (sellerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/seller/${sellerId}/contacts`);
      if (res.ok) setChatContacts(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (sellerId, custId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${custId}/${sellerId}`);
      if (res.ok) setMessages(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() && !chatImageFile) return;
    if (!activeChatCustomer) return;
    
    try {
      const formData = new FormData();
      formData.append('customer_id', activeChatCustomer.id);
      formData.append('seller_id', sellerData.id);
      formData.append('sender', 'seller');
      formData.append('message', chatMessage);
      if (chatImageFile) formData.append('chatImage', chatImageFile);

      await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        body: formData
      });
      
      setChatMessage('');
      setChatImageFile(null);
      fetchMessages(sellerData.id, activeChatCustomer.id);
      fetchContacts(sellerData.id);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('isSellerLoggedIn');
    localStorage.removeItem('sellerData');
    window.location.href = '/'; 
  };


  // --- VIEWS ---
  const renderDashboard = () => {
    const categoryCounts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    return (
      <div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#5cb85c', color: 'white', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>Total Products</p><h3 style={{ margin: 0, fontSize: '28px' }}>{products.length}</h3></div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}><Box size={24}/></div>
          </div>
          <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#42a5f5', color: 'white', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>Total Orders</p><h3 style={{ margin: 0, fontSize: '28px' }}>{orders.length}</h3></div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}><ShoppingCart size={24}/></div>
          </div>
          <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#ffa726', color: 'white', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>Guarantee Money</p><h3 style={{ margin: 0, fontSize: '28px' }}>$0.00</h3></div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}><span style={{fontSize: '20px', fontWeight: 'bold'}}>$</span></div>
          </div>
          <div style={{ flex: 1, minWidth: '200px', backgroundColor: '#ec407a', color: 'white', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>Total Sales</p><h3 style={{ margin: 0, fontSize: '28px' }}>$0.00</h3></div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}><span style={{fontSize: '20px', fontWeight: 'bold'}}>$</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1.5, minWidth: '250px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h4 style={{ color: '#1e88e5', margin: '0 0 15px 0', fontSize: '14px' }}>Category wise product count</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', color: '#555', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(categoryCounts).length === 0 && <li style={{ color: '#888' }}>No products categorized yet.</li>}
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <li key={cat} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{cat}</span> <span style={{color: '#1e88e5'}}>{count}</span></li>
              ))}
            </ul>
          </div>
          
          <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h4 style={{ color: '#1e88e5', margin: '0 0 5px 0', fontSize: '14px' }}>Orders</h4>
            <p style={{ margin: '0 0 15px 0', fontSize: '10px', color: '#888' }}>This Month</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{backgroundColor: '#e3f2fd', padding: '5px', borderRadius: '50%'}}><ShoppingCart size={16} color="#2196f3"/></div> <div><p style={{margin:0, fontSize:'11px', color:'#555'}}>New Order</p><h4 style={{margin:0, color:'#2196f3'}}>{orders.length}</h4></div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{backgroundColor: '#e8f5e9', padding: '5px', borderRadius: '50%'}}><Truck size={16} color="#4caf50"/></div> <div><p style={{margin:0, fontSize:'11px', color:'#555'}}>On the way</p><h4 style={{margin:0, color:'#4caf50'}}>0</h4></div></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => (
    <div>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Products Management</h2>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1, display: 'flex', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', overflow: 'hidden' }}>
          <input type="text" placeholder="Search by product name..." style={{ width: '100%', padding: '10px 15px', border: 'none', outline: 'none' }} />
        </div>
        <button onClick={() => setShowAddProductModal(true)} style={{ backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', cursor: 'pointer' }}><Plus size={18}/> ADD</button>
      </div>

      {showAddProductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h3 style={{ margin: 0, color: '#333' }}>Add New Product</h3><X size={20} style={{ cursor: 'pointer', color: '#888' }} onClick={() => setShowAddProductModal(false)} /></div>
            <input type="text" placeholder="Product Title *" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }}/>
            <input type="text" placeholder="Category *" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }}/>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <input type="number" placeholder="Price ($) *" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }}/>
              <input type="number" placeholder="Stock Qty *" value={newProduct.stock_qty} onChange={e => setNewProduct({...newProduct, stock_qty: e.target.value})} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }}/>
            </div>
            <textarea placeholder="Product Description..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px', boxSizing: 'border-box', outline: 'none', minHeight: '80px', resize: 'vertical' }}></textarea>
            <div style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center', borderRadius: '4px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>Upload Product Image</p>
              <input type="file" accept="image/*" onChange={e => setProductImageFile(e.target.files[0])} style={{ fontSize: '12px' }} />
            </div>
            <button onClick={handleAddProduct} style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '12px', width: '100%', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>SAVE PRODUCT</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
        {products.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}><Box size={40} color="#ccc" style={{ margin: '0 auto 10px auto' }} /><p>No products added yet. Click the <b>+ ADD</b> button!</p></div>
        ) : (
          products.map(p => (
            <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eaeaea', padding: '15px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <span style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#2e7d32', color: 'white', fontSize: '11px', padding: '3px 10px', borderRadius: '15px', fontWeight: 'bold', zIndex: 2 }}>{p.status || 'Active'}</span>
              <div style={{ backgroundColor: '#f5f6f8', borderRadius: '6px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', padding: '10px' }}><img src={p.image_url} alt={p.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} /></div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px' }}>{p.title}</h4>
              <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.category}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#111' }}>${parseFloat(p.price).toFixed(2)}</span>
                <span style={{ fontSize: '12px', color: '#2e7d32' }}>Profit: ${parseFloat(p.profit).toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderChat = () => (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
      
      {/* Sidebar: Contacts */}
      <div style={{ width: '250px', borderRight: '1px solid #eee', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', backgroundColor: '#1e88e5', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
           <MessageSquare size={18}/> Customers
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatContacts.length === 0 && <div style={{padding: '20px', color: '#888', fontSize: '13px'}}>No customer inquiries yet.</div>}
          {chatContacts.map(contact => (
            <div key={contact.id} onClick={() => { setActiveChatCustomer(contact); fetchMessages(sellerData.id, contact.id); }} style={{ padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: activeChatCustomer?.id === contact.id ? '#e3f2fd' : 'transparent', fontWeight: activeChatCustomer?.id === contact.id ? 'bold' : 'normal' }}>
              👤 {contact.fullName}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        {activeChatCustomer ? (
          <>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{activeChatCustomer.fullName}</span>
              <RefreshCw size={18} style={{ cursor: 'pointer', color: '#1e88e5' }} onClick={() => fetchMessages(sellerData.id, activeChatCustomer.id)}/>
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#f8f9fa' }}>
              {messages.length === 0 ? <div style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>Send a message!</div> : 
                messages.map(msg => (
                  <div key={msg.id} style={{ alignSelf: msg.sender === 'seller' ? 'flex-end' : 'flex-start', display: 'flex', gap: '10px' }}>
                    <div style={{ backgroundColor: msg.sender === 'seller' ? '#1e88e5' : 'white', color: msg.sender === 'seller' ? 'white' : '#333', padding: '10px 15px', borderRadius: msg.sender === 'seller' ? '15px 15px 0 15px' : '15px 15px 15px 0', fontSize: '13px', border: msg.sender === 'seller' ? 'none' : '1px solid #ddd', maxWidth: '400px', lineHeight: '1.4' }}>
                      {/* Displays both text and attached image */}
                      {msg.message && <div>{msg.message}</div>}
                      {msg.image_url && <img src={msg.image_url} alt="attachment" style={{ maxWidth: '100%', borderRadius: '4px', marginTop: msg.message ? '10px' : '0' }} />}
                    </div>
                  </div>
                ))
              }
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '10px', alignItems: 'center' }}>
              
              {/* Image Upload Input and Button */}
              <input type="file" accept="image/*" ref={chatFileInputRef} onChange={(e) => setChatImageFile(e.target.files[0])} style={{ display: 'none' }} />
              <button onClick={() => chatFileInputRef.current.click()} style={{ backgroundColor: chatImageFile ? '#e3f2fd' : 'transparent', border: 'none', cursor: 'pointer', color: chatImageFile ? '#1e88e5' : '#888', borderRadius: '50%', padding: '5px' }}>
                <ImageIcon size={24} />
              </button>
              
              {/* Display selected filename */}
              {chatImageFile && <span style={{fontSize:'11px', color:'#1e88e5', maxWidth:'50px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{chatImageFile.name}</span>}
              
              <input type="text" placeholder="Reply to customer..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} style={{ flex: 1, padding: '12px 15px', border: '1px solid #ddd', borderRadius: '25px', outline: 'none', fontSize: '14px' }} />
              <button onClick={handleSendMessage} style={{ backgroundColor: '#1e88e5', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}><Send size={18}/></button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888', flexDirection: 'column', gap: '10px' }}>
            <MessageSquare size={50} color="#ddd" />
            <p>Select a customer inquiry to reply</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrdersTable = (title) => (
    <div>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>{title}</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e88e5', color: 'white' }}>
              <th style={{ padding: '15px' }}>Order ID</th>
              <th style={{ padding: '15px' }}>Price</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Source</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px', color: '#333' }}>{o.id}</td>
                <td style={{ padding: '15px', color: '#333', fontWeight: 'bold' }}>{o.price}</td>
                <td style={{ padding: '15px' }}><span style={{ backgroundColor: o.status === 'Unpicked' ? '#e53935' : '#f5f5f5', color: o.status === 'Unpicked' ? 'white' : '#555', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>{o.status}</span></td>
                <td style={{ padding: '15px' }}><span style={{ backgroundColor: '#1e88e5', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>{o.source}</span></td>
                <td style={{ padding: '15px', color: '#1e88e5', cursor: 'pointer', textAlign: 'center' }}><Eye size={18}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMoneyWithdraw = () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Money Withdrawal</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, backgroundColor: '#1e88e5', color: 'white', padding: '25px', borderRadius: '4px', position: 'relative' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Wallet Balance</p>
          <h2 style={{ margin: 0, fontSize: '32px' }}>$0.00</h2>
          <Wallet size={30} style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.8 }} />
        </div>
      </div>
    </div>
  );

  const renderManageProfile = () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Manage Profile</h2>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '4px', border: '1px solid #eee' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, color: '#333', fontWeight: 'normal' }}>Personal Information</h4>
          {!isEditingProfile ? (
            <button onClick={() => setIsEditingProfile(true)} style={{ border: '1px solid #1e88e5', color: '#1e88e5', backgroundColor: 'transparent', padding: '5px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><Edit3 size={14}/> EDIT</button>
          ) : (
            <button onClick={() => setIsEditingProfile(false)} style={{ border: '1px solid #f44336', color: '#f44336', backgroundColor: 'transparent', padding: '5px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><X size={14}/> CANCEL</button>
          )}
        </div>

        <p style={{ fontSize: '13px', color: '#555', marginBottom: '25px' }}>Your Rating: <span style={{ color: '#ccc', letterSpacing: '2px' }}>☆ ☆ ☆ ☆ ☆</span> (0.0)</p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '10px', color: '#888' }}>Your Name</label>
            <input type="text" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.fullName : sellerData.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} style={{ width: '100%', padding: '12px', border: isEditingProfile ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', outline: 'none', color: isEditingProfile ? '#333' : '#888' }}/>
            <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#aaa' }}>Optional: Enter your full name</p>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '10px', color: '#888' }}>Your Phone</label>
            <input type="text" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.phoneNumber : sellerData.phoneNumber} onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})} style={{ width: '100%', padding: '12px', border: isEditingProfile ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', outline: 'none', color: isEditingProfile ? '#333' : '#888' }}/>
            <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#aaa' }}>Optional: Enter your contact number</p>
          </div>
        </div>

        <h4 style={{ margin: '0 0 15px 0', color: '#333', fontWeight: 'normal' }}>Email Settings</h4>
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '10px', color: '#888' }}>Email Address *</label>
          <input type="email" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.email : sellerData.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} style={{ width: '100%', padding: '12px', border: isEditingProfile ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', outline: 'none', color: isEditingProfile ? '#333' : '#888', boxSizing: 'border-box' }}/>
        </div>

        <h4 style={{ margin: '0 0 15px 0', color: '#333', fontWeight: 'normal' }}>Change Password</h4>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: isEditingProfile ? 'white' : '#f4f7fa', padding: '0 5px', fontSize: '10px', color: '#888' }}>Current Password</label>
            <input type="password" readOnly={!isEditingProfile} defaultValue={isEditingProfile ? "" : "........"} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: isEditingProfile ? 'white' : '#f4f7fa', outline: 'none' }}/>
          </div>
          <div style={{ flex: 1 }}>
            <input type="password" readOnly={!isEditingProfile} placeholder="New Password" style={{ width: '100%', padding: '12px', border: isEditingProfile ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', outline: 'none', backgroundColor: isEditingProfile ? 'white' : '#fafafa' }}/>
          </div>
        </div>

        {isEditingProfile && (
          <button onClick={handleUpdateProfile} style={{ backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>SAVE CHANGES</button>
        )}
      </div>
    </div>
  );

  const renderShopSettings = () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Shop Settings</h2>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '4px', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', fontWeight: 'normal' }}>Shop Information</h4>
          {!isEditingShop ? (
            <button onClick={() => setIsEditingShop(true)} style={{ border: '1px solid #1e88e5', color: '#1e88e5', backgroundColor: 'transparent', padding: '5px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><Edit3 size={14}/> EDIT</button>
          ) : (
            <button onClick={() => setIsEditingShop(false)} style={{ border: '1px solid #f44336', color: '#f44336', backgroundColor: 'transparent', padding: '5px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><X size={14}/> CANCEL</button>
          )}
        </div>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '10px', color: '#888' }}>Shop Name *</label>
          <input type="text" readOnly={!isEditingShop} value={isEditingShop ? shopForm.shopName : sellerData.shopName} onChange={(e) => setShopForm({...shopForm, shopName: e.target.value})} style={{ width: '100%', padding: '12px', border: isEditingShop ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', outline: 'none', color: isEditingShop ? '#333' : '#888' }}/>
        </div>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '10px', color: '#888' }}>Email *</label>
          <input type="email" readOnly={!isEditingShop} value={isEditingShop ? shopForm.email : sellerData.email} onChange={(e) => setShopForm({...shopForm, email: e.target.value})} style={{ width: '100%', padding: '12px', border: isEditingShop ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', outline: 'none', color: isEditingShop ? '#333' : '#888' }}/>
        </div>

        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '10px', color: '#888' }}>Phone *</label>
          <input type="text" readOnly={!isEditingShop} value={isEditingShop ? shopForm.phoneNumber : sellerData.phoneNumber} onChange={(e) => setShopForm({...shopForm, phoneNumber: e.target.value})} style={{ width: '100%', padding: '12px', border: isEditingShop ? '1px solid #1e88e5' : '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', outline: 'none', color: isEditingShop ? '#333' : '#888' }}/>
        </div>

        {isEditingShop && (
          <button onClick={handleUpdateShop} style={{ backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>SAVE CHANGES</button>
        )}
      </div>
    </div>
  );

  // --- MAIN LAYOUT ---
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', backgroundColor: '#f8f9fb' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#ff5722', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        
        <div style={{ padding: '30px 20px 20px 20px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{sellerData.shopName}</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#ffe0b2' }}>{sellerData.email}</p>
        </div>

        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          <div onClick={() => setActiveTab('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', cursor: 'pointer', backgroundColor: activeTab === 'dashboard' ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
            <Home size={18} /> <span style={{ fontSize: '14px', fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal' }}>Dashboard</span>
          </div>
          <div onClick={() => setActiveTab('products')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', cursor: 'pointer', backgroundColor: activeTab === 'products' ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
            <Box size={18} /> <span style={{ fontSize: '14px', fontWeight: activeTab === 'products' ? 'bold' : 'normal' }}>Products</span>
          </div>
          <div>
            <div onClick={() => setIsOrdersOpen(!isOrdersOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 25px', cursor: 'pointer', backgroundColor: (activeTab === 'all-orders' || activeTab === 'direct-orders') ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <ShoppingCart size={18} /> <span style={{ fontSize: '14px', fontWeight: (activeTab === 'all-orders' || activeTab === 'direct-orders') ? 'bold' : 'normal' }}>Orders</span>
              </div>
              {isOrdersOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </div>
            {isOrdersOpen && (
              <div style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '5px 0' }}>
                <div onClick={() => setActiveTab('all-orders')} style={{ padding: '10px 25px 10px 60px', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'all-orders' ? 'bold' : 'normal' }}>All Orders</div>
                <div onClick={() => setActiveTab('direct-orders')} style={{ padding: '10px 25px 10px 60px', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'direct-orders' ? 'bold' : 'normal' }}>Direct Orders</div>
              </div>
            )}
          </div>
          <div onClick={() => setActiveTab('money')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', cursor: 'pointer', backgroundColor: activeTab === 'money' ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
            <Wallet size={18} /> <span style={{ fontSize: '14px', fontWeight: activeTab === 'money' ? 'bold' : 'normal' }}>Money Withdraw</span>
          </div>
          <div onClick={() => setActiveTab('chat')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', cursor: 'pointer', backgroundColor: activeTab === 'chat' ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
            <MessageSquare size={18} /> <span style={{ fontSize: '14px', fontWeight: activeTab === 'chat' ? 'bold' : 'normal' }}>Conversations</span>
          </div>
          <div onClick={() => setActiveTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', cursor: 'pointer', backgroundColor: activeTab === 'profile' ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
            <User size={18} /> <span style={{ fontSize: '14px', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}>Manage Profile</span>
          </div>
          <div onClick={() => setActiveTab('settings')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', cursor: 'pointer', backgroundColor: activeTab === 'settings' ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
            <Settings size={18} /> <span style={{ fontSize: '14px', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>Shop Setting</span>
          </div>
        </nav>

        <div style={{ padding: '20px' }}>
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
            <LogOut size={16}/> <span style={{fontSize: '14px'}}>Logout</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ backgroundColor: '#ff5722', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, color: 'white' }}>
           
           {/* Custom Logo Integration Linked to Home */}
           <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
             <img 
                src={logoImage} 
                alt="Weyfeir Logo" 
                style={{ height: '40px', objectFit: 'contain' }} 
             />
           </Link>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' }}>
            <span style={{ cursor: 'pointer' }}>MY DASHBOARD</span>
            <div onClick={handleLogout} style={{ cursor: 'pointer' }}>LOGOUT</div>
          </div>
        </header>

        <div style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'all-orders' && renderOrdersTable('All Orders')}
          {activeTab === 'direct-orders' && renderOrdersTable('Direct Orders')}
          {activeTab === 'money' && renderMoneyWithdraw()}
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'profile' && renderManageProfile()}
          {activeTab === 'settings' && renderShopSettings()}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;