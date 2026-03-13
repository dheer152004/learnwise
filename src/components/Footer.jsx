import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="logo">learno.</Link>
          <p>Empowering the world to learn seamlessly.</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-column">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/security">Security</Link>
            <Link to="/download">Download</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/helpcenter">Help Center</Link>
            <Link to="/documentation">Documentation</Link>
            <Link to="/api">API</Link>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/press">Press</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
            <Link to="/gdpr">GDPR</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} learno. all right reserved</p>
      </div>
    </footer>
  );
});

export default Footer;
