# Text Work Calculator

A client-side web calculator for fair text work pricing. Whether it's translation, copywriting, editing, or transcription — documents often contain excessive formatting whitespace and reused text that shouldn't be charged at the full rate. This tool separates new text from reused text and calculates costs accordingly.

## Features

- **Text normalization** — collapses redundant whitespace, tabs, line breaks, repeated formatting characters (`----`, `====`), and invisible zero-width characters
- **Dual pricing** — distinguishes between new text and reused text, each priced at its own rate per sheet
- **File import** — drag-and-drop or upload `.docx`, `.pdf`, `.md`, and `.txt` files; text is extracted automatically (PDF loaded on demand)
- **Multiple tariffs** — configure different rate cards; single tariff auto-selects
- **Selection counting** — select text in any textarea to see normalized character count inline
- **Persistent settings** — tariffs, normalization options, and selected tariff are saved to localStorage

## How It Works

The calculator takes the full text and a list of reused text blocks, then runs them through the same normalization pipeline before counting characters.

**Normalization pipeline** (applied in order):

1. Remove invisible characters — zero-width spaces, BOM, soft hyphens, directional marks
2. Convert tabs to spaces
3. Collapse whitespace — first removes spaces between formatting characters (`- - -` → `---`), then replaces any whitespace sequence with a single space
4. Collapse line breaks — multiple `\r\n`, `\r`, or `\n` become a single `\n`
5. Trim repeated formatting characters — runs of 4+ identical `-`, `=`, `_`, `*`, `.`, `~` are shortened to 3
6. Trim leading and trailing whitespace
7. (Optional) Remove all spaces — if "Count spaces" is off, spaces are stripped entirely

Each step can be toggled independently in settings.

**Character counting:**

- **Total characters** = length of normalized full text
- **Reused characters** = sum of lengths of each normalized reused block
- **New text characters** = total − reused (minimum 0)

**Price calculation** (when a tariff is selected):

Each tariff defines characters per sheet, a price for new text sheets, and a price for reused text sheets. The cost is:

```
new text cost  = (new text chars / chars per sheet) × new text price
reused cost    = (reused chars / chars per sheet) × reused text price
total cost     = new text cost + reused cost
```

## Usage

### Setting up tariffs

Open **Settings** (gear icon in the top-right corner) and go to the **Tariffs** tab. Add a tariff by clicking **Add tariff**, then fill in:

- **Label** — a name for this rate (e.g., "Standard rate")
- **Characters per sheet** — how many characters make up one billable sheet (default: 1800)
- **New text price** — price per sheet for new text
- **Reused text price** — price per sheet for reused text

You can add multiple tariffs and switch between them using the dropdown next to the settings button. If only one tariff exists, it is selected automatically.

### Adjusting normalization

In the **Text normalization** tab of Settings, toggle individual normalization steps and the **Count spaces** switch. Changes take effect immediately — all character counts and prices recalculate on the fly.

### Working with text

1. **Paste or drop** your full text into the left panel (or the top panel on mobile). You can also drop a `.docx`, `.pdf`, `.md`, or `.txt` file — the text will be extracted automatically.
2. The **character count** appears in the panel header and the **results panel** below the title updates instantly.
3. To mark reused parts, click **Add reused text** in the right panel and paste the reused fragment. Add as many blocks as needed — each one is counted separately.
4. The results panel shows new text, reused text, and total characters. When a tariff is selected, it also shows the cost breakdown.

### Selection counting

Select any portion of text in any textarea to see its normalized character count in the label (shown as "Selected: N"). This is useful for checking how a specific fragment is counted after normalization.

### Tips

- If reused characters exceed the total, a warning is shown and new text count is set to 0.
- Text content is not saved between sessions — only settings and the selected tariff persist.
- On mobile, use the **Upload file** button instead of drag-and-drop.

## Tech Stack

React 19, TypeScript, Vite, Mantine v8, mammoth (docx), marked (markdown), pdfjs-dist (pdf, lazy-loaded).

## Getting Started

```bash
npm install
npm run dev
```

## Deploy

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys to GitHub Pages on every push to `main`.

To enable: go to repository Settings > Pages > Source and select **GitHub Actions**.

## License

MIT
