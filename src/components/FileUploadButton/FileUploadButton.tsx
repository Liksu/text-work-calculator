import { useRef } from 'react';
import { Button } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

export function FileUploadButton({ onFileSelect, loading }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="light"
        size="xs"
        leftSection={<IconUpload size={14} />}
        loading={loading}
        onClick={() => inputRef.current?.click()}
      >
        Upload file
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".docx,.pdf,.md,.txt"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file);
            e.target.value = '';
          }
        }}
      />
    </>
  );
}
