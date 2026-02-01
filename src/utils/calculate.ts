import type { NormalizationOptions, Tariff, CalculationResult } from '../types';
import { normalize } from './normalize';

export function calculate(
  text: string,
  reusedTexts: string[],
  normalization: NormalizationOptions,
  countSpaces: boolean,
  tariff: Tariff | null,
): CalculationResult {
  const normalizedTotal = normalize(text, normalization, countSpaces);
  const normalizedReused = reusedTexts.map(t => normalize(t, normalization, countSpaces));

  const totalChars = normalizedTotal.length;
  const reusedChars = normalizedReused.reduce((sum, t) => sum + t.length, 0);
  const newTextChars = Math.max(0, totalChars - reusedChars);

  if (!tariff) {
    return { totalChars, newTextChars, reusedChars, price: null };
  }

  const newTextSheets = newTextChars / tariff.charsPerSheet;
  const reusedSheets = reusedChars / tariff.charsPerSheet;

  return {
    totalChars,
    newTextChars,
    reusedChars,
    price: {
      newText: newTextSheets * tariff.newTextPrice,
      reused: reusedSheets * tariff.reusedTextPrice,
      total: newTextSheets * tariff.newTextPrice + reusedSheets * tariff.reusedTextPrice,
    },
  };
}
