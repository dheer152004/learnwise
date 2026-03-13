import React, { memo } from 'react';

const categories = [
  { title: 'Physics', icon: '🔭', color: 'bg-primary', desc: 'Master the laws of nature and mechanics.' },
  { title: 'Chemistry', icon: '🧪', color: 'bg-secondary', desc: 'Explore reactions, elements, and compounds.' },
  { title: 'Math', icon: '➗', color: 'bg-accent', desc: 'From algebra to advanced calculus.' },
  { title: 'Development', icon: '💻', color: 'bg-primary', desc: 'Web apps, mobile apps, and software engineering.' },
  { title: 'DSA', icon: '🧠', color: 'bg-secondary', desc: 'Data structures and algorithms for interviews.' },
  { title: 'System Design', icon: '🏗️', color: 'bg-accent', desc: 'Design scalable and robust architectures.' },
];

const Courses = memo(function Courses() {
  return (
    <div className="courses-page">
      <div className="section-header">
        <h2>Explore Our Courses</h2>
        <p>Choose a category below to start learning.</p>
      </div>

      <div className="courses-grid">
        {categories.map((cat, idx) => (
          <div key={idx} className="course-card">
            <div className={`feature-icon ${cat.color}`}>{cat.icon}</div>
            <h3>{cat.title}</h3>
            <p>{cat.desc}</p>
            <button className="btn-secondary" style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem' }}>
              View Path
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Courses;
