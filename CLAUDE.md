# Translation Cost Calculator

## Project Overview

A web-based calculator for calculating translation costs. Translators charge per character (with or without spaces), but documents often contain:
- Excessive whitespace used for formatting (tabs, multiple line breaks)
- Original text that wasn't translated (just retyped) — charged at a lower rate

This tool helps calculate fair costs by:
1. Normalizing whitespace according to configurable rules
2. Separating translated text from retyped original text
3. Calculating prices based on configurable tariffs per language pair

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Mantine v8** for UI components (use @mantine/core, @mantine/hooks)
- **@tabler/icons-react** for icons
- **mammoth** for extracting text from .docx files
- **marked** for parsing Markdown files
- **localStorage** for persisting settings

### Installation

```bash
npm create vite@latest . -- --template react-ts
npm install @mantine/core @mantine/hooks @mantine/notifications @tabler/icons-react mammoth marked
npm install -D @types/marked
```

### Mantine v8 Setup

In `main.tsx`:
```tsx
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </StrictMode>,
);
```

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── ResultsPanel.tsx
│   │   └── LanguagePairSelector.tsx
│   ├── TranslationPanel/
│   │   └── TranslationPanel.tsx
│   ├── OriginalsPanel/
│   │   ├── OriginalsPanel.tsx
│   │   └── OriginalItem.tsx
│   ├── TextAreaWithDrop/
│   │   └── TextAreaWithDrop.tsx
│   ├── Settings/
│   │   ├── SettingsModal.tsx
│   │   ├── TariffsSection.tsx
│   │   ├── TariffItem.tsx
│   │   └── NormalizationSection.tsx
│   └── FileUploadButton/
│       └── FileUploadButton.tsx
├── hooks/
│   ├── useSettings.ts
│   ├── useCalculation.ts
│   ├── useFileExtract.ts
│   └── useDocumentDrag.ts
├── utils/
│   ├── normalize.ts
│   ├── extractText.ts
│   └── calculate.ts
├── types/
│   └── index.ts
└── constants/
    └── defaults.ts
```

## Data Types

```typescript
// types/index.ts

export interface Tariff {
  id: string;
  label: string;              // Free text, e.g., "English → Ukrainian"
  charsPerSheet: number;      // Characters per "sheet" (e.g., 1800)
  translationPrice: number;   // Price per sheet for translation
  typingPrice: number;        // Price per sheet for retyping original
}

export interface NormalizationOptions {
  collapseSpaces: boolean;      // All whitespace sequences → single space
  collapseNewlines: boolean;    // Multiple \r\n → single \n
  tabsToSpaces: boolean;        // \t → space
  trimRepeatedChars: boolean;   // "-----" or "=====" → "---" (only - = _ * . ~)
  removeZeroWidth: boolean;     // Remove zero-width characters
  trim: boolean;                // Trim leading/trailing whitespace
}

export interface Settings {
  tariffs: Tariff[];
  normalization: NormalizationOptions;
  countSpaces: boolean;         // Whether to count spaces (toggle in Settings modal)
}

export interface OriginalItem {
  id: string;
  text: string;
}

export interface CalculationResult {
  totalChars: number;           // Full text character count (after normalization)
  originalsChars: number;       // Sum of all original parts
  translationChars: number;     // totalChars - originalsChars

