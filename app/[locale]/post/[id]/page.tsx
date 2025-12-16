'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Locale } from '@/i18n.config';
import { Post } from '@/types';
import TabNavigation, { TabId, useTabs } from '@/components/TabNavigation';
import VotingSection from '@/components/VotingSection';
import CommentSection from '@/components/CommentSection';
import ResultsSection from '@/components/ResultsSection';
import { isAuthor } from '@/lib/results';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const locale = params.locale as Locale;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPostAuthor, setIsPostAuthor] = useState(false);
  const [closing, setClosing] = useState(false);
  
  const { activeTab, setActiveTab } = useTabs('discussion');

  // Simple translations
  const isJapanese = locale === 'ja';

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Simplified translation function
    const translations: Record<string, string> = {
      'post.tabDiscussion': isJapanese ? '投票と議論' : 'Vote & Discussion',
      'post.tabResults': isJapanese ? '結果と総括' : 'Results & Summary',
      'post.close': isJapanese ? '投票を締め切る' : 'Close Poll',
      'post.closed': isJapanese ? '締切済' : 'Closed',
      'post.confirmClose': isJapanese ? '投票を締め切りますか？この操作は取り消せません。' : 'Are you sure you want to close this poll? This action cannot be undone.',
      'common.error': isJapanese ? 'エラーが発生しました' : 'An error occurred',
      'common.loading': isJapanese ? '読み込み中...' : 'Loading...',
      'results.title': isJapanese ? '投票結果' : 'Voting Results',
      'results.summary': isJapanese ? '議論の総括' : 'Discussion Summary',
      'results.votes': isJapanese ? '票' : 'votes',
      'results.totalVotes': isJapanese ? `合計 ${params?.count || 0} 票` : `${params?.count || 0} total votes`,
      'results.noVotes': isJapanese ? 'まだ投票がありません' : 'No votes yet',
      'results.supporting': isJapanese ? `${params?.option || ''}を支持する意見` : `Supporting ${params?.option || ''}`,
      'results.supportCount': isJapanese ? `${params?.count || 0}件` : `${params?.count || 0} comments`,
      'results.neutralComments': isJapanese ? 'どちらでもない意見' : 'Neutral Comments',
      'results.noComments': isJapanese ? 'コメントがありません' : 'No comments',
      'post.addComment': isJapanese ? 'コメントを追加' : 'Add Comment',
      'post.commentPlaceholder': isJapanese ? 'あなたの意見を書いてください...' : 'Share your thoughts...',
      'post.selectOption': isJapanese ? '支持する選択肢を選ぶ（任意）' : 'Select option you support (optional)',
      'post.postComment': isJapanese ? 'コメントを投稿' : 'Post Comment',
      'post.comments': isJapanese ? 'コメント' : 'Comments',
      'post.noComments': isJapanese ? 'まだコメントがありません' : 'No comments yet',
      'post.supports': isJapanese ? `が${params?.option || ''}を支持` : `supports ${params?.option || ''}`,
    };
    
    return translations[key] || key;
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (post) {
      setIsPostAuthor(isAuthor(post));
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(isJapanese ? '投稿が見つかりません' : 'Post not found');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, optionId }),
      });

      if (!response.ok) {
        throw new Error('Vote failed');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (err) {
      console.error('Error voting:', err);
      throw err;
    }
  };

  const handleAddOption = async (optionText: string) => {
    try {
      const response = await fetch('/api/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, optionText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Add option failed');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (err) {
      console.error('Error adding option:', err);
      throw err;
    }
  };

  const handleAddComment = async (text: string, supportedOptionId?: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          author: isJapanese ? '匿名ユーザー' : 'Anonymous',
          text,
          supportedOptionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Comment failed');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const handleClosePoll = async () => {
    if (!confirm(t('post.confirmClose'))) {
      return;
    }

    setClosing(true);
    try {
      const authorToken = localStorage.getItem(`authorToken-${postId}`);
      if (!authorToken) {
        throw new Error('No author token');
      }

      const response = await fetch(`/api/posts/${postId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, authorToken }),
      });

      if (!response.ok) {
        throw new Error('Close failed');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (err) {
      console.error('Error closing poll:', err);
      alert(t('common.error'));
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => router.push(`/${locale}`)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {isJapanese ? 'トップに戻る' : 'Back to Home'}
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'discussion' as TabId, label: t('post.tabDiscussion') },
    { id: 'results' as TabId, label: t('post.tabResults') },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Post Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1">
            {post.title}
          </h1>
          {post.isClosed && (
            <span className="ml-4 px-3 py-1 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              {t('post.closed')}
            </span>
          )}
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {post.description}
        </p>
        
        {/* Close Poll Button (only for author) */}
        {isPostAuthor && !post.isClosed && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClosePoll}
              disabled={closing}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors"
            >
              {closing ? t('common.loading') : t('post.close')}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'discussion' && (
            <div className="space-y-8">
              {/* Voting Section */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {isJapanese ? '投票' : 'Vote'}
                </h2>
                <VotingSection 
                  post={post} 
                  onVote={handleVote} 
                  onAddOption={handleAddOption}
                  t={t} 
                />
              </div>

              {/* Comment Section */}
              <div>
                <CommentSection
                  post={post}
                  locale={locale}
                  onAddComment={handleAddComment}
                  t={t}
                />
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <ResultsSection post={post} t={t} />
          )}
        </div>
      </div>
    </div>
  );
}

