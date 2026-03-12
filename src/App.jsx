import React from 'react';
import './index.css';
import heroIllustration from './assets/hero-illustration.png';

function App() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <a href="/" className="logo">learno.</a>
        <div className="nav-links">
          <a href="#courses">Courses</a>
          <a href="#about">About</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#pricing">Pricing</a>
        </div>
        <button className="cta-login">Log In</button>
      </nav>

      <section className="hero">
        <div className="blob-shape-1"></div>
        <div className="blob-shape-2"></div>
        <div className="blob-shape-3"></div>

        <div className="hero-content">
          <div className="pill-badge">New: Interactive Python Course 🚀</div>
          <h1>Unlock the joy of<br />always learning</h1>
          <p>
            Experience a new, playful way of mastering creative and technical skills. Learn at your own pace with our modern SaaS platform built for modern minds.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary">Start Learning Free</button>
            <button className="btn-secondary">Explore Courses</button>
          </div>

          <div className="hero-image-wrapper">
            <img 
              src={heroIllustration} 
              alt="Playful vector illustration of people learning" 
              className="hero-image"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
