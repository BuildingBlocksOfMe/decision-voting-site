'use client';

import { Post, PostSummary } from '@/types';
import { generateSummary } from '@/lib/results';
import { useMemo } from 'react';

interface ResultsSectionProps {
  post: Post;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export default function ResultsSection({ post, t }: ResultsSectionProps) {
  const summary: PostSummary = useMemo(() => generateSummary(post), [post]);

  return (
    <div className="space-y-8">
      {/* Voting Results */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {t('results.title')}
        </h2>
        
        {summary.totalVotes === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">{t('results.noVotes')}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('results.totalVotes', { count: summary.totalVotes })}
            </p>
            
            {summary.results.map((option) => {
              const isWinner = summary.winningOption?.id === option.id && option.votes > 0;
              
              return (
                <div
                  key={option.id}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${
                      isWinner
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isWinner && <span className="text-green-500">✓</span>}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {option.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-bold">
                        {option.votes} {t('results.votes')}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ({option.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`
                        h-full rounded-full transition-all duration-500
                        ${isWinner ? 'bg-green-500' : 'bg-blue-500'}
                      `}
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Discussion Summary */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {t('results.summary')}
        </h2>
        
        {post.comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">{t('results.noComments')}</p>
        ) : (
          <div className="space-y-6">
            {/* Comments grouped by option */}
            {summary.results.map((option) => {
              const comments = summary.commentsByOption[option.id] || [];
              
              if (comments.length === 0) return null;
              
              return (
                <div key={option.id} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                    {t('results.supporting', { option: option.text })}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({t('results.supportCount', { count: comments.length })})
                    </span>
                  </h3>
                  
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                      >
                        <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          — {comment.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Neutral comments */}
            {summary.neutralComments.length > 0 && (
              <div className="border-l-4 border-gray-400 dark:border-gray-600 pl-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                  {t('results.neutralComments')}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({t('results.supportCount', { count: summary.neutralComments.length })})
                  </span>
                </h3>
                
                <div className="space-y-3">
                  {summary.neutralComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                    >
                      <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        — {comment.author}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

