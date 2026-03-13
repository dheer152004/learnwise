import React, { useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import heroIllustration from '../hero-illustration.png';

const Home = memo(function Home() {
  const navigate = useNavigate();
  const handleExploreCourses = useCallback(() => {
    navigate('/courses');
  }, [navigate]);

  return (
    <>
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
            <button className="btn-secondary" onClick={handleExploreCourses}>Explore Courses</button>
          </div>

          <div className="hero-image-wrapper">
            <img 
              src={heroIllustration} 
              alt="Playful vector illustration of people learning" 
              className="hero-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Master new skills in three simple steps.</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Choose a Path</h3>
            <p>Select from our wide range of interactive courses tailored to your goals.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Learn by Doing</h3>
            <p>Engage with bite-sized lessons and hands-on projects designed for retention.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Achieve Mastery</h3>
            <p>Earn certificates and build a portfolio that showcases your newfound expertise.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Platform Features</h2>
          <p>Everything you need to succeed.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-primary">✨</div>
            <h3>Interactive Playground</h3>
            <p>Write and execute code directly in your browser with real-time feedback.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-secondary">🎯</div>
            <h3>Personalized Learning</h3>
            <p>AI-driven recommendations adapt to your learning speed and style.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-accent">🏆</div>
            <h3>Gamified Experience</h3>
            <p>Earn points, unlock badges, and compete on global leaderboards.</p>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="testimonials" className="testimonials">
        <div className="section-header">
          <h2>What Our Learners Say</h2>
          <p>Join thousands of happy students worldwide.</p>
        </div>
        <div className="testimonial-card">
          <div className="quote-icon">"</div>
          <p className="testimonial-text">
            Learno completely transformed the way I approach coding. The interactive exercises made complex concepts feel like a breeze. Highly recommended!
          </p>
          <div className="testimonial-author">
            <div className="author-avatar">S</div>
            <div className="author-info">
              <h4>Sarah Jenkins</h4>
              <span>Frontend Developer</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export default Home;
