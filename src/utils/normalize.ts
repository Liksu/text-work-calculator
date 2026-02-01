import type { NormalizationOptions } from '../types';

export function normalize(text: string, options: NormalizationOptions, countSpaces: boolean): string {
  let result = text;

  if (options.removeZeroWidth) {
    result = result.replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u2060\u180E]/g, '');
  }

  if (options.tabsToSpaces) {
    result = result.replace(/\t/g, ' ');
  }

  if (options.collapseSpaces) {
    result = result.replace(/([-=_*.~])\s+([-=_*.~])/g, '$1$2');
    result = result.replace(/\s+/g, ' ');
  }

  if (options.collapseNewlines) {
    result = result.replace(/[\r\n]+/g, '\n');
  }

  if (options.trimRepeatedChars) {
    result = result.replace(/([-=_*.~])\1{3,}/g, '$1$1$1');
  }

  if (options.trim) {
    result = result.trim();
  }

  if (!countSpaces) {
    result = result.replace(/\s/g, '');
  }

  return result;
}
