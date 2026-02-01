import { Paper, Text, SimpleGrid, Stack, Alert } from '@mantine/core';
import type { CalculationResult } from '../../types';

interface ResultsPanelProps {
  result: CalculationResult;
  hasTariff: boolean;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtDec(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ResultItem({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={bold ? 700 : 600}>{value}</Text>
    </div>
  );
}

export function ResultsPanel({ result, hasTariff }: ResultsPanelProps) {
  const showWarning = result.originalsChars > result.totalChars;

  return (
    <Paper p="sm" radius="sm" withBorder>
      <Stack gap="xs">
        {hasTariff && result.price ? (
          <SimpleGrid cols={2} spacing="sm" verticalSpacing={4}>
            <Stack gap={4}>
              <ResultItem label="Translated" value={fmt(result.translationChars)} />
              <ResultItem label="Original (retyped)" value={fmt(result.originalsChars)} />
              <ResultItem label="Total characters" value={fmt(result.totalChars)} bold />
            </Stack>
            <Stack gap={4}>
              <ResultItem label="Translation cost" value={fmtDec(result.price.translation)} />
              <ResultItem label="Retyping cost" value={fmtDec(result.price.typing)} />
              <ResultItem label="Total cost" value={fmtDec(result.price.total)} bold />
            </Stack>
          </SimpleGrid>
        ) : (
          <SimpleGrid cols={3} spacing="sm">
            <ResultItem label="Translated" value={fmt(result.translationChars)} />
            <ResultItem label="Original (retyped)" value={fmt(result.originalsChars)} />
            <ResultItem label="Total characters" value={fmt(result.totalChars)} bold />
          </SimpleGrid>
        )}

        {showWarning && (
          <Alert color="orange" variant="light" p="xs">
            Warning: original text exceeds total. Check your input.
          </Alert>
        )}

        {!hasTariff && (
          <Text size="xs" c="dimmed" fs="italic">
            Set up tariffs in settings to calculate prices
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
