import type { NormalizationOptions, Tariff, CalculationResult } from '../types';
import { normalize } from './normalize';

export function calculate(
  translationText: string,
  originals: string[],
  normalization: NormalizationOptions,
  countSpaces: boolean,
  tariff: Tariff | null,
): CalculationResult {
  const normalizedTotal = normalize(translationText, normalization, countSpaces);
  const normalizedOriginals = originals.map(t => normalize(t, normalization, countSpaces));

  const totalChars = normalizedTotal.length;
  const originalsChars = normalizedOriginals.reduce((sum, t) => sum + t.length, 0);
  const translationChars = Math.max(0, totalChars - originalsChars);

  if (!tariff) {
    return { totalChars, originalsChars, translationChars, price: null };
  }

  const translationSheets = translationChars / tariff.charsPerSheet;
  const typingSheets = originalsChars / tariff.charsPerSheet;

  return {
    totalChars,
    originalsChars,
    translationChars,
    price: {
      translation: translationSheets * tariff.translationPrice,
      typing: typingSheets * tariff.typingPrice,
      total: translationSheets * tariff.translationPrice + typingSheets * tariff.typingPrice,
    },
  };
}