  price: {                      // null if no tariff selected
    translation: number;
    typing: number;
    total: number;
  } | null;
}
```

## Default Values

```typescript
// constants/defaults.ts

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
```

## Core Functions

### normalize.ts

Normalization order matters. Steps applied sequentially:

```typescript
export function normalize(text: string, options: NormalizationOptions, countSpaces: boolean): string {
  let result = text;

  if (options.removeZeroWidth) {
    // Remove zero-width characters: \u200B, \u200C, \u200D, \u200E, \u200F, \uFEFF, \u00AD, \u2060, \u180E
    result = result.replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u2060\u180E]/g, '');
  }

  if (options.tabsToSpaces) {
    result = result.replace(/\t/g, ' ');
  }

  if (options.collapseSpaces) {
    // Remove spaces between formatting characters first: "- - - -" → "----"
    result = result.replace(/([-=_*.~])\s+([-=_*.~])/g, '$1$2');
    // Then collapse all whitespace sequences into single space (aggressive)
    result = result.replace(/\s+/g, ' ');
  }

  if (options.collapseNewlines) {
    // Collapse all \r and \n sequences into single \n
    result = result.replace(/[\r\n]+/g, '\n');
  }

  if (options.trimRepeatedChars) {
    // Only formatting characters: - = _ * . ~  (4+ repeats → 3)
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
```

Key design decisions:
- `collapseSpaces` uses aggressive `/\s+/g` — collapses everything including mixed whitespace/newline sequences into a single space. This matches manual calculation (`text.replaceAll(/\s+/g, ' ')`).
- `collapseSpaces` first removes spaces between formatting chars (`"- - -"` → `"---"`) so `trimRepeatedChars` can then collapse them.
- `trimRepeatedChars` only targets formatting characters `[-=_*.~]`, never letters or digits.
- `collapseNewlines` uses `/[\r\n]+/g` — handles Windows `\r\n`, Mac `\r`, and Unix `\n` line endings.

### extractText.ts

```typescript
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

export async function extractFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'docx') return extractFromDocx(file);
  if (ext === 'md') return extractFromMd(file);
  return file.text();
}
```

### calculate.ts

```typescript
export function calculate(
  translationText: string,
  originals: string[],
  normalization: NormalizationOptions,
  countSpaces: boolean,
  tariff: Tariff | null
): CalculationResult {
  const normalizedTotal = normalize(translationText, normalization, countSpaces);
  const normalizedOriginals = originals.map(t => normalize(t, normalization, countSpaces));

  const totalChars = normalizedTotal.length;
  const originalsChars = normalizedOriginals.reduce((sum, t) => sum + t.length, 0);
  const translationChars = Math.max(0, totalChars - originalsChars);

  if (!tariff) {
    return { totalChars, originalsChars, translationChars, price: null };
  }

  const translationSheets = translationChars / tariff.charsPerSheet;
  const typingSheets = originalsChars / tariff.charsPerSheet;

  return {
    totalChars,
    originalsChars,
    translationChars,
    price: {
      translation: translationSheets * tariff.translationPrice,
      typing: typingSheets * tariff.typingPrice,
      total: translationSheets * tariff.translationPrice + typingSheets * tariff.typingPrice,
    },
  };
}
```

## UI Requirements

### Icons

Use `@tabler/icons-react`:
- Settings button: `IconSettings`
- Clear/Remove button: `IconX`
- Add button: `IconPlus`
- Upload file: `IconUpload`

### Layout

- **Desktop**: Two columns (`Grid` with `sm: 7` / `sm: 5` spans)
  - Left (wider): Translation text area
  - Right: Original parts (vertically stacked)
- **Mobile**: Single column (both `base: 12`)
  - Top: Translation text area
  - Bottom: Original parts
- **Breakpoint**: Mantine's `sm` breakpoint (768px)

### Header

- App title: "Translation Cost Calculator"
- Brief description (2-3 sentences)
- Top-right: Language pair selector + Settings button (gear icon) side by side
- Results panel below (see ResultsPanel section)

### ResultsPanel

Two layouts depending on whether a tariff is selected:

**Without tariff** — 3 columns, 1 row:
| Translated | Original (retyped) | Total characters |

**With tariff** — 2 columns, 3 rows:
| Translated         | Translation cost |
| Original (retyped) | Retyping cost    |
| Total characters   | Total cost       |

Order is always: translated, original (retyped), total.

Warning message shown if originals > total.

### Language Pair Selector

- **0 tariffs**: hidden
- **1 tariff**: shown, disabled (auto-selected)
- **2+ tariffs**: shown, selectable dropdown

Auto-selection logic in `App.tsx`: if exactly 1 tariff exists, `effectiveTariffId` is set to that tariff's id regardless of `selectedTariffId` state.

### TextAreaWithDrop Component

- Wraps Mantine's `Textarea`
- Props include `normalization` and `countSpaces` for selection counting
- `label` prop accepts `ReactNode | ((statusText: string | null) => ReactNode)`
  - `statusText` is `"Selected: N"` (normalized char count of selection) or filename of dropped file, or `null`
  - Selection count takes priority over filename
  - On blur, selection count resets. On manual text edit, filename resets.
- **Drag-and-drop**: uses `useDocumentDrag` hook for document-level detection
  - When any file is dragged into browser window, ALL textareas show drop overlay simultaneously
  - Overlay has `pointerEvents: 'none'` so it doesn't interfere with drop events
  - No flickering — no per-element dragEnter/dragLeave tracking
- On mobile: no drag-drop overlay, shows "Upload file" button instead
- Accepts: .docx, .md, .txt files

### Translation Panel (Left/Top)

- Uses `TextAreaWithDrop` with render function for label
- Label row: "Translation" + statusText on the left, char count + clear button on the right
- `minRows={12}`

### Originals Panel (Right/Bottom)

- Title "Original texts" at top
- Empty state helper text
- List of original items (each in a `Card` with `TextAreaWithDrop`)
- **"Add original text" button at the bottom** (below all items)
- Each item label row: char count + statusText on the left, remove button on the right

### Settings Modal

Two tabs:

**Tariffs tab:**
- "Add tariff" button
- List of tariffs, each showing:
  - Text input for label (placeholder: "e.g., English → Ukrainian")
  - Number inputs in 3-column grid: characters per sheet (default: 1800), translation price, typing price
  - Delete button
- If no tariffs: "Add a tariff to calculate prices"

**Text normalization tab:**
- **"Count spaces" Switch** (moved here from Header)
- Checkboxes for each normalization option:
  - "Collapse multiple spaces into one" (default: on)
  - "Collapse multiple line breaks into one" (default: on)
  - "Convert tabs to spaces" (default: on)
  - "Trim repeated characters (----, ====, etc.)" (default: on)
  - "Remove invisible characters" (default: on)
  - "Trim whitespace at start and end" (default: on)

### Styling

- Use Mantine's default theme
- Clean, minimal design
- Good contrast for accessibility
- Responsive spacing

## Hooks

### useSettings

```typescript
function useSettings(): {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  addTariff: (tariff: Omit<Tariff, 'id'>) => void;
  updateTariff: (id: string, partial: Partial<Tariff>) => void;
  removeTariff: (id: string) => void;
  updateNormalization: (partial: Partial<NormalizationOptions>) => void;
}
```

- Loads from localStorage on mount
- Saves to localStorage on every change
- localStorage key: `"translation-calculator-settings"`

### useCalculation

```typescript
function useCalculation(
  translationText: string,
  originals: OriginalItem[],
  settings: Settings,
  selectedTariffId: string | null
): CalculationResult
```

- Memoized with `useMemo`
- Recalculates when inputs change

### useFileExtract

```typescript
function useFileExtract(): {
  extracting: boolean;
  extract: (file: File) => Promise<string>;
  error: string | null;
}
```

- Handles file extraction with loading state
- Shows toast notifications on success/error

### useDocumentDrag

```typescript
function useDocumentDrag(): boolean
```

- Returns `true` when a file is being dragged anywhere over the browser window
- Uses `dragenter`/`dragleave` counter pattern on `document` to avoid flickering
- Prevents default browser behavior (opening file) via `dragover` and `drop` handlers on `document`
- All `TextAreaWithDrop` instances share this state — all show overlay simultaneously

## Edge Cases to Handle

- Empty texts (show 0, not errors)
- Originals sum > total (show 0 for translation, show warning in ResultsPanel)
- Very large files (show loading state via `extracting`)
- Invalid file types (show error toast)
- No tariffs configured (hide price column, show hint text)
- Single tariff (auto-select, show selector as disabled)
- Prices (show 2 decimal places)
- Zero in charsPerSheet (validate: minimum 1)
- Currency formatting (just numbers, no currency symbols)

## Number Formatting

- Characters: integer with thousand separators (e.g., "12,450")
- Prices: 2 decimal places (e.g., "150.00")

## App State Persistence

Save to localStorage (key: `"translation-calculator-state"`):
- `selectedTariffId` — remember which tariff was selected

Settings are saved separately (key: `"translation-calculator-settings"`).

Text content (translation and originals) is NOT saved — fresh start on page reload.

## UI Texts

### Placeholders

- Translation textarea: "Paste translated text from Word here, or drop a .docx/.md/.txt file"
- Original textarea: "Paste original (non-translated) text here"
- Tariff label input: "e.g., English → Ukrainian"

### Buttons

- Add original: "Add original text"
- Clear (tooltip): "Clear"
- Remove (tooltip): "Remove"
- Upload file: "Upload file"
- Settings: gear icon, no text
- Add tariff: "Add tariff"
- Delete tariff: "Delete"

### Empty States

- No text entered: Results show "0" for all values
- No originals added: "Click 'Add original text' if part of the document wasn't translated"
- No tariffs: "Set up tariffs in settings to calculate prices"

### Results Labels

- "Translated"
- "Original (retyped)"
- "Total characters"
- "Translation cost" / "Retyping cost" / "Total cost"

### Notifications/Toasts

- File loaded: "File loaded successfully"
- Invalid file: "Unsupported file type. Please use .docx, .md, or .txt"
- File error: "Failed to read file"

### Header Description

"Calculate translation costs fairly. Paste your translated document, then add any original text that wasn't translated (just retyped). The calculator normalizes whitespace and separates translation from retyping costs."

## Notes

- All UI text in English
- No authentication needed
- No backend — everything client-side
- Prioritize simplicity and usability over features
- Use Mantine components wherever possible
