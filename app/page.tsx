'use client';
import React, { useState } from 'react';

import Chat  from './components/chat'
import Home from './components/home'

export default function Hero() {
  const [showChat, setShowChat] = useState(false);
  return (
    <>
      {showChat ? <Chat /> : <Home onTryNow={() => setShowChat(true)} />}
    </>
  );
}