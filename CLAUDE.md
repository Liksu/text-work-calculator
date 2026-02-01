# Text Work Calculator

## Project Overview

A web-based calculator for fair text work pricing. Whether it's translation, copywriting, editing, or transcription — documents often contain:
- Excessive whitespace used for formatting (tabs, multiple line breaks)
- Reused text that shouldn't be charged at the full rate

This tool helps calculate fair costs by:
1. Normalizing whitespace according to configurable rules
2. Separating new text from reused text
3. Calculating prices based on configurable tariffs

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Mantine v8** for UI components (use @mantine/core, @mantine/hooks)
- **@tabler/icons-react** for icons
- **mammoth** for extracting text from .docx files
- **marked** for parsing Markdown files
- **pdfjs-dist** for extracting text from PDF files (lazy-loaded via dynamic import)
- **localStorage** for persisting settings

### Installation

```bash
npm create vite@latest . -- --template react-ts
npm install @mantine/core @mantine/hooks @mantine/notifications @tabler/icons-react mammoth marked pdfjs-dist
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
public/
└── favicon.svg
```

## Data Types

```typescript
// types/index.ts

export interface Tariff {
  id: string;
  label: string;              // Free text, e.g., "Standard rate"
  charsPerSheet: number;      // Characters per "sheet" (e.g., 1800)
  newTextPrice: number;       // Price per sheet for new text
  reusedTextPrice: number;    // Price per sheet for reused text
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

export interface ReusedItem {
  id: string;
  text: string;
}

export interface CalculationResult {
  totalChars: number;           // Full text character count (after normalization)
  newTextChars: number;         // totalChars - reusedChars
  reusedChars: number;          // Sum of all reused parts

  price: {                      // null if no tariff selected
    newText: number;
    reused: number;
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
- `collapseSpaces` uses aggressive `/\s+/g` — collapses everything including mixed whitespace/newline sequences into a single space.
- `collapseSpaces` first removes spaces between formatting chars (`"- - -"` → `"---"`) so `trimRepeatedChars` can then collapse them.
- `trimRepeatedChars` only targets formatting characters `[-=_*.~]`, never letters or digits.
- `collapseNewlines` uses `/[\r\n]+/g` — handles Windows `\r\n`, Mac `\r`, and Unix `\n` line endings.

### extractText.ts

```typescript
import mammoth from 'mammoth';
import { marked } from 'marked';

export async function extractFromDocx(file: File): Promise<string> { ... }
export async function extractFromMd(file: File): Promise<string> { ... }

export async function extractFromPdf(file: File): Promise<string> {
  // Dynamic import — pdfjs-dist loaded only when PDF is opened
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  // Extract text page by page
}

