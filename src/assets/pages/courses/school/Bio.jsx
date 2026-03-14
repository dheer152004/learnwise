import React, { memo } from 'react';

const Bio = memo(function Bio() {
  return (
    <div className="page-container">
      <h1>Biology</h1>
      <p>Study genetics, ecosystems, and human anatomy.</p>
    </div>
  );
});

export default Bio;
