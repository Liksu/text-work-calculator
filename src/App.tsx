import { useState, useCallback } from 'react';
import { Container, Grid, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { OriginalItem } from './types';
import { useSettings } from './hooks/useSettings';
import { useCalculation } from './hooks/useCalculation';
import { Header } from './components/Header/Header';
import { TranslationPanel } from './components/TranslationPanel/TranslationPanel';
import { OriginalsPanel } from './components/OriginalsPanel/OriginalsPanel';
import { SettingsModal } from './components/Settings/SettingsModal';

const STATE_KEY = 'translation-calculator-state';

function loadSelectedTariffId(): string | null {
  try {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
      return JSON.parse(stored).selectedTariffId ?? null;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveSelectedTariffId(id: string | null) {
  localStorage.setItem(STATE_KEY, JSON.stringify({ selectedTariffId: id }));
}

export default function App() {
  const {
    settings,
    updateSettings,
    addTariff,
    updateTariff,
    removeTariff,
    updateNormalization,
  } = useSettings();

  const [translationText, setTranslationText] = useState('');
  const [originals, setOriginals] = useState<OriginalItem[]>([]);
  const [selectedTariffId, setSelectedTariffId] = useState<string | null>(loadSelectedTariffId);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);

  // Auto-select tariff if there's exactly one
  const effectiveTariffId =
    settings.tariffs.length === 1
      ? settings.tariffs[0].id
      : selectedTariffId;

  const result = useCalculation(translationText, originals, settings, effectiveTariffId);

  const handleTariffChange = useCallback((id: string | null) => {
    setSelectedTariffId(id);
    saveSelectedTariffId(id);
  }, []);

  const handleCountSpacesChange = useCallback(
    (value: boolean) => updateSettings({ countSpaces: value }),
    [updateSettings],
  );

  const handleAddOriginal = useCallback(() => {
    setOriginals(prev => [...prev, { id: crypto.randomUUID(), text: '' }]);
  }, []);

  const handleUpdateOriginal = useCallback((id: string, text: string) => {
    setOriginals(prev => prev.map(o => (o.id === id ? { ...o, text } : o)));
  }, []);

  const handleRemoveOriginal = useCallback((id: string) => {
    setOriginals(prev => prev.filter(o => o.id !== id));
  }, []);

  const handleAddTariff = useCallback(() => {
    addTariff({
      label: '',
      charsPerSheet: 1800,
      translationPrice: 0,
      typingPrice: 0,
    });
  }, [addTariff]);

  return (
    <Container size="lg" py="md">
      <Header
        settings={settings}
        result={result}
        selectedTariffId={effectiveTariffId}
        onTariffChange={handleTariffChange}
        onOpenSettings={openSettings}
      />

      <Divider my="md" />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 7 }}>
          <TranslationPanel
            text={translationText}
            onChange={setTranslationText}
            normalization={settings.normalization}
            countSpaces={settings.countSpaces}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <OriginalsPanel
            originals={originals}
            onAdd={handleAddOriginal}
            onUpdate={handleUpdateOriginal}
            onRemove={handleRemoveOriginal}
            normalization={settings.normalization}
            countSpaces={settings.countSpaces}
          />
        </Grid.Col>
      </Grid>

      <SettingsModal
        opened={settingsOpened}
        onClose={closeSettings}
        tariffs={settings.tariffs}
        normalization={settings.normalization}
        countSpaces={settings.countSpaces}
        onAddTariff={handleAddTariff}
        onUpdateTariff={updateTariff}
        onRemoveTariff={removeTariff}
        onUpdateNormalization={updateNormalization}
        onCountSpacesChange={handleCountSpacesChange}
      />
    </Container>
  );
}
