import React, { memo, useEffect } from 'react';

const Collage = memo(function Collage() {
  useEffect(() => {
    window.location.href = 'http://localhost:3000';
  }, []);

  return (
    <div className="page-container">
      <h1>Redirecting to Collage...</h1>
      <p>Taking you to the collage application.</p>
    </div>
  );
});

export default Collage;
