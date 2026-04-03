import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Store } from 'lucide-react';
// Import brand icons from react-icons (FontAwesome suite)
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaApple, FaGooglePlay } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#ff624d', color: 'white', fontFamily: 'sans-serif', paddingTop: '50px' }}>
      
      {/* Main Footer Content */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', padding: '0 50px', maxWidth: '1200px', margin: '0 auto', gap: '30px' }}>
        
        {/* Column 1: About */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>About Our Store</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', color: '#ffe4e1' }}>
            We provide high-quality products from trusted sellers worldwide. Our mission is to connect buyers with the best products at great prices.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <FaFacebook size={20} style={{ cursor: 'pointer' }} />
            <FaTwitter size={20} style={{ cursor: 'pointer' }} />
            <FaInstagram size={20} style={{ cursor: 'pointer' }} />
            <FaLinkedin size={20} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Link to="/" style={{ color: '#ffe4e1', textDecoration: 'none', fontSize: '15px' }}>Home</Link>
            
            <Link to="/seller-register" style={{ textDecoration: 'none' }}>
              <button style={{ backgroundColor: '#ffea00', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}>
                <Store size={18} /> Apply Now
              </button>
            </Link>
          </div>
        </div>

        {/* Column 3: Contact Us */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Contact Us</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#ffe4e1', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Phone size={18} style={{ marginTop: '3px' }} />
              <span>Call us 24/7<br/><strong>+91 808 9140562</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ marginTop: '3px' }} />
              <span>502 Market Street, San Francisco,<br/>CA 94105, USA</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Mail size={18} />
              <span>info@buystore.io</span>
            </div>
          </div>
        </div>

        {/* Column 4: App Download */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>APP DOWNLOAD</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', color: '#ffe4e1' }}>
            Get our mobile app for a better shopping experience
          </p>
          
          {/* Mock Google Play Button */}
          <div style={{ backgroundColor: 'black', color: 'white', padding: '8px 15px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', width: '160px', cursor: 'pointer' }}>
            <FaGooglePlay size={22} color="#4285F4" />
            <div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>GET IT ON</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Google Play</div>
            </div>
          </div>

          {/* Mock App Store Button */}
          <div style={{ backgroundColor: 'black', color: 'white', padding: '8px 15px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', width: '160px', cursor: 'pointer' }}>
            <FaApple size={26} color="white" />
            <div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>Download on the</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>App Store</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '40px', padding: '20px 0', textAlign: 'center', fontSize: '13px', color: '#ffe4e1' }}>
        © 2017 DelightSphere Shopping Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;