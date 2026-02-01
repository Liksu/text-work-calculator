import { Modal, Tabs, Title, Switch, Stack } from '@mantine/core';
import type { Tariff, NormalizationOptions } from '../../types';
import { TariffsSection } from './TariffsSection';
import { NormalizationSection } from './NormalizationSection';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
  tariffs: Tariff[];
  normalization: NormalizationOptions;
  countSpaces: boolean;
  onAddTariff: () => void;
  onUpdateTariff: (id: string, partial: Partial<Tariff>) => void;
  onRemoveTariff: (id: string) => void;
  onUpdateNormalization: (partial: Partial<NormalizationOptions>) => void;
  onCountSpacesChange: (value: boolean) => void;
}

export function SettingsModal({
  opened,
  onClose,
  tariffs,
  normalization,
  countSpaces,
  onAddTariff,
  onUpdateTariff,
  onRemoveTariff,
  onUpdateNormalization,
  onCountSpacesChange,
}: SettingsModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={4}>Settings</Title>} size="lg">
      <Tabs defaultValue="tariffs">
        <Tabs.List>
          <Tabs.Tab value="tariffs">Tariffs</Tabs.Tab>
          <Tabs.Tab value="normalization">Text normalization</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tariffs" pt="md">
          <TariffsSection
            tariffs={tariffs}
            onAdd={onAddTariff}
            onUpdate={onUpdateTariff}
            onRemove={onRemoveTariff}
          />
        </Tabs.Panel>

        <Tabs.Panel value="normalization" pt="md">
          <Stack gap="md">
            <Switch
              label="Count spaces"
              checked={countSpaces}
              onChange={e => onCountSpacesChange(e.currentTarget.checked)}
            />
            <NormalizationSection
              options={normalization}
              onChange={onUpdateNormalization}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
