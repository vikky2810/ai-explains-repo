'use client';
import React from 'react';
import Home from './components/home';

export default function HomePage() {
  const handleTryNow = () => {
    // Redirect to explain page
    window.location.href = '/explain';
  };
  
  return <Home onTryNow={handleTryNow} />;
}