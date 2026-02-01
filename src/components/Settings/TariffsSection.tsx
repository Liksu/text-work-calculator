import { Stack, Button, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { Tariff } from '../../types';
import { TariffItem } from './TariffItem';

interface TariffsSectionProps {
  tariffs: Tariff[];
  onAdd: () => void;
  onUpdate: (id: string, partial: Partial<Tariff>) => void;
  onRemove: (id: string) => void;
}

export function TariffsSection({ tariffs, onAdd, onUpdate, onRemove }: TariffsSectionProps) {
  return (
    <Stack gap="sm">
      <Button
        variant="light"
        size="sm"
        leftSection={<IconPlus size={16} />}
        onClick={onAdd}
      >
        Add tariff
      </Button>

      {tariffs.length === 0 && (
        <Text size="sm" c="dimmed" fs="italic">
          Add a tariff to calculate prices
        </Text>
      )}

      {tariffs.map(tariff => (
        <TariffItem
          key={tariff.id}
          tariff={tariff}
          onUpdate={partial => onUpdate(tariff.id, partial)}
          onRemove={() => onRemove(tariff.id)}
        />
      ))}
    </Stack>
  );
}
