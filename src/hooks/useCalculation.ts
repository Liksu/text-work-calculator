import { useMemo } from 'react';
import type { Settings, OriginalItem, CalculationResult } from '../types';
import { calculate } from '../utils/calculate';

export function useCalculation(
  translationText: string,
  originals: OriginalItem[],
  settings: Settings,
  selectedTariffId: string | null,
): CalculationResult {
  return useMemo(() => {
    const tariff = selectedTariffId
      ? settings.tariffs.find(t => t.id === selectedTariffId) ?? null
      : null;

    return calculate(
      translationText,
      originals.map(o => o.text),
      settings.normalization,
      settings.countSpaces,
      tariff,
    );
  }, [translationText, originals, settings, selectedTariffId]);
}
