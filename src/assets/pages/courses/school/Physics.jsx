import React, { memo, useEffect } from 'react';

const Physics = memo(function Physics() {
  useEffect(() => {
    // In Vite, to serve raw static HTML folders alongside the React app, 
    // it's highly recommended to place them in the /public folder.
    // If it's left in /src, Vite's dev server might still serve it 
    // if accessed directly, but for best practices it should be in /public.
    window.location.href = '/src/assets/pages/courses/school/physics/index.html';
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <h1>Loading Physics Lab...</h1>
    </div>
  );
});

export default Physics;
