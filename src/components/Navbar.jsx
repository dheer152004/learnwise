import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const Navbar = memo(function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">learno.</Link>
      <div className="nav-links">
        <Link to="/courses">Courses</Link>
        <Link to="/about">About</Link>
        <Link to="/#testimonials">Testimonials</Link>
        <Link to="/pricing">Pricing</Link>
      </div>
      <button className="cta-login">Log In</button>
    </nav>
  );
});

export default Navbar;
