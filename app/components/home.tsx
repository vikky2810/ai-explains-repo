import React, { useEffect } from 'react';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from '@clerk/nextjs';

import {useRouter} from 'next/navigation';

interface HomeProps {
  onTryNow: () => void;
}

const Home: React.FC<HomeProps> = ({ onTryNow }) => {
  const  {isSignedIn} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn){
      router.push('/chat');
    }
  },[isSignedIn, router]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center px-4">
      <section className="w-full max-w-4xl mx-auto py-12 md:py-20 px-6 text-center bg-slate-900/80 rounded-2xl shadow-xl border border-slate-800">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-indigo-400 drop-shadow-lg">
          🧠 AI Explains This Repo
        </h1>
        <p className="text-lg md:text-xl text-slate-200 mb-8 leading-relaxed">
          Confused by complex codebases and vague documentation? You’re not alone.<br />
          Our smart AI dives into your GitHub repo and gives you a clear, concise explanation of what’s going on—just like a senior developer would.
        </p>
        <p className="text-md md:text-lg text-slate-300 mb-6 leading-relaxed">
          Whether you're reviewing an open-source project, onboarding to a new team, or just exploring something new, we make it effortless to understand the bigger picture.<br />
          <span className="text-indigo-300">Save hours of reading and let AI summarize the code for you.</span>
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            onClick={onTryNow}
          >
            Try it now 🚀
          </button>
          <ClerkProvider>
          <SignedOut>
            <SignInButton mode='modal'>
          <button
            className="bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-150 opacity-60"
          >
            Login / Signup
          </button>
          </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          </ClerkProvider>
        </div>
      </section>
    </div>
  );
};

export default Home;
