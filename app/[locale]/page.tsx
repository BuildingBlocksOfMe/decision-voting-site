import { Locale } from '@/i18n.config';
import { getTranslations, createTranslator } from '@/lib/i18n';
import { readPosts } from '@/lib/data';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const translations = await getTranslations(locale);
  const t = createTranslator(translations);
  const posts = await readPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('home.heading')}
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {t('home.subheading')}
        </p>
        <Link href={`/${locale}/create`}>
          <button className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg">
            {t('common.create')}
          </button>
        </Link>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            {t('home.noPosts')}
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            {t('home.createFirst')}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

