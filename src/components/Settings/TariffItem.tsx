import { Card, TextInput, NumberInput, Group, Button, SimpleGrid } from '@mantine/core';
import type { Tariff } from '../../types';

interface TariffItemProps {
  tariff: Tariff;
  onUpdate: (partial: Partial<Tariff>) => void;
  onRemove: () => void;
}

export function TariffItem({ tariff, onUpdate, onRemove }: TariffItemProps) {
  return (
    <Card withBorder padding="sm">
      <TextInput
        placeholder="e.g., English → Ukrainian"
        value={tariff.label}
        onChange={e => onUpdate({ label: e.currentTarget.value })}
        mb="xs"
      />
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
        <NumberInput
          label="Chars per sheet"
          value={tariff.charsPerSheet}
          onChange={v => onUpdate({ charsPerSheet: Math.max(1, Number(v) || 1) })}
          min={1}
        />
        <NumberInput
          label="Translation price"
          value={tariff.translationPrice}
          onChange={v => onUpdate({ translationPrice: Number(v) || 0 })}
          min={0}
          decimalScale={2}
        />
        <NumberInput
          label="Typing price"
          value={tariff.typingPrice}
          onChange={v => onUpdate({ typingPrice: Number(v) || 0 })}
          min={0}
          decimalScale={2}
        />
      </SimpleGrid>
      <Group justify="flex-end" mt="xs">
        <Button variant="subtle" color="red" size="xs" onClick={onRemove}>
          Delete
        </Button>
      </Group>
    </Card>
  );
}
