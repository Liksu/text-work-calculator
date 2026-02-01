# Text Work Calculator

A client-side web calculator for fair text work pricing. Whether it's translation, copywriting, editing, or transcription — documents often contain excessive formatting whitespace and reused text that shouldn't be charged at the full rate. This tool separates new text from reused text and calculates costs accordingly.

## Features

- **Text normalization** — collapses redundant whitespace, tabs, line breaks, repeated formatting characters (`----`, `====`), and invisible zero-width characters
- **Dual pricing** — distinguishes between new text and reused text, each priced at its own rate per sheet
- **File import** — drag-and-drop or upload `.docx`, `.pdf`, `.md`, and `.txt` files; text is extracted automatically (PDF loaded on demand)
- **Multiple tariffs** — configure different rate cards; single tariff auto-selects
- **Selection counting** — select text in any textarea to see normalized character count inline
- **Persistent settings** — tariffs, normalization options, and selected tariff are saved to localStorage

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
