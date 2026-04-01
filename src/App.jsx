import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import HomePage from './pages/Homepage'; 

// Import Customer Auth & Dashboard
import CustomerLogin from './customer/CustomerLogin';
import CustomerRegistration from './customer/CustomerRegistration';
import CustomerDashboard from './customer/CustomerDashboard';

// Import Seller Auth & Dashboard
import SellerLogin from './seller/SellerLogin';
import SellerRegistration from './seller/SellerRegistration';
import SellerDashboard from './seller/SellerDashboard';

// Import Global Components
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      {/* Global Wrapper forcing full width and column layout */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', margin: 0, padding: 0 }}>
        
        {/* Main Content Area - flex: 1 pushes the footer to the bottom */}
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Main Store Route */}
            <Route path="/" element={<HomePage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/seller-login" element={<SellerLogin />} />
            <Route path="/register" element={<CustomerRegistration />} />
            <Route path="/seller-register" element={<SellerRegistration />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
          </Routes>
        </div>

        {/* FOOTER ROUTING LOGIC:
            Dashboards take up the full screen, so we don't want the Footer there.
            This tells React: "If the URL is /dashboard or /seller-dashboard, show nothing (null). 
            For every other page (*), show the Footer!"
        */}
        <Routes>
          <Route path="/dashboard" element={null} />
          <Route path="/seller-dashboard" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;