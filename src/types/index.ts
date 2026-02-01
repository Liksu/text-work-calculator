export interface Tariff {
  id: string;
  label: string;
  charsPerSheet: number;
  newTextPrice: number;
  reusedTextPrice: number;
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

export interface ReusedItem {
  id: string;
  text: string;
}

export interface CalculationResult {
  totalChars: number;
  newTextChars: number;
  reusedChars: number;
  price: {
    newText: number;
    reused: number;
    total: number;
  } | null;
}
