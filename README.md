# Letter Desk

Offline letter generator. Build templates from drag-and-drop components, fill a form, download a .docx, keep a searchable register, back up to a JSON file.

    npm install
    npm run dev      # development
    npm run build    # makes ONE file: dist/index.html (double-click to open, no server needed)

In a template, write {field_name} in any text and it becomes a form field. {ref_no} and {date} are filled automatically.
Data is stored in the browser (IndexedDB). Back up regularly; opening dist/index.html from a different path uses a different store.
