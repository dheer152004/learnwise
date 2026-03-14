import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const subjects = [
  { title: 'Physics', path: '/courses/school/physics', icon: '⚡', color: 'bg-primary', desc: 'Dive deep into kinematics and electromagnetism.' },
  { title: 'Chemistry', path: '/courses/school/chemistry', icon: '🧪', color: 'bg-secondary', desc: 'Explore reactions and molecular structures.' },
  { title: 'Math', path: '/courses/school/math', icon: '➗', color: 'bg-accent', desc: 'Master algebra, geometry, and calculus.' },
  { title: 'Biology', path: '/courses/school/bio', icon: '🧬', color: 'bg-primary', desc: 'Study genetics and human anatomy.' },
];

const School = memo(function School() {
  const navigate = useNavigate();

  return (
    <div className="courses-page">
      <div className="section-header">
        <h2>School Level Courses</h2>
        <p>Master the foundational laws of logic and nature.</p>
      </div>

      <div className="courses-grid">
        {subjects.map((sub, idx) => (
          <div key={idx} className="course-card">
            <div className={`feature-icon ${sub.color}`}>{sub.icon}</div>
            <h3>{sub.title}</h3>
            <p>{sub.desc}</p>
            <button 
              className="btn-primary" 
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem' }}
              onClick={() => {
                if (sub.title === 'Math') {
                  window.open('/src/assets/pages/courses/school/Maths/maths.html', '_blank');
                } else if (sub.title === 'Biology') {
                  window.open('/src/assets/pages/courses/school/Biology/bio_index.html', '_blank');
                } else {
                  navigate(sub.path);
                }
              }}
            >
              Start Learning
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default School;
