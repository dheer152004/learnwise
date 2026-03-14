import React, { useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = memo(function Home() {
  const navigate = useNavigate();
  const handleExploreCourses = useCallback(() => {
    navigate('/courses');
  }, [navigate]);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-ring ring-1"></div>
        <div className="hero-bg-ring ring-2"></div>

        <div className="hero-inner">
          <div className="hero-left">
            <span className="badge">✦ New: Interactive Labs</span>
            <h1>
              The joy of<br />
              <em>actually</em> learning.
            </h1>
            <p className="hero-sub">
              Bite-sized lessons, real projects, and a path that adapts to how your brain works — not how textbooks do.
            </p>
            <div className="hero-actions">
              <button className="btn-fill">Start for Free</button>
              <button className="btn-ghost" onClick={handleExploreCourses}>
                Browse Courses <span className="arrow">→</span>
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <strong>Nil</strong>
                <span>Students</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <strong>6</strong>
                <span>Labs</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <strong>4.9★</strong>
                <span>Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="card-stack">
              <div className="floating-card card-top">
                <span className="card-emoji">🧪</span>
                <div>
                  <p className="card-label">New Lab</p>
                  <p className="card-title">Chemistry: Thermite Reaction</p>
                </div>
                <div className="progress-ring">
                  <svg viewBox="0 0 36 36" width="40" height="40">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e9e3fa" strokeWidth="3" />
                    {/* <circle cx="18" cy="18" r="15" fill="none" stroke="#7c5cbf" strokeWidth="3"
                      strokeDasharray="62 34" strokeDashoffset="10" strokeLinecap="round" /> */}
                  </svg>
                  <span>0%</span>
                </div>
              </div>

              <div className="hero-main-card">
                <div className="subject-grid">
                  {[
                    { icon: '⚛️', name: 'Physics', color: '#e8f4fd' },
                    { icon: '🧪', name: 'Chemistry', color: '#fef3e8' },
                    { icon: '📐', name: 'Maths', color: '#e8fdf0' },
                    { icon: '📖', name: 'Biology', color: '#fde8e8' },
                    { icon: '💻', name: 'CS / Code', color: '#f3e8fd' },
                  ].map(s => (
                    <div className="subject-chip" key={s.name} style={{ background: s.color }}>
                      <span>{s.icon}</span>
                      <p>{s.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="floating-card card-bottom">
                <span className="card-emoji">🏆</span>
                <div>
                  <p className="card-label">Achievement Unlocked</p>
                  <p className="card-title">Physics Newbie → Explorer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="section-label">HOW IT WORKS</div>
        <h2>Three steps to mastery</h2>
        <div className="steps-row">
          {[
            { num: '01', title: 'Pick your path', body: 'School or college — choose subjects that match your grade and goals.' },
            { num: '02', title: 'Learn by doing', body: 'Hands-on exercises, quizzes, and projects — no passive reading.' },
            { num: '03', title: 'Increase Learning', body: 'Make your learning more effective and efficient.' },
          ].map(step => (
            <div className="step-item" key={step.num}>
              <div className="step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-inner">
          <div className="features-text">
            <div className="section-label">FEATURES</div>
            <h2>Built for how you actually study</h2>
            <p>We threw out the boring lecture format and built something that keeps you in the zone.</p>
          </div>
          <div className="features-cards">
            {[
              { icon: '⚡', title: 'Live Code Playground', desc: 'Write, run, and debug code right in the browser. No setup, no excuses.' },
              { icon: '🧠', title: 'Adaptive Practice', desc: 'Questions get harder as you get better. No busywork — just the right challenge.' },
              { icon: '🤖', title: 'Ai Review', desc: 'Get personalized feedback on your work from our AI tutor.' },
            ].map(f => (
              <div className="feat-card" key={f.title}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial-section">
        <div className="testimonial-inner">
          <div className="big-quote">"</div>
          <blockquote>
            CurioLab turned Physics from my most-dreaded subject into something I actually look forward to every day.
          </blockquote>
          <div className="testi-author">
            <div className="avatar">A</div>
            <div>
              <strong>Aryan Mehta</strong>
              <span>Class 11, Delhi</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h2>Ready to start your streak?</h2>
        <p>Join to get started.</p>
        <button className="btn-fill large" onClick={handleExploreCourses}>Explore Courses →</button>
      </section>
    </>
  );
});

export default Home;