export async function extractFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'docx') return extractFromDocx(file);
  if (ext === 'md') return extractFromMd(file);
  if (ext === 'pdf') return extractFromPdf(file);
  return file.text();
}
```

### calculate.ts

```typescript
export function calculate(
  text: string,
  reusedTexts: string[],
  normalization: NormalizationOptions,
  countSpaces: boolean,
  tariff: Tariff | null
): CalculationResult {
  const normalizedTotal = normalize(text, normalization, countSpaces);
  const normalizedReused = reusedTexts.map(t => normalize(t, normalization, countSpaces));

  const totalChars = normalizedTotal.length;
  const reusedChars = normalizedReused.reduce((sum, t) => sum + t.length, 0);
  const newTextChars = Math.max(0, totalChars - reusedChars);

  if (!tariff) {
    return { totalChars, newTextChars, reusedChars, price: null };
  }

  const newTextSheets = newTextChars / tariff.charsPerSheet;
  const reusedSheets = reusedChars / tariff.charsPerSheet;

  return {
    totalChars,
    newTextChars,
    reusedChars,
    price: {
      newText: newTextSheets * tariff.newTextPrice,
      reused: reusedSheets * tariff.reusedTextPrice,
      total: newTextSheets * tariff.newTextPrice + reusedSheets * tariff.reusedTextPrice,
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
  - Left (wider): Full text area
  - Right: Reused text parts (vertically stacked)
- **Mobile**: Single column (both `base: 12`)
- **Breakpoint**: Mantine's `sm` breakpoint (768px)

### Header

- App title: "Text Work Calculator"
- Brief description (2-3 sentences)
- Top-right: Tariff selector + Settings button (gear icon) side by side
- Results panel below (see ResultsPanel section)

### ResultsPanel

Two layouts depending on whether a tariff is selected:

**Without tariff** — 3 columns, 1 row:
| New text | Reused text | Total characters |

**With tariff** — 2 columns, 3 rows:
| New text         | New text cost    |
| Reused text      | Reused text cost |
| Total characters | Total cost       |

Order is always: new text, reused text, total.

Warning message shown if reused > total.

### Tariff Selector

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
- Accepts: .docx, .pdf, .md, .txt files

### Full Text Panel (Left/Top)

- Uses `TextAreaWithDrop` with render function for label
- Label row: "Full text" + statusText on the left, char count + clear button on the right
- `minRows={12}`

### Reused Texts Panel (Right/Bottom)

- Title "Reused texts" at top
- Empty state: "Add reused text blocks that shouldn't count as new work"
- List of reused items (each in a `Card` with `TextAreaWithDrop`)
- **"Add reused text" button at the bottom** (below all items)
- Each item label row: char count + statusText on the left, remove button on the right

### Settings Modal

Two tabs:

**Tariffs tab:**
- "Add tariff" button
- List of tariffs, each showing:
  - Text input for label (placeholder: "e.g., Standard rate")
  - Number inputs in 3-column grid: characters per sheet (default: 1800), new text price, reused text price
  - Delete button
- If no tariffs: "Add a tariff to calculate prices"

**Text normalization tab:**
- **"Count spaces" Switch**
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
- SVG favicon: blue document icon with text lines and `#` symbol (`public/favicon.svg`)

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
- localStorage key: `"text-work-calculator-settings"`

### useCalculation

```typescript
function useCalculation(
  text: string,
  reusedItems: ReusedItem[],
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
- Supported: .docx, .pdf, .md, .txt

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
- Reused sum > total (show 0 for new text, show warning in ResultsPanel)
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

Save to localStorage (key: `"text-work-calculator-state"`):
- `selectedTariffId` — remember which tariff was selected

Settings are saved separately (key: `"text-work-calculator-settings"`).

Text content (full text and reused items) is NOT saved — fresh start on page reload.

## UI Texts

### Placeholders

- Full text textarea: "Paste your text here, or drop a .docx/.pdf/.md/.txt file"
- Reused text textarea: "Paste reused text here"
- Tariff label input: "e.g., Standard rate"

### Buttons

- Add reused: "Add reused text"
- Clear (tooltip): "Clear"
- Remove (tooltip): "Remove"
- Upload file: "Upload file"
- Settings: gear icon, no text
- Add tariff: "Add tariff"
- Delete tariff: "Delete"

### Empty States

- No text entered: Results show "0" for all values
- No reused items: "Add reused text blocks that shouldn't count as new work"
- No tariffs: "Set up tariffs in settings to calculate prices"

### Results Labels

- "New text"
- "Reused text"
- "Total characters"
- "New text cost" / "Reused text cost" / "Total cost"

### Notifications/Toasts

- File loaded: "File loaded successfully"
- Invalid file: "Unsupported file type. Please use .docx, .pdf, .md, or .txt"
- File error: "Failed to read file"

### Header Description

"Calculate text work costs fairly. Paste your text, then mark any reused parts that shouldn't count as new work. The calculator normalizes whitespace and separates new text from reused text for fair pricing."

## Deployment

- GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- Builds on every push to `main`
- Vite `base`: `/text-work-calculator/`
- Enable in repo Settings > Pages > Source: **GitHub Actions**

## Notes

- All UI text in English
- No authentication needed
- No backend — everything client-side
- Prioritize simplicity and usability over features
- Use Mantine components wherever possible
