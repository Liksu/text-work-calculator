import { Card, Group, ActionIcon, Text, Tooltip } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { TextAreaWithDrop } from '../TextAreaWithDrop/TextAreaWithDrop';
import type { NormalizationOptions } from '../../types';
import { normalize } from '../../utils/normalize';

interface OriginalItemProps {
  id: string;
  text: string;
  onChange: (text: string) => void;
  onRemove: () => void;
  normalization: NormalizationOptions;
  countSpaces: boolean;
}

export function OriginalItemCard({
  text,
  onChange,
  onRemove,
  normalization,
  countSpaces,
}: OriginalItemProps) {
  const charCount = normalize(text, normalization, countSpaces).length;

  return (
    <Card withBorder padding="sm">
      <TextAreaWithDrop
        value={text}
        onChange={onChange}
        placeholder="Paste original (non-translated) text here"
        minRows={4}
        normalization={normalization}
        countSpaces={countSpaces}
        label={(statusText) => (
          <Group justify="space-between">
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {charCount.toLocaleString('en-US')} chars
              </Text>
              {statusText && <Text size="xs" c="dimmed">{statusText}</Text>}
            </Group>
            <Tooltip label="Remove">
              <ActionIcon variant="subtle" size="sm" color="red" onClick={onRemove}>
                <IconX size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      />
    </Card>
  );
}
