import React from 'react';

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-indigo-400 drop-shadow">
          🧠 AI Explains This Repo
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-6">
          Paste any GitHub repo URL and get a human-friendly explanation powered by AI.<br />
          No more confusing READMEs—get the gist in seconds!
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
            onClick={() => {
              const input = document.getElementById('repo-input');
              if (input) input.focus();
            }}
          >
            Try it now 🚀
          </button>
          <button
            className="bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold px-6 py-3 rounded-lg shadow transition"
            disabled
          >
            Login / Signup (coming soon)
          </button>
        </div>
      </section>
      
    </div>
  );
};

export default Home;