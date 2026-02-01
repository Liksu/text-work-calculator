import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { extractFromFile } from '../utils/extractText';

const SUPPORTED_EXTENSIONS = ['docx', 'md', 'txt', 'pdf'];

export function useFileExtract() {
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !SUPPORTED_EXTENSIONS.includes(ext)) {
      const msg = 'Unsupported file type. Please use .docx, .pdf, .md, or .txt';
      setError(msg);
      notifications.show({ title: 'Error', message: msg, color: 'red' });
      return '';
    }

    setExtracting(true);
    setError(null);

    try {
      const text = await extractFromFile(file);
      notifications.show({ message: 'File loaded successfully', color: 'green' });
      return text;
    } catch {
      const msg = 'Failed to read file';
      setError(msg);
      notifications.show({ title: 'Error', message: msg, color: 'red' });
      return '';
    } finally {
      setExtracting(false);
    }
  }, []);

  return { extracting, extract, error };
}
