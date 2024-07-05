export const Version = '1.0.0';

export const DefaultHost =
  'https://e2cnoh48a9.execute-api.eu-west-2.amazonaws.com/prod';

export const Colors = {
  card: '#16191F',
  text: 'black',
};

export const Language: LanguageType = {
  Performance: { en: 'Performance', es: 'Actuación', ar: 'أداء' },
  Industry: { en: 'Industry', es: 'Industria', ar: 'صناعة' },
  Ratings: { en: 'Ratings', es: 'Calificaciones', ar: 'التقييمات' },
  Financials: { en: 'Financials', es: 'Finanzas', ar: 'المالية' },
};

interface LanguageType {
  Performance: Translations;
  Industry: Translations;
  Ratings: Translations;
  Financials: Translations;
}

export interface Translations {
  en: string;
  es: string;
  ar: string;
}
