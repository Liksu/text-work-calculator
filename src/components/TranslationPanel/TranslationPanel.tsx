import { Box, Group, ActionIcon, Text, Tooltip } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { TextAreaWithDrop } from '../TextAreaWithDrop/TextAreaWithDrop';
import type { NormalizationOptions } from '../../types';
import { normalize } from '../../utils/normalize';

interface TranslationPanelProps {
  text: string;
  onChange: (text: string) => void;
  normalization: NormalizationOptions;
  countSpaces: boolean;
}

export function TranslationPanel({ text, onChange, normalization, countSpaces }: TranslationPanelProps) {
  const charCount = normalize(text, normalization, countSpaces).length;

  return (
    <Box>
      <TextAreaWithDrop
        value={text}
        onChange={onChange}
        placeholder="Paste your text here, or drop a .docx/.pdf/.md/.txt file"
        minRows={12}
        normalization={normalization}
        countSpaces={countSpaces}
        label={(statusText) => (
          <Group justify="space-between">
            <Group gap="xs">
              <Text size="sm" fw={500}>Full text</Text>
              {statusText && <Text size="xs" c="dimmed">{statusText}</Text>}
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {charCount.toLocaleString('en-US')} chars
              </Text>
              {text && (
                <Tooltip label="Clear">
                  <ActionIcon variant="subtle" size="sm" onClick={() => onChange('')}>
                    <IconX size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Group>
        )}
      />
    </Box>
  );
}
