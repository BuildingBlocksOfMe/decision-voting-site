import Link from 'next/link';
import { Post } from '@/types';
import { formatRelativeTime } from '@/lib/results';
import { Locale } from '@/i18n.config';

interface PostCardProps {
  post: Post;
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export default function PostCard({ post, locale, t }: PostCardProps) {
  const totalVotes = post.options.reduce((sum, opt) => sum + opt.votes, 0);
  const commentCount = post.comments.length;

  return (
    <Link href={`/${locale}/post/${post.id}`}>
      <div className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
            {post.title}
          </h3>
          {post.isClosed && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              {t('post.closed')}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {post.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{formatRelativeTime(post.createdAt, locale)}</span>
          <span>•</span>
          <span>{t('card.votes', { count: totalVotes })}</span>
          <span>•</span>
          <span>{t('card.comments', { count: commentCount })}</span>
          <span>•</span>
          <span className={post.isClosed ? 'text-gray-500' : 'text-green-600 dark:text-green-400'}>
            {post.isClosed ? t('card.closed') : t('card.open')}
          </span>
        </div>
        
        {/* Options preview */}
        <div className="mt-4 flex flex-wrap gap-2">
          {post.options.slice(0, 3).map((option) => (
            <span
              key={option.id}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
            >
              {option.text}
            </span>
          ))}
          {post.options.length > 3 && (
            <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              +{post.options.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

