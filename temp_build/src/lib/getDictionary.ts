import 'server-only';
import { cookies } from 'next/headers';

const dictionaries = {
  tr: () => import('../dictionaries/tr.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value as 'tr' | 'en' | undefined;
  
  const currentLocale = locale === 'en' ? 'en' : 'tr';
  return dictionaries[currentLocale]();
};
