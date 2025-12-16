'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types';
import { hasVoted, markAsVoted } from '@/lib/results';

interface VotingSectionProps {
  post: Post;
  onVote: (optionId: string) => Promise<void>;
  onAddOption?: (optionText: string) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export default function VotingSection({ post, onVote, onAddOption, t }: VotingSectionProps) {
  const [voting, setVoting] = useState(false);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');
  const [addingOption, setAddingOption] = useState(false);

  useEffect(() => {
    setUserHasVoted(hasVoted(post.id));
  }, [post.id]);

  const handleVote = async (optionId: string) => {
    if (voting || userHasVoted || post.isClosed) return;

    setVoting(true);
    try {
      await onVote(optionId);
      markAsVoted(post.id);
      setUserHasVoted(true);
    } catch (error) {
      console.error('Vote failed:', error);
      alert(t('common.error'));
    } finally {
      setVoting(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOptionText.trim() || !onAddOption) return;

    setAddingOption(true);
    try {
      await onAddOption(newOptionText.trim());
      setNewOptionText('');
      setShowAddOption(false);
      alert(t('post.optionAdded'));
    } catch (error: any) {
      console.error('Add option failed:', error);
      if (error.message?.includes('exists')) {
        alert(t('post.optionExists'));
      } else if (error.message?.includes('closed')) {
        alert(t('post.cannotAddToClosed'));
      } else {
        alert(t('common.error'));
      }
    } finally {
      setAddingOption(false);
    }
  };

  const totalVotes = post.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="space-y-3">
      {post.options.map((option) => {
        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        const canVote = !post.isClosed && !userHasVoted && !voting;

        return (
          <button
            key={option.id}
            onClick={() => handleVote(option.id)}
            disabled={!canVote}
            className={`
              w-full p-4 rounded-lg border-2 text-left transition-all
              ${
                canVote
                  ? 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                  : 'border-gray-200 dark:border-gray-700 cursor-not-allowed'
              }
              ${userHasVoted || post.isClosed ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {option.text}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {option.votes} {t('results.votes')}
              </span>
            </div>
            
            {(userHasVoted || post.isClosed) && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            )}
          </button>
        );
      })}
      
      {/* Add Option Section */}
      {!post.isClosed && onAddOption && (
        <div className="pt-2">
          {!showAddOption ? (
            <button
              onClick={() => setShowAddOption(true)}
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
            >
              + {t('post.addOptionButton')}
            </button>
          ) : (
            <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <input
                type="text"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                placeholder={t('post.optionPlaceholder')}
                maxLength={100}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={addingOption}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddOption}
                  disabled={addingOption || !newOptionText.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors"
                >
                  {addingOption ? t('post.addingOption') : t('post.addOption')}
                </button>
                <button
                  onClick={() => {
                    setShowAddOption(false);
                    setNewOptionText('');
                  }}
                  disabled={addingOption}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {post.isClosed && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-2">
          {t('post.closed')}
        </p>
      )}
      
      {userHasVoted && !post.isClosed && (
        <p className="text-sm text-green-600 dark:text-green-400 text-center py-2">
          {t('post.voted')}
        </p>
      )}
    </div>
  );
}

