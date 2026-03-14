import React, { memo, useEffect } from 'react';

const Chemistry = memo(function Chemistry() {
  useEffect(() => {
    window.location.href = 'https://navneetsingh123ac.github.io/virtual-lab-simulator/';
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <h1>Loading Chemistry Lab...</h1>
    </div>
  );
});

export default Chemistry;
