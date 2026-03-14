import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const schoolSubjects = [
  { icon: '⚛️', name: 'Physics', path: '/courses/physics', desc: 'Mechanics, light, electricity & more', tag: 'Class 9–12', color: '#e8f4fd', accent: '#3b82f6' },
  { icon: '🧪', name: 'Chemistry', path: '/courses/chemistry', desc: 'Atoms, reactions, organic basics', tag: 'Class 9–12', color: '#fef3e8', accent: '#f97316' },
  { icon: '📐', name: 'Mathematics', path: '/courses/math', desc: 'Algebra, geometry, calculus intro', tag: 'Class 9–12', color: '#e8fdf0', accent: '#22c55e' },
  { icon: '🌱', name: 'Biology', path: '/courses/bio', desc: 'Cells, genetics, ecosystems', tag: 'Class 9–12', color: '#f0fde8', accent: '#84cc16' },
  { icon: '💻', name: 'Computer Science', path: '/courses/cs', desc: 'Intro to programming & IT', tag: 'Class 9–12', color: '#f3e8fd', accent: '#8b5cf6' },
];

const Courses = memo(function Courses({ initialTab = null }) {
  const [tab, setTab] = useState(initialTab);
  const navigate = useNavigate();

  if (tab === null) {
    return (
      <div className="courses-choose-page">
        <div className="choose-header">
          <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
          <div className="section-label">COURSES</div>
          <h1>Where are you studying?</h1>
          <p>Pick your level and we'll show you the right subjects.</p>
        </div>

        <div className="choose-cards">
          <button className="choose-card school-card" onClick={() => { setTab('school'); navigate('/courses/school'); }}>
            <div className="choose-card-icon">🏫</div>
            <h2>School</h2>
            <p>Classes 9–12 · CBSE / ICSE / State Board</p>
            <ul>
              <li>Physics</li>
              <li>Chemistry</li>
              <li>Mathematics</li>
              <li>Biology & more</li>
            </ul>
            <span className="choose-cta">Explore School →</span>
          </button>

          <button className="choose-card college-card" onClick={() => { window.location.href = 'http://localhost:3000/'; }}>
            <div className="choose-card-icon">🎓</div>
            <h2>College</h2>
            <p>B.Sc · B.Tech · BCA · BA · B.Com</p>
            <ul>
              <li>Data Structures</li>
              <li>Machine Learning</li>
              <li>Calculus & LinAlg</li>
              <li>Organic Chem & more</li>
            </ul>
            <span className="choose-cta">Explore College →</span>
          </button>
        </div>
      </div>
    );
  }

  const subjects = schoolSubjects;
  const label = 'School (Class 9–12)';

  return (
    <div className="courses-list-page">
      <div className="courses-list-header">
        <button className="back-link" onClick={() => { setTab(null); navigate('/courses'); }}>← Back</button>
        <div className="section-label">{label.toUpperCase()}</div>
        <h1>Pick a subject</h1>
        <p>Aligned with CBSE / ICSE curriculum.</p>

        <div className="tab-toggle">
          <button className="active">🏫 School</button>
          <button onClick={() => { window.location.href = 'http://localhost:3000/'; }}>🎓 College</button>
        </div>
      </div>

      <div className="subjects-grid">
        {subjects.map(s => (
          <div className="subject-card" key={s.name} style={{ '--card-accent': s.accent, '--card-bg': s.color }}>
            <div className="subject-card-icon">{s.icon}</div>
            <div className="subject-card-body">
              <span className="subject-tag">{s.tag}</span>
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
            </div>
            <button className="subject-btn" onClick={() => navigate(s.path)}>Start →</button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Courses;