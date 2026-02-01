import { Stack, Checkbox } from '@mantine/core';
import type { NormalizationOptions } from '../../types';

interface NormalizationSectionProps {
  options: NormalizationOptions;
  onChange: (partial: Partial<NormalizationOptions>) => void;
}

const OPTION_LABELS: { key: keyof NormalizationOptions; label: string }[] = [
  { key: 'collapseSpaces', label: 'Collapse multiple spaces into one' },
  { key: 'collapseNewlines', label: 'Collapse multiple line breaks into one' },
  { key: 'tabsToSpaces', label: 'Convert tabs to spaces' },
  { key: 'trimRepeatedChars', label: 'Trim repeated characters (----, ====, etc.)' },
  { key: 'removeZeroWidth', label: 'Remove invisible characters' },
  { key: 'trim', label: 'Trim whitespace at start and end' },
];

export function NormalizationSection({ options, onChange }: NormalizationSectionProps) {
  return (
    <Stack gap="xs">
      {OPTION_LABELS.map(({ key, label }) => (
        <Checkbox
          key={key}
          label={label}
          checked={options[key]}
          onChange={e => onChange({ [key]: e.currentTarget.checked })}
        />
      ))}
    </Stack>
  );
}
