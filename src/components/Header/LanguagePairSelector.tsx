import { Select } from '@mantine/core';
import type { Tariff } from '../../types';

interface LanguagePairSelectorProps {
  tariffs: Tariff[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export function LanguagePairSelector({ tariffs, selectedId, onChange }: LanguagePairSelectorProps) {
  if (tariffs.length === 0) return null;

  const data = tariffs.map(t => ({
    value: t.id,
    label: t.label || `Tariff ${t.id.slice(0, 6)}`,
  }));

  return (
    <Select
      label="Language pair"
      data={data}
      value={selectedId}
      onChange={onChange}
      placeholder="Select tariff"
      size="sm"
      disabled={tariffs.length === 1}
    />
  );
}
