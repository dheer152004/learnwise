import React, { memo, useEffect } from 'react';

const Bio = memo(function Bio() {
  useEffect(() => {
    window.location.href = '/src/assets/pages/courses/school/Biology/bio_index.html';
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <h1>Loading Biology Lab...</h1>
    </div>
  );
});

export default Bio;
