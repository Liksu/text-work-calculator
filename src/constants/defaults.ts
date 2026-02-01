import type { NormalizationOptions, Settings } from '../types';

export const DEFAULT_NORMALIZATION: NormalizationOptions = {
  collapseSpaces: true,
  collapseNewlines: true,
  tabsToSpaces: true,
  trimRepeatedChars: true,
  removeZeroWidth: true,
  trim: true,
};

export const DEFAULT_SETTINGS: Settings = {
  tariffs: [],
  normalization: DEFAULT_NORMALIZATION,
  countSpaces: true,
};
