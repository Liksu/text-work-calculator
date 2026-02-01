import { useState, useCallback } from 'react';
import { Container, Grid, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReusedItem } from './types';
import { useSettings } from './hooks/useSettings';
import { useCalculation } from './hooks/useCalculation';
import { Header } from './components/Header/Header';
import { TranslationPanel } from './components/TranslationPanel/TranslationPanel';
import { OriginalsPanel } from './components/OriginalsPanel/OriginalsPanel';
import { SettingsModal } from './components/Settings/SettingsModal';

const STATE_KEY = 'text-work-calculator-state';

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

  const [text, setText] = useState('');
  const [reusedItems, setReusedItems] = useState<ReusedItem[]>([]);
  const [selectedTariffId, setSelectedTariffId] = useState<string | null>(loadSelectedTariffId);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);

  const effectiveTariffId =
    settings.tariffs.length === 1
      ? settings.tariffs[0].id
      : selectedTariffId;

  const result = useCalculation(text, reusedItems, settings, effectiveTariffId);

  const handleTariffChange = useCallback((id: string | null) => {
    setSelectedTariffId(id);
    saveSelectedTariffId(id);
  }, []);

  const handleCountSpacesChange = useCallback(
    (value: boolean) => updateSettings({ countSpaces: value }),
    [updateSettings],
  );

  const handleAddReused = useCallback(() => {
    setReusedItems(prev => [...prev, { id: crypto.randomUUID(), text: '' }]);
  }, []);

  const handleUpdateReused = useCallback((id: string, text: string) => {
    setReusedItems(prev => prev.map(o => (o.id === id ? { ...o, text } : o)));
  }, []);

  const handleRemoveReused = useCallback((id: string) => {
    setReusedItems(prev => prev.filter(o => o.id !== id));
  }, []);

  const handleAddTariff = useCallback(() => {
    addTariff({
      label: '',
      charsPerSheet: 1800,
      newTextPrice: 0,
      reusedTextPrice: 0,
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
            text={text}
            onChange={setText}
            normalization={settings.normalization}
            countSpaces={settings.countSpaces}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <OriginalsPanel
            items={reusedItems}
            onAdd={handleAddReused}
            onUpdate={handleUpdateReused}
            onRemove={handleRemoveReused}
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
