import { Group, Title, Text, ActionIcon, Tooltip, Stack } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import type { Settings, CalculationResult } from '../../types';
import { ResultsPanel } from './ResultsPanel';
import { LanguagePairSelector } from './LanguagePairSelector';

interface HeaderProps {
  settings: Settings;
  result: CalculationResult;
  selectedTariffId: string | null;
  onTariffChange: (id: string | null) => void;
  onOpenSettings: () => void;
}

export function Header({
  settings,
  result,
  selectedTariffId,
  onTariffChange,
  onOpenSettings,
}: HeaderProps) {
  const hasTariff = selectedTariffId !== null && settings.tariffs.some(t => t.id === selectedTariffId);

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Text Work Calculator</Title>
          <Text size="sm" c="dimmed" maw={600} mt={4}>
            Calculate text work costs fairly. Paste your text, then mark any reused
            parts that shouldn't count as new work. The calculator normalizes whitespace
            and separates new text from reused text for fair pricing.
          </Text>
        </div>
        <Group gap="sm" align="center" wrap="nowrap">
          <LanguagePairSelector
            tariffs={settings.tariffs}
            selectedId={selectedTariffId}
            onChange={onTariffChange}
          />
          <Tooltip label="Settings">
            <ActionIcon variant="subtle" size="lg" onClick={onOpenSettings}>
              <IconSettings size={22} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <ResultsPanel result={result} hasTariff={hasTariff} />
    </Stack>
  );
}
