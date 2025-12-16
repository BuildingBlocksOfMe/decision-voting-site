'use client';

import { useState } from 'react';
import { Post } from '@/types';
import { formatRelativeTime } from '@/lib/results';
import { Locale } from '@/i18n.config';

interface CommentSectionProps {
  post: Post;
  locale: Locale;
  onAddComment: (text: string, supportedOptionId?: string) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export default function CommentSection({ post, locale, onAddComment, t }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (commentText.trim().length === 0) return;
    
    setSubmitting(true);
    try {
      await onAddComment(
        commentText.trim(),
        selectedOption || undefined
      );
      setCommentText('');
      setSelectedOption('');
    } catch (error) {
      console.error('Comment submission failed:', error);
      alert(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
          {t('post.addComment')}
        </h3>
        
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t('post.commentPlaceholder')}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          maxLength={1000}
          disabled={submitting}
        />
        
        <div className="mt-3 flex items-center gap-3">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={submitting}
          >
            <option value="">{t('post.selectOption')}</option>
            {post.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.text}
              </option>
            ))}
          </select>
          
          <button
            type="submit"
            disabled={submitting || commentText.trim().length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting ? t('common.loading') : t('post.postComment')}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
          {t('post.comments')} ({post.comments.length})
        </h3>
        
        {post.comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t('post.noComments')}
          </p>
        ) : (
          <div className="space-y-4">
            {post.comments.map((comment) => {
              const supportedOption = comment.supportedOptionId
                ? post.options.find(opt => opt.id === comment.supportedOptionId)
                : null;

              return (
                <div
                  key={comment.id}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(comment.createdAt, locale)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {comment.text}
                  </p>
                  
                  {supportedOption && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-600 dark:text-blue-400">
                        {t('post.supports', { option: supportedOption.text })}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

