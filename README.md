# Letter Desk

**Live site: [https://office-letter-desk.web.app/](https://office-letter-desk.web.app/)**

Offline letter generator. Build templates from drag-and-drop components, fill a form, download a `.docx`, keep a searchable register, and back up to a JSON file.

## Development

```bash
npm install
npm run dev      # development server
npm run build    # produces dist/index.html (can be opened directly, no server needed)
```

## How it works

In a template, write `{field_name}` in any text and it becomes a form field when writing a letter. `{ref_no}` and `{date}` are filled in automatically.

Data is stored in the browser (IndexedDB). Back up regularly via **Settings & backup**. Opening `dist/index.html` from a different path uses a separate store, so keep the file in one fixed location.
