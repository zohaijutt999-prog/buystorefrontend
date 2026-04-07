import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Box, ShoppingCart, ChevronDown, ChevronUp, Wallet, 
  MessageSquare, User, Settings, LogOut, Plus, Eye, 
  Truck, CheckSquare, XCircle, Image as ImageIcon, Send, 
  RefreshCw, ArrowLeft, Edit3, X, Building, DollarSign, Edit, Menu, Check, Search, Bell
} from 'lucide-react';
import logoImage from '../assets/1.png'; 

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productAddMode, setProductAddMode] = useState('new'); 
  const [globalProducts, setGlobalProducts] = useState([]); 
  const [selectedGlobalProducts, setSelectedGlobalProducts] = useState([]); 
  
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [editingOrder, setEditingOrder] = useState(null); 
  const [newOrderStatus, setNewOrderStatus] = useState('');

  const [chatMessage, setChatMessage] = useState('');
  const [chatImageFile, setChatImageFile] = useState(null); 
  const [activeChatCustomer, setActiveChatCustomer] = useState(null);
  const [chatContacts, setChatContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const chatFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]); 
  const [directOrders, setDirectOrders] = useState([]); 
  const [totalSales, setTotalSales] = useState(0); 

  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('USDT (TRC20)');
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');

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

  // Notification States
  const [newOrdersBadge, setNewOrdersBadge] = useState(0);
  const [newChatBadge, setNewChatBadge] = useState(0);

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
      fetchOrders(parsedSeller.id); 
      fetchWithdrawals(parsedSeller.id);
      fetchGlobalProducts(); 

      // Start Polling for Live Notifications (Every 10 seconds)
      const intervalId = setInterval(() => {
        fetchOrders(parsedSeller.id);
        fetchContacts(parsedSeller.id);
      }, 10000);

      const handleResize = () => { if (window.innerWidth > 768) setIsSidebarOpen(false); };
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('resize', handleResize);
      };
    } else {
      window.location.href = '/seller-login';
    }
  }, []);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  // Handle Smart Notification Badges Logic
  useEffect(() => {
    if (!sellerData.id) return;

    if (activeTab === 'all-orders' || activeTab === 'direct-orders') {
      setNewOrdersBadge(0);
      localStorage.setItem(`ordersCount_${sellerData.id}`, allOrders.length.toString());
    } else {
      const prevOrdersCount = parseInt(localStorage.getItem(`ordersCount_${sellerData.id}`) || '0');
      if (allOrders.length > prevOrdersCount) setNewOrdersBadge(allOrders.length - prevOrdersCount);
    }

    if (activeTab === 'chat') {
      setNewChatBadge(0);
      localStorage.setItem(`chatsCount_${sellerData.id}`, chatContacts.length.toString());
    } else {
      const prevChatsCount = parseInt(localStorage.getItem(`chatsCount_${sellerData.id}`) || '0');
      if (chatContacts.length > prevChatsCount) setNewChatBadge(chatContacts.length - prevChatsCount);
    }
  }, [activeTab, allOrders, chatContacts, sellerData.id]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); 
  };

  const handleOrdersToggle = () => {
    setIsOrdersOpen(!isOrdersOpen);
  };

  const fetchProducts = async (sellerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/products/${sellerId}`);
      const data = await response.json();
      if (response.ok) setProducts(data);
    } catch (error) { console.error('Error fetching products:', error); }
  };

  const fetchGlobalProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/all`);
      if (res.ok) setGlobalProducts(await res.json());
    } catch (e) { console.error("Error fetching all live products", e); }
  };

  const fetchOrders = async (sellerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/seller-all/${sellerId}`);
      const data = await response.json();
      if (response.ok) {
        setAllOrders(data.orders); 
        setDirectOrders(data.placed); 
        setTotalSales(data.totalSale);
      }
    } catch (error) { 
      try {
        const fallbackRes = await fetch(`${API_BASE_URL}/api/orders/seller/${sellerId}`);
        const fallbackData = await fallbackRes.json();
        if(fallbackRes.ok) {
           setAllOrders(fallbackData.orders);
           setTotalSales(fallbackData.totalSale);
        }
      } catch (e) { console.log(e); }
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!editingOrder) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/status/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newOrderStatus })
      });
      
      if (response.ok) {
        alert('✅ Order Status Updated Successfully!');
        setEditingOrder(null);
        fetchOrders(sellerData.id); 
      } else {
        alert('❌ Failed to update status.');
      }
    } catch (error) {
      alert('❌ Server error while updating order.');
    }
  };

  const fetchWithdrawals = async (sellerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/withdrawals/seller/${sellerId}`);
      if (response.ok) setWithdrawalHistory(await response.json());
    } catch (error) { console.error('Error fetching withdrawals:', error); }
  };

  const totalWithdrawnAndPending = withdrawalHistory.reduce((sum, w) => sum + parseFloat(w.amount), 0);
  const availableBalance = parseFloat(totalSales) - totalWithdrawnAndPending;
  const pendingAmount = withdrawalHistory.filter(w => w.status === 'Pending').reduce((sum, w) => sum + parseFloat(w.amount), 0);

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || !walletAddress) { alert("Please enter amount and wallet address/details."); return; }
    if (parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > availableBalance) { alert("Invalid amount or insufficient balance."); return; }

    try {
      const response = await fetch(`${API_BASE_URL}/api/withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerData.id,
          amount: parseFloat(withdrawAmount),
          payment_method: paymentMethod,
          wallet_address: walletAddress,
          note: withdrawNote
        })
      });

      if (response.ok) {
        alert("✅ Withdrawal Request Submitted!");
        setWithdrawAmount(''); setWalletAddress(''); setWithdrawNote('');
        fetchWithdrawals(sellerData.id); 
      } else {
        alert("❌ Failed to submit request.");
      }
    } catch (error) { alert("Server Error."); }
  };

  const handleAddSelectedGlobalProducts = async () => {
    if (selectedGlobalProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    try {
      for (let prod of selectedGlobalProducts) {
        await fetch(`${API_BASE_URL}/api/seller/products`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             seller_id: sellerData.id,
             title: prod.title,
             category: prod.category,
             price: prod.price,
             stock_qty: prod.stock_qty || 10,
             description: prod.description || 'Sourced from main catalog.',
             profit: prod.profit || (prod.price * 0.2),
             existing_image_url: prod.image_url 
           })
        });
      }
      
      alert('✅ Selected products added to your shop!');
      setShowAddProductModal(false);
      setSelectedGlobalProducts([]);
      fetchProducts(sellerData.id);

    } catch (error) {
      alert('❌ Some products failed to add.');
    }
  };

  const handleSelectAllGlobalProducts = () => {
    if (selectedGlobalProducts.length === globalProducts.length) {
      setSelectedGlobalProducts([]);
    } else {
      setSelectedGlobalProducts([...globalProducts]);
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#ff9800';
      case 'Processing': return '#2196f3';
      case 'Shipped': return '#9c27b0';
      case 'Delivered': return '#4caf50';
      case 'Cancelled': return '#f44336';
      default: return '#555';
    }
  };

  const renderChatImage = (url) => {
    if (!url || url === 'null' || url === 'undefined' || String(url).trim() === '') return null;
    let finalUrl = String(url);
    if (finalUrl.startsWith('//')) finalUrl = finalUrl.replace('//', '/');
    if (finalUrl.startsWith('/uploads')) {
      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, ''); 
      finalUrl = `${cleanBaseUrl}${finalUrl}`;
    }
    return finalUrl.replace(/([^:]\/)\/+/g, "$1");
  };

  // --- VIEWS ---
  const renderDashboard = () => {
    const categoryCounts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    const newOrdersCount = allOrders.filter(o => o.status === 'Pending').length;
    const cancelledOrdersCount = allOrders.filter(o => o.status === 'Cancelled').length;
    const onTheWayOrdersCount = allOrders.filter(o => o.status === 'Shipped').length;
    const completedOrdersCount = allOrders.filter(o => o.status === 'Delivered').length;

    const CardBox = ({ children }) => (
      <div className="card-box">{children}</div>
    );

    return (
      <div style={{ paddingBottom: '40px' }}>
        <div className="dashboard-cards-container">
          <div onClick={() => handleTabChange('products')} className="dashboard-card bg-green">
            <div><p className="card-subtitle">Total Products</p><h3 className="card-value">{products.length}</h3></div>
            <div className="card-icon-bg"><Box size={24}/></div>
          </div>
          <div onClick={() => handleTabChange('all-orders')} className="dashboard-card bg-blue">
            <div><p className="card-subtitle">Total Orders</p><h3 className="card-value">{allOrders.length}</h3></div>
            <div className="card-icon-bg"><ShoppingCart size={24}/></div>
          </div>
          <div className="dashboard-card bg-orange">
            <div><p className="card-subtitle">Guarantee Money</p><h3 className="card-value">$0.00</h3></div>
            <div className="card-icon-bg"><DollarSign size={24}/></div>
          </div>
          <div onClick={() => handleTabChange('money')} className="dashboard-card bg-pink">
            <div><p className="card-subtitle">Total Sales</p><h3 className="card-value">${parseFloat(totalSales).toFixed(2)}</h3></div>
            <div className="card-icon-bg"><DollarSign size={24}/></div>
          </div>
        </div>

        <div className="middle-section-container">
          <CardBox>
            <h4 className="card-box-title">Sales Stat</h4>
            <div className="sales-chart">
              <div style={{ flex: 1, backgroundColor: '#2196f3', height: '30%', borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ flex: 1, backgroundColor: '#2196f3', height: '50%', borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ flex: 1, backgroundColor: '#2196f3', height: '80%', borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ flex: 1, backgroundColor: '#2196f3', height: '40%', borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ flex: 1, backgroundColor: '#2196f3', height: '90%', borderRadius: '4px 4px 0 0' }}></div>
            </div>
            <p className="sales-chart-label">Last 5 Months</p>
          </CardBox>
          <CardBox>
            <h4 className="card-box-title">Category wise product count</h4>
            <ul className="category-list">
              {Object.keys(categoryCounts).length === 0 && <li style={{ color: '#888' }}>No products categorized yet.</li>}
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <li key={cat}><span>{cat}</span> <span className="cat-count">{count}</span></li>
              ))}
            </ul>
          </CardBox>
          <CardBox>
            <h4 style={{ margin: '0 0 5px 0', color: '#1e88e5', fontSize: '15px', cursor: 'pointer' }} onClick={() => handleTabChange('all-orders')}>Orders</h4>
            <p style={{ margin: '0 0 20px 0', fontSize: '11px', color: '#888' }}>This Month</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="order-stat-row">
                <div style={{backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '50%'}}><ShoppingCart size={18} color="#2196f3"/></div> 
                <div><p style={{margin:0, fontSize:'12px', color:'#555'}}>New Order</p><h4 style={{margin:0, color:'#2196f3', fontSize: '16px'}}>{newOrdersCount}</h4></div>
              </div>
              <div className="order-stat-row">
                <div style={{backgroundColor: '#ffebee', padding: '10px', borderRadius: '50%'}}><X size={18} color="#f44336"/></div> 
                <div><p style={{margin:0, fontSize:'12px', color:'#555'}}>Cancelled</p><h4 style={{margin:0, color:'#f44336', fontSize: '16px'}}>{cancelledOrdersCount}</h4></div>
              </div>
              <div className="order-stat-row">
                <div style={{backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '50%'}}><Truck size={18} color="#4caf50"/></div> 
                <div><p style={{margin:0, fontSize:'12px', color:'#555'}}>On the way</p><h4 style={{margin:0, color:'#4caf50', fontSize: '16px'}}>{onTheWayOrdersCount}</h4></div>
              </div>
              <div className="order-stat-row">
                <div style={{backgroundColor: '#e0f7fa', padding: '10px', borderRadius: '50%'}}><CheckSquare size={18} color="#00bcd4"/></div> 
                <div><p style={{margin:0, fontSize:'12px', color:'#555'}}>Completed</p><h4 style={{margin:0, color:'#00bcd4', fontSize: '16px'}}>{completedOrdersCount}</h4></div>
              </div>
            </div>
          </CardBox>
          <CardBox>
            <h4 className="card-box-title">Purchased Package</h4>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '80px', height: '80px', border: '8px solid #2196f3', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#2196f3', borderRadius: '50%' }}></div>
              </div>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888' }}>Current Package:</p>
              <h4 style={{ margin: '0 0 15px 0', color: '#1e88e5', fontSize: '18px' }}>platinum shop</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#333' }}>Product Upload Limit: 1000 Times</p>
              <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#333' }}>Package Expires at: 2026-02-10</p>
              <button style={{ backgroundColor: '#e3f2fd', color: '#1e88e5', border: '1px solid #90caf9', padding: '8px 20px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Upgrade Package</button>
            </div>
          </CardBox>
        </div>

        <div className="middle-section-container" style={{marginBottom: '40px'}}>
          <CardBox>
            <h4 className="card-box-title">Sold Amount</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888' }}>Your Sold Amount (Current day)</p>
            <h2 style={{ margin: '0 0 10px 0', color: '#2196f3', fontSize: '32px' }}>$0.00</h2>
            <p style={{ margin: '0 0 25px 0', fontSize: '11px', color: '#aaa' }}>Last day: $0.00</p>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888' }}>Your sold amount (current month)</p>
            <h2 style={{ margin: '0 0 10px 0', color: '#2196f3', fontSize: '32px' }}>${parseFloat(totalSales).toFixed(2)}</h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>Last Month: $0.00</p>
          </CardBox>
          <CardBox>
            <h4 className="card-box-title">Today Views</h4>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', paddingBottom: '20px' }}>
              <h1 style={{ color: '#2196f3', fontSize: '64px', margin: '0 0 30px 0', fontWeight: '300' }}>0</h1>
              <span style={{ backgroundColor: '#ffca28', color: '#333', padding: '8px 30px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>★ VERIFIED ★</span>
            </div>
          </CardBox>
        </div>

        <h3 className="section-title">Quick Actions</h3>
        <div className="shortcuts-container">
          <div onClick={() => handleTabChange('products')} className="shortcut-card">
            <Box size={32} color="#3f51b5" style={{ margin: '0 auto 10px auto' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#333', fontWeight: 'bold' }}>Add Products</p>
          </div>
          <div onClick={() => handleTabChange('all-orders')} className="shortcut-card">
            <ShoppingCart size={32} color="#009688" style={{ margin: '0 auto 10px auto' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#333', fontWeight: 'bold' }}>View Orders</p>
          </div>
          <div onClick={() => handleTabChange('settings')} className="shortcut-card">
            <Settings size={32} color="#9c27b0" style={{ margin: '0 auto 10px auto' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#333', fontWeight: 'bold' }}>Shop Settings</p>
          </div>
          <div onClick={() => handleTabChange('profile')} className="shortcut-card">
            <User size={32} color="#e91e63" style={{ margin: '0 auto 10px auto' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#333', fontWeight: 'bold' }}>My Profile</p>
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90%', maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Select Products to Add</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#888' }} onClick={() => setShowAddProductModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p style={{ margin: '0 0 15px 0', color: '#1e88e5', fontSize: '14px' }}>You can add products to your inventory free of cost. No wallet balance will be deducted.</p>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, position: 'relative', minWidth: '200px' }}>
                    <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '11px', color: '#888' }}>Search products</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 15px' }}>
                      <Search size={16} color="#888" style={{marginRight: '5px'}}/>
                      <input type="text" style={{ width: '100%', padding: '12px 0', border: 'none', outline: 'none' }}/>
                    </div>
                </div>
                <div style={{ flex: 1, position: 'relative', minWidth: '100px' }}>
                    <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '11px', color: '#888' }}>Min Price</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 15px' }}>
                      <span style={{ color: '#555', marginRight: '5px' }}>$</span>
                      <input type="number" style={{ width: '100%', padding: '12px 0', border: 'none', outline: 'none' }}/>
                    </div>
                </div>
                <div style={{ flex: 1, position: 'relative', minWidth: '100px' }}>
                    <label style={{ position: 'absolute', top: '-8px', left: '10px', backgroundColor: 'white', padding: '0 5px', fontSize: '11px', color: '#888' }}>Max Price</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 15px' }}>
                      <span style={{ color: '#555', marginRight: '5px' }}>$</span>
                      <input type="number" style={{ width: '100%', padding: '12px 0', border: 'none', outline: 'none' }}/>
                    </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '16px', color: '#333' }}>
                  <input 
                    type="checkbox" 
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    checked={selectedGlobalProducts.length === globalProducts.length && globalProducts.length > 0}
                    onChange={handleSelectAllGlobalProducts}
                  /> 
                  Select All
                </label>
                <span style={{ border: '1px solid #ddd', padding: '5px 15px', borderRadius: '20px', fontSize: '13px', color: '#555' }}>
                  {selectedGlobalProducts.length} products selected
                </span>
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {globalProducts.length === 0 ? (
                    <div style={{textAlign:'center', color:'#888', width:'100%', gridColumn: '1 / -1', padding: '40px 0'}}>
                      <p style={{fontSize: '16px', color: '#555', margin: '0 0 10px 0'}}>No products match your search criteria</p>
                      <p style={{fontSize: '13px', margin: 0}}>Try adjusting your search terms or price range</p>
                    </div>
                  ) : 
                    globalProducts.map(p => {
                      const isSelected = selectedGlobalProducts.find(item => item.id === p.id);
                      return (
                        <div key={p.id} onClick={() => {
                          if(isSelected) setSelectedGlobalProducts(prev => prev.filter(item => item.id !== p.id));
                          else setSelectedGlobalProducts(prev => [...prev, p]);
                        }} style={{ border: `2px solid ${isSelected ? '#4caf50' : '#eee'}`, borderRadius: '8px', padding: '10px', cursor: 'pointer', position: 'relative' }}>
                          {isSelected && <div style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: '#4caf50', color: 'white', borderRadius: '50%', padding: '2px' }}><Check size={14}/></div>}
                          <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '10px' }} />
                          <p style={{ fontSize: '12px', margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>
                          <p style={{ fontSize: '14px', margin: 0, color: '#1e88e5', fontWeight: 'bold' }}>${p.price}</p>
                        </div>
                      )
                    })
                  }
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                <button onClick={() => setShowAddProductModal(false)} style={{ backgroundColor: 'transparent', color: '#1e88e5', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>CANCEL</button>
                <button 
                  onClick={handleAddSelectedGlobalProducts} 
                  style={{ backgroundColor: selectedGlobalProducts.length > 0 ? '#1e88e5' : '#e0e0e0', color: selectedGlobalProducts.length > 0 ? 'white' : '#999', border: 'none', padding: '10px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: selectedGlobalProducts.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '5px' }}
                  disabled={selectedGlobalProducts.length === 0}
                >
                  <Plus size={16}/> ADD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}><Box size={40} color="#ccc" style={{ margin: '0 auto 10px auto' }} /><p>No products added yet. Click the <b>+ ADD</b> button!</p></div>
        ) : (
          products.map(p => (
            <div key={p.id} className="seller-product-card">
              <span className="product-badge">{p.status || 'Active'}</span>
              <div className="product-image-container">
                <img src={p.image_url} alt={p.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
              </div>
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
    <div className="chat-container">
      
      <div className={`chat-sidebar ${activeChatCustomer ? 'hidden-mobile' : ''}`}>
        <div className="chat-sidebar-header">
           <MessageSquare size={18}/> Chat Messages
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatContacts.length === 0 && <div style={{padding: '20px', color: '#888', fontSize: '13px'}}>No messages yet.</div>}
          {chatContacts.map(contact => (
            <div key={contact.id} onClick={() => { setActiveChatCustomer(contact); fetchMessages(sellerData.id, contact.id); }} className={`chat-contact ${activeChatCustomer?.id === contact.id ? 'active' : ''}`}>
              <User size={16} /> {contact.fullName}
            </div>
          ))}
        </div>
      </div>

      <div className={`chat-main ${!activeChatCustomer ? 'hidden-mobile' : ''}`}>
        {activeChatCustomer ? (
          <>
            <div className="chat-header-blue">
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <button className="back-btn-mobile" onClick={() => setActiveChatCustomer(null)}><ArrowLeft size={18} color="white"/></button>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>Seller Support Chat</span>
              </div>
              <RefreshCw size={18} style={{ cursor: 'pointer', color: 'white' }} onClick={() => fetchMessages(sellerData.id, activeChatCustomer.id)}/>
            </div>
            
            <div className="chat-messages">
              <div className="chat-message-row received" style={{marginTop: '10px', marginBottom: '20px'}}>
                <div className="chat-bubble system-bubble">
                   <p style={{margin: '0 0 10px 0'}}>Please note that your store is linked to your Gurentor account. Any positive or negative reviews received on your Weyfeir store will also be reflected on your Gurentor store.</p>
                   <p style={{margin: 0}}>Thank you for being part of the Weyfeir community. We look forward to seeing your store grow and succeed</p>
                </div>
              </div>

              {messages.length === 0 ? <div style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>Send a message!</div> : 
                messages.map(msg => (
                  <div key={msg.id} className={`chat-message-row ${msg.sender === 'seller' ? 'sent' : 'received'}`}>
                    {msg.sender !== 'seller' && (
                      <div className="chat-avatar-icon"><User size={16} color="#555" /></div>
                    )}
                    
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'seller' ? 'flex-end' : 'flex-start', maxWidth: '80%'}}>
                       {msg.sender !== 'seller' && <span style={{fontSize: '11px', color: '#888', marginBottom: '3px', marginLeft: '5px'}}>{activeChatCustomer.email}</span>}
                       <div className={`chat-bubble ${msg.sender === 'seller' ? 'sent-bubble' : 'received-bubble'}`}>
                         
                         {msg.message && msg.message !== 'null' && <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message}</div>}
                         
                         {renderChatImage(msg.image_url) && (
                           <a href={renderChatImage(msg.image_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: (msg.message && msg.message !== 'null') ? '10px' : '0' }}>
                             <img 
                               src={renderChatImage(msg.image_url)} 
                               alt="Shared File" 
                               style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.4)', padding: '2px', objectFit: 'contain' }} 
                               onError={(e) => { e.target.style.display = 'none'; }}
                             />
                           </a>
                         )}
                       </div>
                    </div>

                    {msg.sender === 'seller' && (
                      <div className="chat-avatar-icon"><User size={16} color="#555" /></div>
                    )}
                  </div>
                ))
              }
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input type="file" accept="image/*" ref={chatFileInputRef} onChange={(e) => setChatImageFile(e.target.files[0])} style={{ display: 'none' }} />
              <button onClick={() => chatFileInputRef.current.click()} className={`upload-btn ${chatImageFile ? 'has-file' : ''}`}>
                <ImageIcon size={24} />
              </button>
              {chatImageFile && <span className="file-name">{chatImageFile.name}</span>}
              <input type="text" placeholder="Type a message..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="chat-input" />
              <button onClick={handleSendMessage} className="send-btn" style={{backgroundColor: 'transparent', color: '#888'}}><Send size={24}/></button>
            </div>
          </>
        ) : (
          <div className="empty-chat-state">
            <MessageSquare size={50} color="#ddd" />
            <p>Select a customer inquiry to reply</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrdersTable = (title) => {
    const ordersToShow = title === 'Direct Orders' ? directOrders : allOrders;

    if (selectedOrder) {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', color: '#333', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              Order #{selectedOrder.order_number} 
              <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.status), textTransform: 'uppercase' }}>
                {selectedOrder.status}
              </span>
            </h2>
          </div>

          <div className="order-details-container">
            <div className="order-sidebar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: '#1e88e5' }}>Order Information</h4>
                <ArrowLeft size={18} color="#1e88e5" style={{cursor: 'pointer'}} onClick={() => setSelectedOrder(null)} />
              </div>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#555' }}>Assignment:</p>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#333' }}>
                {selectedOrder.seller_id === sellerData.id ? 'Customer Order' : 'Direct Order (Purchased by You)'}
              </p>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#555' }}>Current Status:</p>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: getStatusColor(selectedOrder.status), fontWeight: 'bold' }}>{selectedOrder.status}</p>
              
              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px', marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Shipping Details</h5>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#555' }}><strong>Name:</strong> {selectedOrder.shipping_name || 'N/A'}</p>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#555' }}><strong>Phone:</strong> {selectedOrder.shipping_phone || 'N/A'}</p>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#555' }}><strong>Address:</strong> {selectedOrder.shipping_address || 'N/A'}</p>
              </div>

              {selectedOrder.seller_id === sellerData.id && (
                <button onClick={() => { setEditingOrder(selectedOrder); setNewOrderStatus(selectedOrder.status); }} style={{ width: '100%', backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <Edit size={18}/> UPDATE STATUS
                </button>
              )}
            </div>

            <div className="order-items-main">
              <h4 style={{ margin: '0 0 20px 0', color: '#1e88e5', fontSize: '18px', fontWeight: 'normal' }}>Order Items</h4>
              <div className="table-wrapper">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Profit</th>
                      <th style={{textAlign: 'center'}}>Qty</th>
                      <th style={{textAlign: 'right'}}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f4f5f8', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                          <Box size={24} color="#888" />
                        </div>
                        <span style={{ color: '#333' }}>{selectedOrder.product_name}</span>
                      </td>
                      <td style={{ color: '#555' }}>${parseFloat(selectedOrder.price).toFixed(2)}</td>
                      <td style={{ color: '#555' }}>${(parseFloat(selectedOrder.price) * 0.20).toFixed(2)}</td>
                      <td style={{ textAlign: 'center', color: '#333' }}>{selectedOrder.quantity}</td>
                      <td style={{ textAlign: 'right', color: '#333' }}>${parseFloat(selectedOrder.total_price).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', width: '250px', maxWidth: '100%', justifyContent: 'space-between', color: '#555' }}><span>Subtotal:</span> <span>${parseFloat(selectedOrder.total_price).toFixed(2)}</span></div>
                <div style={{ display: 'flex', width: '250px', maxWidth: '100%', justifyContent: 'space-between', color: '#555' }}><span>Shipping:</span> <span>$0.00</span></div>
                <div style={{ display: 'flex', width: '250px', maxWidth: '100%', justifyContent: 'space-between', color: '#1e88e5', fontWeight: 'bold', fontSize: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}><span>Total:</span> <span>${parseFloat(selectedOrder.total_price).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={() => setSelectedOrder(null)} style={{ backgroundColor: 'transparent', color: '#1e88e5', border: '1px solid #1e88e5', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
              <ArrowLeft size={16}/> BACK TO ORDERS
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', color: '#333', margin: 0 }}>{title}</h2>
        </div>

        {editingOrder && (
          <div className="modal-overlay">
            <div className="modal-content" style={{width: '400px'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Update Order Status</h3>
                <X size={20} style={{ cursor: 'pointer', color: '#888' }} onClick={() => setEditingOrder(null)} />
              </div>
              <p style={{fontSize: '13px', color: '#555', marginBottom: '15px'}}>Order ID: <strong>{editingOrder.order_number}</strong></p>
              
              <select value={newOrderStatus} onChange={(e) => setNewOrderStatus(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '20px', outline: 'none', backgroundColor: 'white', color: '#333', fontSize: '14px' }}>
                <option value="Pending">Pending / Unpicked</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped / On the way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              
              <button onClick={handleUpdateOrderStatus} style={{ backgroundColor: '#1e88e5', color: 'white', border: 'none', padding: '12px', width: '100%', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>UPDATE STATUS</button>
            </div>
          </div>
        )}

        <div className="table-container">
          {ordersToShow.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No orders found.</div>
          ) : (
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersToShow.map((o, i) => (
                  <tr key={i}>
                    <td style={{ color: '#333' }}>{o.order_number}</td>
                    <td style={{ color: '#333' }}>{new Date(o.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</td>
                    <td style={{ color: '#555' }}>${parseFloat(o.price).toFixed(2)}</td>
                    <td style={{ color: '#4caf50' }}>${(parseFloat(o.price) * 0.20).toFixed(2)}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(o.status) }}>
                        {o.status === 'Pending' ? 'Unpicked' : o.status}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: '#1e88e5' }}>
                        {o.seller_id === sellerData.id ? 'Customer' : 'Direct'}
                      </span>
                    </td>
                    <td style={{ color: '#1e88e5', textAlign: 'center' }}>
                      <Eye size={18} style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => setSelectedOrder(o)} title="View Details" />
                      {o.seller_id === sellerData.id && (
                         <Edit size={18} style={{ cursor: 'pointer' }} onClick={() => { setEditingOrder(o); setNewOrderStatus(o.status); }} title="Edit Status" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  const renderMoneyWithdraw = () => (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Money Withdrawal</h2>
      
      <div className="dashboard-cards-container">
        <div className="dashboard-card bg-blue" style={{position: 'relative'}}>
          <div>
            <p className="card-subtitle">Wallet Balance</p>
            <h2 className="card-value">${availableBalance.toFixed(2)}</h2>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>Available for withdrawal</p>
          </div>
          <Building size={24} style={{ position: 'absolute', top: '25px', right: '25px', opacity: 0.8, backgroundColor: 'white', color: '#1e88e5', padding: '4px', borderRadius: '4px' }} />
        </div>
        <div className="dashboard-card bg-green" style={{position: 'relative'}}>
          <div>
            <p className="card-subtitle">Pending</p>
            <h2 className="card-value">${pendingAmount.toFixed(2)}</h2>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>Total pending amount</p>
          </div>
          <DollarSign size={32} style={{ position: 'absolute', top: '25px', right: '25px', opacity: 0.8 }} />
        </div>
      </div>

      <div className="profile-container" style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>Request a Withdrawal</h4>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#555' }}>Available Balance: <span style={{fontWeight: 'bold'}}>${availableBalance.toFixed(2)}</span></p>
        
        <div className="form-row">
          <div className="form-group">
            <label>Amount to Withdraw ($) *</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 15px' }}>
              <span style={{ color: '#555', marginRight: '5px' }}>$</span>
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{ width: '100%', padding: '12px 0', border: 'none', outline: 'none' }}/>
            </div>
            <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#888' }}>Maximum: ${availableBalance.toFixed(2)}</p>
          </div>
          <div className="form-group">
            <label>Payment Method *</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', appearance: 'none', backgroundColor: 'white', color: '#333' }}>
              <option value="USDT (TRC20)">USDT (TRC20)</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PayPal">PayPal</option>
            </select>
            <ChevronDown size={16} color="#888" style={{ position: 'absolute', right: '15px', top: '14px', pointerEvents: 'none' }}/>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Wallet Address / Details *</label>
          <input type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
          <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#888' }}>Enter your USDT address or bank/PayPal details</p>
        </div>

        <div className="form-group full-width">
          <label>Note (Optional)</label>
          <input type="text" value={withdrawNote} onChange={(e) => setWithdrawNote(e.target.value)} />
        </div>

        <button onClick={handleWithdrawRequest} style={{ backgroundColor: withdrawAmount && walletAddress ? '#1e88e5' : '#e0e0e0', color: withdrawAmount && walletAddress ? 'white' : '#999', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: (withdrawAmount && walletAddress) ? 'pointer' : 'not-allowed' }}>
          <Building size={16}/> REQUEST WITHDRAWAL
        </button>
      </div>

      <div className="table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>Withdrawal History</h4>
          <span onClick={() => fetchWithdrawals(sellerData.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#1e88e5', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}><RefreshCw size={14}/> REFRESH</span>
        </div>
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Note/Details</th>
            </tr>
          </thead>
          <tbody>
            {withdrawalHistory.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No withdrawal history found.</td>
              </tr>
            ) : (
              withdrawalHistory.map((w, index) => (
                <tr key={index}>
                  <td style={{ color: '#555' }}>{new Date(w.created_at).toLocaleString()}</td>
                  <td style={{ color: '#333', fontWeight: 'bold' }}>${parseFloat(w.amount).toFixed(2)}</td>
                  <td style={{ color: '#555' }}>{w.payment_method}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: w.status === 'Pending' ? '#ff9800' : w.status === 'Approved' ? '#4caf50' : '#f44336' }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ color: '#1e88e5', textDecoration: 'underline', cursor: 'pointer' }} title={w.wallet_address}>
                    Wallet Address
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderManageProfile = () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Manage Profile</h2>
      <div className="profile-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, color: '#333', fontWeight: 'normal', fontSize: '18px' }}>Personal Information</h4>
          {!isEditingProfile ? (
            <button onClick={() => setIsEditingProfile(true)} className="edit-btn"><Edit3 size={14}/> EDIT</button>
          ) : (
            <button onClick={() => setIsEditingProfile(false)} className="cancel-btn"><X size={14}/> CANCEL</button>
          )}
        </div>

        <p style={{ fontSize: '13px', color: '#555', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>Your Rating: <span style={{ color: '#ccc', letterSpacing: '2px', fontSize: '16px' }}>☆☆☆☆☆</span> (0.0)</p>

        <div className="form-row">
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.fullName : sellerData.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} className={isEditingProfile ? 'input-editing' : ''}/>
            <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#aaa' }}>Optional: Enter your full name</p>
          </div>
          <div className="form-group">
            <label>Your Phone</label>
            <input type="text" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.phoneNumber : sellerData.phoneNumber} onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})} className={isEditingProfile ? 'input-editing' : ''}/>
            <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#aaa' }}>Optional: Enter your contact number</p>
          </div>
        </div>

        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontWeight: 'normal', fontSize: '18px' }}>Email Settings</h4>
        <div className="form-group full-width">
          <label>Email Address *</label>
          <input type="email" readOnly={!isEditingProfile} value={isEditingProfile ? profileForm.email : sellerData.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className={isEditingProfile ? 'input-editing' : ''}/>
        </div>

        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontWeight: 'normal', fontSize: '18px' }}>Change Password</h4>
        <div className="form-row">
          <div className="form-group">
            <input type="password" readOnly={!isEditingProfile} placeholder="Current Password" style={{backgroundColor: isEditingProfile ? 'white' : '#fafafa'}} />
          </div>
          <div className="form-group">
            <input type="password" readOnly={!isEditingProfile} placeholder="New Password" style={{backgroundColor: isEditingProfile ? 'white' : '#fafafa'}} />
          </div>
        </div>

        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontWeight: 'normal', fontSize: '18px' }}>Payment Methods</h4>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#555' }}>Select your preferred payment methods</p>
        
        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '14px' }}>
            <input type="checkbox" disabled={!isEditingProfile} style={{ width: '16px', height: '16px' }} /> Cash Payment
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '14px' }}>
            <input type="checkbox" disabled={!isEditingProfile} style={{ width: '16px', height: '16px' }} /> Bank Payment
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '14px' }}>
            <input type="checkbox" disabled={!isEditingProfile} style={{ width: '16px', height: '16px' }} /> USDT Payment
          </label>
        </div>

        {isEditingProfile && (
          <button onClick={handleUpdateProfile} className="save-profile-btn">SAVE CHANGES</button>
        )}
      </div>
    </div>
  );

  const renderShopSettings = () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Shop Settings</h2>
      <div className="profile-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', fontWeight: 'normal' }}>Shop Information</h4>
          {!isEditingShop ? (
            <button onClick={() => setIsEditingShop(true)} className="edit-btn"><Edit3 size={14}/> EDIT</button>
          ) : (
            <button onClick={() => setIsEditingShop(false)} className="cancel-btn"><X size={14}/> CANCEL</button>
          )}
        </div>

        <div className="form-group full-width">
          <label>Shop Name *</label>
          <input type="text" readOnly={!isEditingShop} value={isEditingShop ? shopForm.shopName : sellerData.shopName} onChange={(e) => setShopForm({...shopForm, shopName: e.target.value})} className={isEditingShop ? 'input-editing' : ''}/>
        </div>

        <div className="form-group full-width">
          <label>Email *</label>
          <input type="email" readOnly={!isEditingShop} value={isEditingShop ? shopForm.email : sellerData.email} onChange={(e) => setShopForm({...shopForm, email: e.target.value})} className={isEditingShop ? 'input-editing' : ''}/>
        </div>

        <div className="form-group full-width" style={{marginBottom: '30px'}}>
          <label>Phone *</label>
          <input type="text" readOnly={!isEditingShop} value={isEditingShop ? shopForm.phoneNumber : sellerData.phoneNumber} onChange={(e) => setShopForm({...shopForm, phoneNumber: e.target.value})} className={isEditingShop ? 'input-editing' : ''}/>
        </div>

        {isEditingShop && (
          <button onClick={handleUpdateShop} className="save-profile-btn">SAVE CHANGES</button>
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
          .header { background-color: #ff5722; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; color: white; z-index: 20; position: relative; }
          .logo-container { display: flex; alignItems: center; cursor: pointer; max-width: 150px; }
          .logo-container img { width: 100%; height: auto; max-height: 60px; object-fit: contain; } 
          .header-right { display: flex; gap: 20px; align-items: center; font-size: 12px; font-weight: bold; }
          .mobile-menu-btn { display: none; background: none; border: none; color: white; cursor: pointer; padding: 5px; }

          /* Layout */
          .body-container { display: flex; flex: 1; overflow: hidden; position: relative; }
          
          /* Sidebar */
          .sidebar { width: 260px; background-color: #ff5722; color: white; display: flex; flex-direction: column; transition: transform 0.3s ease; z-index: 15; flex-shrink: 0;}
          .sidebar-profile { padding: 30px 20px 20px; text-align: center; }
          .nav-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; cursor: pointer; border-left: 4px solid transparent; transition: background-color 0.2s; }
          .nav-item.active { background-color: #e64a19; border-left-color: white; }
          .nav-item-content { display: flex; align-items: center; gap: 15px; font-size: 14px; }
          .nav-item.active .nav-item-content { font-weight: bold; }

          /* Notification Badge CSS */
          .notif-badge { background-color: #ff3d00; color: white; border-radius: 50%; padding: 2px 6px; font-size: 11px; font-weight: bold; display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; }
          
          /* Main Content */
          .content-area { flex: 1; padding: 40px 50px; overflow-y: auto; background-color: #f8f9fb; }
          .section-title { font-size: 20px; color: #333; margin-bottom: 20px; border-bottom: 2px solid #ff5722; display: inline-block; padding-bottom: 5px; }
          
          /* Dashboard Cards (New Color Scheme) */
          .dashboard-cards-container { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
          .dashboard-card { flex: 1; min-width: 200px; color: white; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.2s; }
          .dashboard-card:hover { transform: translateY(-3px); }
          .bg-green { background-color: #5cb85c; box-shadow: 0 4px 10px rgba(92, 184, 92, 0.3); }
          .bg-blue { background-color: #42a5f5; box-shadow: 0 4px 10px rgba(66, 165, 245, 0.3); }
          .bg-orange { background-color: #ffa726; box-shadow: 0 4px 10px rgba(255, 167, 38, 0.3); }
          .bg-pink { background-color: #ec407a; box-shadow: 0 4px 10px rgba(236, 64, 122, 0.3); }
          .card-subtitle { margin: 0 0 5px 0; font-size: 13px; }
          .card-value { margin: 0; font-size: 28px; }
          .card-icon-bg { background-color: rgba(255,255,255,0.2); padding: 10px; border-radius: 50%; }

          /* Middle & Bottom Sections */
          .middle-section-container { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
          .card-box { background-color: white; border-radius: 8px; padding: 20px; border: 1px solid #eee; flex: 1; min-width: 250px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
          .card-box-title { color: #1e88e5; margin: 0 0 20px 0; font-size: 15px; }
          
          .sales-chart { display: flex; height: 150px; align-items: flex-end; border-bottom: 1px solid #eee; padding-bottom: 10px; gap: 5px; }
          .sales-chart-label { font-size: 11px; color: #888; text-align: center; margin-top: 10px; }
          
          .category-list { list-style: none; padding: 0; margin: 0; font-size: 13px; color: #555; display: flex; flex-direction: column; gap: 12px; }
          .category-list li { display: flex; justify-content: space-between; border-bottom: 1px solid #f9f9f9; padding-bottom: 5px; }
          .cat-count { color: #1e88e5; font-weight: bold; }

          .order-stat-row { display: flex; align-items: center; gap: 15px; }

          /* Shortcuts */
          .shortcuts-container { display: flex; gap: 20px; flex-wrap: wrap; }
          .shortcut-card { flex: 1; min-width: 140px; background-color: white; padding: 25px; border-radius: 8px; border: 1px solid #eee; text-align: center; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.02); transition: transform 0.2s; }
          .shortcut-card:hover { transform: translateY(-5px); }

          /* Products */
          .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
          .seller-product-card { background-color: white; border-radius: 8px; border: 1px solid #eaeaea; padding: 15px; position: relative; display: flex; flex-direction: column; }
          .product-badge { position: absolute; top: 15px; right: 15px; background-color: #2e7d32; color: white; font-size: 11px; padding: 3px 10px; border-radius: 15px; font-weight: bold; z-index: 2; }
          .product-image-container { height: 180px; background-color: #f5f6f8; border-radius: 6px; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; padding: 10px; }
          
          /* Modals */
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
          .modal-content { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; }
          .modal-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; box-sizing: border-box; outline: none; }
          .modal-input.no-margin { margin-bottom: 0; }
          .modal-textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; box-sizing: border-box; outline: none; min-height: 80px; resize: vertical; }

          /* Tables */
          .table-container { background-color: white; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 2px 10px rgba(0,0,0,0.02); overflow-x: auto; }
          .responsive-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; min-width: 600px; }
          .responsive-table th { padding: 15px; background-color: #1e88e5; color: white; }
          .responsive-table td { padding: 15px; border-bottom: 1px solid #eee; }
          .status-badge { color: white; padding: 4px 10px; border-radius: 15px; font-size: 11px; font-weight: bold; }

          /* Order Details Layout */
          .order-details-container { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
          .order-sidebar { background-color: white; border: 1px solid #eee; border-radius: 8px; padding: 20px; width: 350px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
          .order-items-main { flex: 1; min-width: 300px; background-color: white; border: 1px solid #eee; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
          .table-wrapper { overflow-x: auto; }

          /* Enhanced Chat Styles */
          .chat-container { height: calc(100vh - 120px); display: flex; background-color: white; border-radius: 8px; border: 1px solid #eee; overflow: hidden; }
          .chat-sidebar { width: 250px; border-right: 1px solid #eee; background-color: #fafafa; display: flex; flex-direction: column; flex-shrink: 0; }
          .chat-sidebar-header { padding: 15px; background-color: #1e88e5; color: white; font-weight: bold; display: flex; align-items: center; gap: 10px; }
          .chat-contact { padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center; gap: 10px; color: #555; }
          .chat-contact.active { background-color: #e3f2fd; font-weight: bold; color: #1e88e5; }
          .chat-main { flex: 1; display: flex; flex-direction: column; background-color: #fff; min-width: 0; }
          .chat-header-blue { padding: 15px 20px; background-color: #1e88e5; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
          .chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background-color: #f8f9fa; }
          
          /* Updated Chat Bubble Styles */
          .chat-message-row { display: flex; gap: 10px; align-items: flex-end; }
          .chat-message-row.sent { justify-content: flex-end; }
          .chat-message-row.received { justify-content: flex-start; }
          .chat-bubble { padding: 12px 16px; font-size: 14px; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; box-shadow: 0 1px 2px rgba(0,0,0,0.05); width: fit-content; max-width: 100%; display: inline-block; }
          .sent-bubble { background-color: #1e88e5; color: white; border-radius: 15px 15px 0 15px; }
          .received-bubble { background-color: white; color: #333; border-radius: 15px 15px 15px 0; border: 1px solid #e0e0e0; }
          .system-bubble { background-color: white; color: #555; border-radius: 8px; border: 1px solid #e0e0e0; font-size: 13px; max-width: 90%; margin: 0 auto; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          .chat-avatar-icon { width: 32px; height: 32px; background-color: #e0e0e0; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
          
          .chat-input-area { padding: 15px; background-color: white; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
          .upload-btn { background-color: transparent; border: none; cursor: pointer; color: #888; border-radius: 50%; padding: 5px; }
          .upload-btn.has-file { background-color: #e3f2fd; color: #1e88e5; }
          .file-name { font-size: 11px; color: #1e88e5; max-width: 50px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .chat-input { flex: 1; padding: 15px 20px; border: 1px solid #ddd; border-radius: 25px; outline: none; font-size: 14px; min-width: 100px; background-color: #f9f9f9; }
          .send-btn { border: none; display: flex; justify-content: center; align-items: center; cursor: pointer; flex-shrink: 0; }
          .empty-chat-state { flex: 1; display: flex; justify-content: center; align-items: center; color: #888; flex-direction: column; gap: 10px; }
          .back-btn-mobile { display: none; background: none; border: none; cursor: pointer; padding: 0; }

          /* Profile */
          .profile-container { background-color: white; padding: 30px; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
          .edit-btn { border: 1px solid #1e88e5; color: #1e88e5; background-color: transparent; padding: 5px 15px; border-radius: 4px; display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; font-weight: bold; }
          .cancel-btn { border: 1px solid #f44336; color: #f44336; background-color: transparent; padding: 5px 15px; border-radius: 4px; display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; font-weight: bold; }
          .form-row { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
          .form-group { flex: 1; min-width: 200px; position: relative; }
          .form-group.full-width { margin-bottom: 20px; width: 100%; }
          .form-group label { position: absolute; top: -8px; left: 10px; background-color: white; padding: 0 5px; font-size: 11px; color: #888; z-index: 1; }
          .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; outline: none; box-sizing: border-box; }
          .input-editing { border-color: #1e88e5 !important; }
          .save-profile-btn { background-color: #1e88e5; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; }

          /* --- MEDIA QUERIES FOR RESPONSIVENESS --- */
          @media (max-width: 992px) {
            .content-area { padding: 30px; }
            .order-sidebar { width: 100%; }
          }

          @media (max-width: 768px) {
            .header { padding: 15px 20px; }
            .mobile-menu-btn { display: block; }
            .sidebar { position: absolute; top: 0; left: 0; height: 100%; z-index: 100; transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 90; }
            .sidebar-overlay.open { display: block; }
            .content-area { padding: 20px; }
            .dashboard-cards-container { flex-direction: column; }
            .middle-section-container { flex-direction: column; }
            .shortcuts-container { flex-direction: column; }
            .hidden-mobile { display: none !important; }
            .back-btn-mobile { display: block; }
            .chat-sidebar { width: 100%; border-right: none; }
            .form-row { flex-direction: column; gap: 15px; }
          }

          @media (max-width: 480px) {
            .header-right { font-size: 11px; }
            .logo-container img { max-height: 40px; } 
            .products-grid { grid-template-columns: 1fr; } 
          }
        `}
      </style>

      {/* HEADER */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>
          
          <div className="logo-container" onClick={() => window.location.href = '/'}>
            <img src={logoImage} alt="Weyfeir Logo" />
          </div>
        </div>

        <div className="header-right">
          <span style={{ cursor: 'pointer' }} onClick={() => handleTabChange('dashboard')}>MY DASHBOARD</span>
          <div onClick={handleLogout} style={{ cursor: 'pointer' }}>LOGOUT</div>
        </div>
      </header>

      {/* BODY */}
      <div className="body-container">
        
        {/* Mobile Sidebar Overlay */}
        <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

        {/* SIDEBAR */}
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          
          <div className="sidebar-profile">
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{sellerData.shopName}</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#ffe0b2' }}>{sellerData.email}</p>
          </div>

          <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
            {[
              { id: 'dashboard', icon: <Home size={18} />, text: 'Dashboard', badge: 0 },
              { id: 'products', icon: <Box size={18} />, text: 'Products', badge: 0 },
            ].map(item => (
              <div 
                key={item.id} 
                onClick={() => handleTabChange(item.id)} 
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <div className="nav-item-content">
                   {item.icon}
                   <span>{item.text}</span>
                </div>
                {item.badge > 0 && <span className="notif-badge">{item.badge}</span>}
              </div>
            ))}
            
            {/* Orders Dropdown with Badge */}
            <div>
              <div onClick={handleOrdersToggle} className={`nav-item ${(activeTab === 'all-orders' || activeTab === 'direct-orders') ? 'active' : ''}`}>
                <div className="nav-item-content">
                  <ShoppingCart size={18} /> <span>Orders</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  {newOrdersBadge > 0 && <span className="notif-badge">{newOrdersBadge}</span>}
                  {isOrdersOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </div>
              </div>
              {isOrdersOpen && (
                <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '5px 0' }}>
                  <div onClick={() => { handleTabChange('all-orders'); setSelectedOrder(null); }} style={{ padding: '10px 30px 10px 65px', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'all-orders' ? 'bold' : 'normal', color: activeTab === 'all-orders' ? 'white' : '#ffe0b2' }}>All Orders</div>
                  <div onClick={() => { handleTabChange('direct-orders'); setSelectedOrder(null); }} style={{ padding: '10px 30px 10px 65px', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'direct-orders' ? 'bold' : 'normal', color: activeTab === 'direct-orders' ? 'white' : '#ffe0b2' }}>Direct Orders</div>
                </div>
              )}
            </div>

            {[
              { id: 'money', icon: <Wallet size={18} />, text: 'Money Withdraw', badge: 0 },
              { id: 'chat', icon: <MessageSquare size={18} />, text: 'Conversations', badge: newChatBadge },
              { id: 'profile', icon: <User size={18} />, text: 'Manage Profile', badge: 0 },
              { id: 'settings', icon: <Settings size={18} />, text: 'Shop Setting', badge: 0 }
            ].map(item => (
              <div 
                key={item.id} 
                onClick={() => handleTabChange(item.id)} 
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <div className="nav-item-content">
                   {item.icon}
                   <span>{item.text}</span>
                </div>
                {item.badge > 0 && <span className="notif-badge">{item.badge}</span>}
              </div>
            ))}
          </nav>

          <div style={{ padding: '20px' }}>
            <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
              <LogOut size={16}/> <span style={{fontSize: '14px'}}>Logout</span>
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="content-area">
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