import { Button, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { ReusedItem, NormalizationOptions } from '../../types';
import { OriginalItemCard } from './OriginalItem';

interface OriginalsPanelProps {
  items: ReusedItem[];
  onAdd: () => void;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  normalization: NormalizationOptions;
  countSpaces: boolean;
}

export function OriginalsPanel({
  items,
  onAdd,
  onUpdate,
  onRemove,
  normalization,
  countSpaces,
}: OriginalsPanelProps) {
  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>Reused texts</Text>

      {items.length === 0 && (
        <Text size="xs" c="dimmed" fs="italic">
          Add reused text blocks that shouldn't count as new work
        </Text>
      )}

      {items.map(item => (
        <OriginalItemCard
          key={item.id}
          id={item.id}
          text={item.text}
          onChange={text => onUpdate(item.id, text)}
          onRemove={() => onRemove(item.id)}
          normalization={normalization}
          countSpaces={countSpaces}
        />
      ))}

      <Button
        variant="light"
        size="sm"
        leftSection={<IconPlus size={16} />}
        onClick={onAdd}
      >
        Add reused text
      </Button>
    </Stack>
  );
}
