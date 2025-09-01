'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { UserSearchHistory } from '@/lib/services/database';

interface SearchHistoryProps {
  onLoadSearch?: (repoUrl: string) => void;
}

export default function SearchHistory({ onLoadSearch }: SearchHistoryProps) {
  const { isSignedIn } = useAuth();
  const [history, setHistory] = useState<UserSearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchHistory();
    }
  }, [isSignedIn]);

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

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          Search History
        </h2>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={fetchHistory}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1 rounded-lg hover:bg-indigo-400/10 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={clearHistory}
                className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded-lg hover:bg-red-400/10"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-lg mb-2 font-medium">No search history yet</p>
          <p className="text-sm text-slate-500 mb-4">Your repository searches will appear here</p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 px-3 py-2 rounded-full">
            <span>💡</span>
            <span>Search for a repository to get started!</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleHistoryItemClick(item.repoUrl, item.id)}
              className={`group bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg animate-in slide-in-from-left-2 ${
                clickedItemId === item.id ? 'ring-2 ring-indigo-400 bg-indigo-900/20' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
                             <div className="flex items-start justify-between mb-3">
                 <div className="flex-1 min-w-0">
                   <h3 className={`font-semibold transition-colors truncate text-lg ${
                     clickedItemId === item.id 
                       ? 'text-indigo-300' 
                       : 'text-slate-200 group-hover:text-indigo-300'
                   }`}>
                     {item.repoOwner}/{item.repoName}
                   </h3>
                   <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                     {formatDate(item.searchDate)}
                   </span>
                 </div>
                 <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">
                   {clickedItemId === item.id ? (
                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-400 border-t-transparent"></div>
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
                    <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-lg">
                      <span className="text-yellow-400">⭐</span>
                      <span>{item.metadata.stars.toLocaleString()}</span>
                    </div>
                  )}
                  {item.metadata.forks && (
                    <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-lg">
                      <span className="text-blue-400">🍴</span>
                      <span>{item.metadata.forks.toLocaleString()}</span>
                    </div>
                  )}
                  {item.metadata.description && (
                    <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-lg">
                      <span className="text-green-400">📝</span>
                      <span className="truncate max-w-32">{item.metadata.description}</span>
                    </div>
                  )}
                </div>
              )}
              
                             <div className="mt-3 pt-3 border-t border-slate-700/50">
                 <span className={`text-xs transition-colors ${
                   clickedItemId === item.id 
                     ? 'text-indigo-300 font-medium' 
                     : 'text-indigo-400 group-hover:text-indigo-300'
                 }`}>
                   {clickedItemId === item.id ? '🔄 Loading...' : 'Click to reload this search →'}
                 </span>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
