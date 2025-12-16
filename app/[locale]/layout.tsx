import { ReactNode } from 'react';
import { i18n, Locale } from '@/i18n.config';
import { getTranslations, createTranslator } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const translations = await getTranslations(locale);
  const t = createTranslator(translations);

  return (
    <html lang={locale}>
      <body>
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href={`/${locale}`}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('common.title')}
                </h1>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href={`/${locale}/create`}>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    {t('common.create')}
                  </button>
                </Link>
                
                <LanguageSwitcher currentLocale={locale} />
              </div>
            </div>
          </div>
        </header>
        
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
        
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400 text-sm">
            {t('common.title')} &copy; 2025
          </div>
        </footer>
      </body>
    </html>
  );
}

