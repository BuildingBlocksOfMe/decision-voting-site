import { Locale } from '@/i18n.config';

// Translation dictionaries type
type Translations = {
  [key: string]: any;
};

// Cache for loaded translations
const translationsCache: Record<string, Translations> = {};

// Load translation file
export async function getTranslations(locale: Locale): Promise<Translations> {
  if (translationsCache[locale]) {
    return translationsCache[locale];
  }

  try {
    const translations = await import(`@/locales/${locale}.json`);
    translationsCache[locale] = translations.default;
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to default locale if loading fails
    if (locale !== 'ja') {
      return getTranslations('ja' as Locale);
    }
    return {};
  }
}

// Helper function to get nested translation value
export function getNestedTranslation(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return the path itself if not found
    }
  }
  
  return typeof result === 'string' ? result : path;
}

// Create a translation function for a specific locale
export function createTranslator(translations: Translations) {
  return (key: string, params?: Record<string, string | number>): string => {
    let text = getNestedTranslation(translations, key);
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return text;
  };
}

