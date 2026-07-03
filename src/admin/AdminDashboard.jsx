import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Store, ArrowDownToLine, LogOut, CheckCircle, XCircle, ShoppingCart, Search } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ customers: 0, sellers: 0, orders: 0, revenue: 0 });
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedSellerFilter, setSelectedSellerFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.buystore.io';

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, custRes, sellRes, withRes, ordRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`),
        fetch(`${API_URL}/api/admin/customers`),
        fetch(`${API_URL}/api/admin/sellers`),
        fetch(`${API_URL}/api/admin/withdrawals`),
        fetch(`${API_URL}/api/admin/orders`)
      ]);

      setStats(await statsRes.json());
      setCustomers(await custRes.json());
      setSellers(await sellRes.json());
      setWithdrawals(await withRes.json());
      if (ordRes.ok) {
        setOrders(await ordRes.json());
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        fetchData();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleWithdrawalStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/withdrawals/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating withdrawal:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Buystore Admin</h2>
        </div>
        <nav className="admin-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Overview
          </button>
          <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>
            <Users size={20} /> Customers
          </button>
          <button className={activeTab === 'sellers' ? 'active' : ''} onClick={() => setActiveTab('sellers')}>
            <Store size={20} /> Sellers
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <ShoppingCart size={20} /> Orders
          </button>
          <button className={activeTab === 'withdrawals' ? 'active' : ''} onClick={() => setActiveTab('withdrawals')}>
            <ArrowDownToLine size={20} /> Withdrawals
          </button>
        </nav>
        <button className="admin-logout" onClick={handleLogout}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="admin-overview">
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-value">${Number(stats.revenue).toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-value">{stats.orders}</p>
              </div>
              <div className="stat-card">
                <h3>Total Customers</h3>
                <p className="stat-value">{stats.customers}</p>
              </div>
              <div className="stat-card">
                <h3>Total Sellers</h3>
                <p className="stat-value">{stats.sellers}</p>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="admin-table-container">
              <h2>Registered Customers</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td>{c.fullName}</td>
                      <td>{c.email}</td>
                      <td>{c.phoneNumber}</td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'sellers' && (
            <div className="admin-table-container">
              <h2>Registered Sellers</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Shop Name</th>
                    <th>Owner Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Orders Count</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map(s => {
                    const sellerOrdersCount = orders.filter(o => o.seller_id === s.id).length;
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 'bold' }}>{s.shopName}</td>
                        <td>{s.fullName}</td>
                        <td>{s.email}</td>
                        <td>{s.phoneNumber}</td>
                        <td>
                          <span className="seller-orders-badge">{sellerOrdersCount} orders</span>
                        </td>
                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedSellerFilter(s.id.toString());
                              setActiveTab('orders');
                            }}
                            className="btn-view-orders"
                          >
                            <ShoppingCart size={14} /> Manage Orders
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="admin-table-container">
              <h2>Withdrawal Requests</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Wallet/Details</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map(w => (
                    <tr key={w.id}>
                      <td>{w.shopName} ({w.email})</td>
                      <td>${Number(w.amount).toFixed(2)}</td>
                      <td>{w.payment_method}</td>
                      <td>{w.wallet_address}</td>
                      <td>
                        <span className={`status-badge ${w.status ? w.status.toLowerCase() : ''}`}>{w.status}</span>
                      </td>
                      <td>
                        {w.status === 'Pending' && (
                          <div className="action-buttons">
                            <button onClick={() => handleWithdrawalStatus(w.id, 'Approved')} className="btn-approve">
                              <CheckCircle size={18} /> Approve
                            </button>
                            <button onClick={() => handleWithdrawalStatus(w.id, 'Rejected')} className="btn-reject">
                              <XCircle size={18} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (() => {
            const filteredOrders = orders.filter(o => {
              if (selectedSellerFilter !== 'ALL' && o.seller_id?.toString() !== selectedSellerFilter) return false;
              if (selectedStatusFilter !== 'ALL' && o.status !== selectedStatusFilter) return false;
              if (orderSearchTerm.trim()) {
                const term = orderSearchTerm.toLowerCase();
                const matchOrderNo = o.order_number?.toLowerCase().includes(term);
                const matchShop = o.shopName?.toLowerCase().includes(term) || o.sellerName?.toLowerCase().includes(term);
                const matchProduct = o.product_name?.toLowerCase().includes(term);
                const matchCustomer = o.customerName?.toLowerCase().includes(term) || o.shipping_name?.toLowerCase().includes(term);
                if (!matchOrderNo && !matchShop && !matchProduct && !matchCustomer) return false;
              }
              return true;
            });

            return (
              <div className="admin-table-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0 }}>Orders Management (All Sellers)</h2>
                  {selectedSellerFilter !== 'ALL' && (
                    <button onClick={() => setSelectedSellerFilter('ALL')} style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                      Filtered by Seller ID: {selectedSellerFilter} (Show All)
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Search Orders</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px' }}>
                      <Search size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
                      <input
                        type="text"
                        placeholder="Order ID, Shop, Product, Customer..."
                        value={orderSearchTerm}
                        onChange={e => setOrderSearchTerm(e.target.value)}
                        style={{ border: 'none', outline: 'none', padding: '8px 0', width: '100%', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <div style={{ minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Filter by Seller</label>
                    <select
                      value={selectedSellerFilter}
                      onChange={e => setSelectedSellerFilter(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', fontSize: '14px', color: '#1e293b', outline: 'none' }}
                    >
                      <option value="ALL">All Sellers ({orders.length} orders)</option>
                      {sellers.map(s => (
                        <option key={s.id} value={s.id.toString()}>
                          {s.shopName} ({s.fullName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ minWidth: '160px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Filter by Status</label>
                    <select
                      value={selectedStatusFilter}
                      onChange={e => setSelectedStatusFilter(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', fontSize: '14px', color: '#1e293b', outline: 'none' }}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Seller / Shop</th>
                      <th>Customer Info</th>
                      <th>Product & Qty</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                          No orders found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{o.order_number}</td>
                          <td>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{o.shopName || 'N/A'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{o.sellerEmail || o.sellerName}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '500', color: '#334155' }}>{o.shipping_name || o.customerName || 'Direct Order'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{o.shipping_phone || ''}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '500', color: '#1e293b' }}>{o.product_name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Qty: {o.quantity} (${Number(o.price).toFixed(2)} ea)</div>
                          </td>
                          <td style={{ fontWeight: 'bold', color: '#059669' }}>${Number(o.total_price).toFixed(2)}</td>
                          <td style={{ fontSize: '13px', color: '#475569' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td>
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                              className={`admin-order-status-select ${o.status ? o.status.toLowerCase() : ''}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
