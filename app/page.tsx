'use client';
import React, { useState } from 'react';
import Home from './components/home';
import Chat from './components/chat';
import { AppState } from '@/types';

export default function Hero() {
  const [showChat, setShowChat] = useState<AppState['showChat']>(false);
  
  return (
    <>
      {showChat ? <Chat /> : <Home onTryNow={() => setShowChat(true)} />}
    </>
  );
}