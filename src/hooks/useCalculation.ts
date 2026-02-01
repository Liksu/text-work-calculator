import { useMemo } from 'react';
import type { Settings, ReusedItem, CalculationResult } from '../types';
import { calculate } from '../utils/calculate';

export function useCalculation(
  text: string,
  reusedItems: ReusedItem[],
  settings: Settings,
  selectedTariffId: string | null,
): CalculationResult {
  return useMemo(() => {
    const tariff = selectedTariffId
      ? settings.tariffs.find(t => t.id === selectedTariffId) ?? null
      : null;

    return calculate(
      text,
      reusedItems.map(o => o.text),
      settings.normalization,
      settings.countSpaces,
      tariff,
    );
  }, [text, reusedItems, settings, selectedTariffId]);
}
