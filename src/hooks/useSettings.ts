import { useState, useCallback } from 'react';
import type { Settings, Tariff, NormalizationOptions } from '../types';
import { DEFAULT_SETTINGS } from '../constants/defaults';

const STORAGE_KEY = 'text-work-calculator-settings';

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const addTariff = useCallback((tariff: Omit<Tariff, 'id'>) => {
    setSettings(prev => {
      const next = {
        ...prev,
        tariffs: [...prev.tariffs, { ...tariff, id: crypto.randomUUID() }],
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateTariff = useCallback((id: string, partial: Partial<Tariff>) => {
    setSettings(prev => {
      const next = {
        ...prev,
        tariffs: prev.tariffs.map(t => (t.id === id ? { ...t, ...partial } : t)),
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const removeTariff = useCallback((id: string) => {
    setSettings(prev => {
      const next = {
        ...prev,
        tariffs: prev.tariffs.filter(t => t.id !== id),
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateNormalization = useCallback((partial: Partial<NormalizationOptions>) => {
    setSettings(prev => {
      const next = {
        ...prev,
        normalization: { ...prev.normalization, ...partial },
      };
      saveSettings(next);
      return next;
    });
  }, []);

  return {
    settings,
    updateSettings,
    addTariff,
    updateTariff,
    removeTariff,
    updateNormalization,
  };
}
