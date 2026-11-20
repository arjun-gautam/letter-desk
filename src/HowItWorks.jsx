export default function HowItWorks() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>How Letter Desk works</h2>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>
        Letter Desk is a browser-based tool for writing, numbering, and archiving formal letters.
        No account or internet connection needed — everything stays in your browser.
      </p>

      <Step n={1} title="Create a template">
        Go to the <b>Templates</b> tab and click <b>New template</b>. A standard letter layout is
        pre-loaded. Drag and drop components (letterhead, recipient, paragraph, signature, etc.)
        to build the structure you want. Give the template a name and click <b>Save template</b>.
      </Step>

      <Step n={2} title="Add placeholders for variable text">
        Inside any component's text, type a field name wrapped in curly braces — for example{' '}
        <code>{'{subject}'}</code> or <code>{'{recipient_name}'}</code>. Each placeholder
        automatically becomes a form field when you create a letter from that template.
        Fields like <code>{'{ref_no}'}</code> and <code>{'{date}'}</code> are filled in
        automatically.
      </Step>

      <Step n={3} title="Write a letter">
        Go to <b>New letter</b>, pick a template, and fill in the fields. A live preview on the
        right shows exactly how the letter will look. When you're done, click{' '}
        <b>Create and download</b> — a <code>.docx</code> file is saved to your computer instantly.
      </Step>

      <Step n={4} title="Find it again later">
        Every letter you generate is saved to the <b>Register</b>. You can search by reference
        number, template name, or any field value. From there you can download the letter again or
        use it as a base for a new one.
      </Step>

      <Step n={5} title="Automatic reference numbering">
        Each letter gets a sequential reference number (e.g. <code>001</code>,{' '}
        <code>002</code> …). In <b>Settings</b> you can add a prefix such as a fiscal year so
        numbers read <code>2083/84/001</code>. The counter advances automatically.
      </Step>

      <Step n={6} title="Back up your data">
        Your letters and templates live in this browser only. Use <b>Settings &amp; backup</b> to
        download a <code>.json</code> backup file. Keep it somewhere safe — you can restore it on
        any computer by uploading it from the same screen. Letter Desk will remind you if it has
        been more than a week since your last backup.
      </Step>

      <div style={{ background: 'var(--warn)', borderRadius: 8, padding: '12px 16px', marginTop: 24, fontSize: '.9rem' }}>
        <b>Tip:</b> Keep the Letter Desk file (the HTML or the app URL) in one fixed place on your
        computer. Browser storage is tied to that location — moving the file will start with a
        blank slate.
      </div>
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
      <div style={{
        flexShrink: 0,
        width: 32, height: 32,
        borderRadius: '50%',
        background: 'var(--accent)',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '.95rem',
        marginTop: 2,
      }}>
        {n}
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ color: 'var(--muted)', fontSize: '.95rem', lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  )
}
