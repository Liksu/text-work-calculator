import { useState, useCallback, useRef, type DragEvent } from 'react';
import { Textarea, Overlay, Text, Stack, Box } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useFileExtract } from '../../hooks/useFileExtract';
import { useDocumentDrag } from '../../hooks/useDocumentDrag';
import { FileUploadButton } from '../FileUploadButton/FileUploadButton';
import type { NormalizationOptions } from '../../types';
import { normalize } from '../../utils/normalize';

interface TextAreaWithDropProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  autosize?: boolean;
  label?: React.ReactNode | ((statusText: string | null) => React.ReactNode);
  normalization: NormalizationOptions;
  countSpaces: boolean;
}

export function TextAreaWithDrop({
  value,
  onChange,
  placeholder,
  minRows = 6,
  autosize = true,
  label,
  normalization,
  countSpaces,
}: TextAreaWithDropProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const fileDragging = useDocumentDrag();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { extract, extracting } = useFileExtract();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSelect = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    if (selectionStart === selectionEnd) {
      setSelectedCount(null);
      return;
    }
    const selected = value.slice(selectionStart, selectionEnd);
    setSelectedCount(normalize(selected, normalization, countSpaces).length);
  }, [value, normalization, countSpaces]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileDrop = useCallback(
    async (file: File) => {
      const text = await extract(file);
      if (text) {
        onChange(text);
        setFileName(file.name);
        setSelectedCount(null);
      }
    },
    [extract, onChange],
  );

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      handleFileDrop(file);
    },
    [handleFileDrop],
  );

  const handleFileSelect = useCallback(
    (file: File) => handleFileDrop(file),
    [handleFileDrop],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.currentTarget.value);
      setFileName(null);
      setSelectedCount(null);
    },
    [onChange],
  );

  const showOverlay = fileDragging && !isMobile;
  const statusText = selectedCount !== null
    ? `Selected: ${selectedCount.toLocaleString('en-US')}`
    : fileName;

  const renderedLabel = typeof label === 'function' ? label(statusText) : label;

  return (
    <Stack gap={2}>
      {renderedLabel}
      <Box
        pos="relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onBlur={() => setSelectedCount(null)}
          placeholder={placeholder}
          minRows={minRows}
          autosize={autosize}
          disabled={extracting}
        />
        {showOverlay && (
          <Overlay
            center
            backgroundOpacity={0.85}
            color="#fff"
            radius="sm"
            zIndex={10}
            style={{ pointerEvents: 'none' }}
          >
            <Stack align="center" gap="xs">
              <IconUpload size={32} color="var(--mantine-color-blue-6)" />
              <Text c="blue" fw={500}>
                Drop .docx, .pdf, .md, or .txt file
              </Text>
            </Stack>
          </Overlay>
        )}
      </Box>
      {isMobile && (
        <FileUploadButton onFileSelect={handleFileSelect} loading={extracting} />
      )}
    </Stack>
  );
}
