import mammoth from 'mammoth';
import { marked } from 'marked';

export async function extractFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function extractFromMd(file: File): Promise<string> {
  const text = await file.text();
  const html = await marked.parse(text);
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

export async function extractFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const parts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    parts.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
  }

  return parts.join('\n');
}

export async function extractFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'docx') return extractFromDocx(file);
  if (ext === 'md') return extractFromMd(file);
  if (ext === 'pdf') return extractFromPdf(file);
  return file.text();
}
