export interface Tariff {
  id: string;
  label: string;
  charsPerSheet: number;
  translationPrice: number;
  typingPrice: number;
}

export interface NormalizationOptions {
  collapseSpaces: boolean;
  collapseNewlines: boolean;
  tabsToSpaces: boolean;
  trimRepeatedChars: boolean;
  removeZeroWidth: boolean;
  trim: boolean;
}

export interface Settings {
  tariffs: Tariff[];
  normalization: NormalizationOptions;
  countSpaces: boolean;
}

export interface OriginalItem {
  id: string;
  text: string;
}

export interface CalculationResult {
  totalChars: number;
  originalsChars: number;
  translationChars: number;
  price: {
    translation: number;
    typing: number;
    total: number;
  } | null;
}
