import en from './en';
import hi from './hi';
import ta from './ta';

export type JagoLanguage = 'en' | 'ta' | 'hi';
export type JagoStrings = typeof en;

export const translations: Record<JagoLanguage, JagoStrings> = { en, ta, hi };
