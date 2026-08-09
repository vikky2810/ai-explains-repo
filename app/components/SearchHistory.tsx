'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { UserSearchHistory } from '@/lib/services/database';
import { Books, GitFork, NotePencil, Star } from "@phosphor-icons/react/dist/ssr";

interface SearchHistoryProps {
  onLoadSearch?: (repoUrl: string) => void;
  /**
   * How to pitch history to a signed-out visitor. `card` suits /history, where
   * the panel is the whole point; `compact` suits /explain, where a full card
   * would shove the analysis they came for below the fold.
   */
  signedOutView?: 'card' | 'compact';
}

export default function SearchHistory({
  onLoadSearch,
  signedOutView = 'card',
}: SearchHistoryProps) {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<UserSearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchHistory();
    }
  }, [session]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/search-history');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      setError('Failed to load search history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all search history?')) return;
    
    try {
      const response = await fetch('/api/search-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchUrl: 'all' })
      });
      
      if (response.ok) {
        setHistory([]);
      } else {
        throw new Error('Failed to clear history');
      }
    } catch (err) {
      setError('Failed to clear history');
      console.error(err);
    }
  };

  const handleHistoryItemClick = (repoUrl: string, itemId: string) => {
    if (onLoadSearch) {
      setClickedItemId(itemId);
      onLoadSearch(repoUrl);
      
      // Clear the loading state after a delay
      setTimeout(() => {
        setClickedItemId(null);
      }, 2000);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const truncateExplanation = (explanation: string, maxLength: number = 120) => {
    if (explanation.length <= maxLength) return explanation;
    return explanation.substring(0, maxLength).trim() + '...';
  };

  // Nothing to show or offer until NextAuth resolves; rendering the signed-out
  // pitch here would flash it at users who are in fact signed in.
  if (status === 'loading') {
    return null;
  }

  // Analysis itself is free, so an anonymous visitor is not locked out of
  // anything here -- history is simply the thing an account buys them.
  if (!session) {
    if (signedOutView === 'compact') {
      return (
        <p className="text-center text-sm text-slate-400">
          Analysis is free, no account needed.{' '}
          <Link
            href="/login"
            className="text-accent underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{' '}
          to keep a history of the repos you analyze.
        </p>
      );
    }

    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-md p-6">
        <div className="rounded-md border border-dashed border-slate-800 px-6 py-10 text-center">
          <Books size={24} weight="regular" className="mx-auto text-slate-600" />
          <p className="mt-3 font-medium text-slate-200">History needs an account</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
            Analyzing repositories is free and always will be. Sign in and every
            repo you analyze gets saved here so you can reopen it later.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-accent-dim"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm text-slate-300 underline-offset-2 transition-colors hover:text-slate-100 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <Books size={22} weight="regular" />
          Search History
        </h2>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={fetchHistory}
                className="text-sm text-accent hover:text-slate-300 transition-colors px-3 py-1 rounded-md hover:bg-accent/10 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={clearHistory}
                className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded-md hover:bg-red-400/10"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/20 rounded-md p-3">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-800 px-6 py-10 text-center">
          <Books size={24} weight="regular" className="mx-auto text-slate-600" />
          <p className="mt-3 font-medium text-slate-200">Nothing analyzed yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Repositories you analyze will be listed here so you can reopen them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleHistoryItemClick(item.repoUrl, item.id)}
              className={`group bg-slate-800/50 border border-slate-700 rounded-md p-5 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg animate-in slide-in-from-left-2 ${
                clickedItemId === item.id ? 'ring-2 ring-accent bg-accent/20' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
                             <div className="flex items-start justify-between mb-3">
                 <div className="flex-1 min-w-0">
                   <h3 className={`font-semibold transition-colors truncate text-lg ${
                     clickedItemId === item.id 
                       ? 'text-slate-300' 
                       : 'text-slate-200 group-hover:text-slate-300'
                   }`}>
                     {item.repoOwner}/{item.repoName}
                   </h3>
                   <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md">
                     {formatDate(item.searchDate)}
                   </span>
                 </div>
                 <div className="text-slate-400 group-hover:text-accent transition-colors">
                   {clickedItemId === item.id ? (
                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent border-t-transparent"></div>
                   ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   )}
                 </div>
               </div>
              
              <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
                {truncateExplanation(item.explanation)}
              </p>
              
              {item.metadata && (
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {item.metadata.stars && (
                    <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-md">
                      <Star size={16} weight="regular" className="text-slate-400" />
                      <span>{item.metadata.stars.toLocaleString()}</span>
                    </div>
                  )}
                  {item.metadata.forks && (
                    <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-md">
                      <GitFork size={16} weight="regular" className="text-accent" />
                      <span>{item.metadata.forks.toLocaleString()}</span>
                    </div>
                  )}
                  {item.metadata.description && (
                    <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-md">
                      <NotePencil size={16} weight="regular" className="text-slate-400" />
                      <span className="truncate max-w-32">{item.metadata.description}</span>
                    </div>
                  )}
                </div>
              )}
              
                             <div className="mt-3 pt-3 border-t border-slate-700/50">
                 <span className={`text-xs transition-colors ${
                   clickedItemId === item.id 
                     ? 'text-slate-300 font-medium' 
                     : 'text-accent group-hover:text-slate-300'
                 }`}>
                   {clickedItemId === item.id ? 'Loading...' : 'Click to reload this search'}
                 </span>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
