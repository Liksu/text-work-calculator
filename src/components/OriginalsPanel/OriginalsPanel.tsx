import { Button, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { OriginalItem, NormalizationOptions } from '../../types';
import { OriginalItemCard } from './OriginalItem';

interface OriginalsPanelProps {
  originals: OriginalItem[];
  onAdd: () => void;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  normalization: NormalizationOptions;
  countSpaces: boolean;
}

export function OriginalsPanel({
  originals,
  onAdd,
  onUpdate,
  onRemove,
  normalization,
  countSpaces,
}: OriginalsPanelProps) {
  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>Original (retyped) texts</Text>

      {originals.length === 0 && (
        <Text size="xs" c="dimmed" fs="italic">
          Click "Add original text" if part of the document wasn't translated
        </Text>
      )}

      {originals.map(item => (
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
        Add original text
      </Button>
    </Stack>
  );
}
