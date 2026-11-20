// Pre-defined components. `def` is what a block starts with when inserted.
// Write {field_name} anywhere in a block's text: it becomes a form field automatically.
export const CATALOG = {
  letterhead: { label: 'Letterhead', def: { title: 'Office name', text: 'Address line\nPhone, email', align: 'center' } },
  refdate: { label: 'Reference and date', def: { left: 'Ref. No.: {ref_no}', right: 'Date: {date}' } },
  recipient: { label: 'Recipient', def: { text: 'To,\n{recipient_name}\n{recipient_address}', align: 'left' } },
  subject: { label: 'Subject line', def: { text: 'Subject: {subject}', align: 'left', bold: true } },
  salutation: { label: 'Salutation', def: { text: 'Dear Sir/Madam,', align: 'left' } },
  paragraph: { label: 'Paragraph', def: { text: '{body}', align: 'justify' } },
  list: { label: 'Numbered list', def: { text: 'First point\nSecond point', align: 'left' } },
  signature: { label: 'Closing and signature', def: { text: 'Yours faithfully,\n\n\n{sender_name}\n{sender_designation}', align: 'right' } },
  cc: { label: 'Copy to (cc)', def: { text: 'Copy to:\n{cc_list}', align: 'left' } },
  enclosure: { label: 'Enclosure', def: { text: 'Enclosure: {enclosure}', align: 'left' } },
  spacer: { label: 'Blank space', def: {} },
  divider: { label: 'Divider line', def: {} },
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
export const mk = (type) => ({ id: uid(), type, ...CATALOG[type].def })
export const starter = () => ({
  id: uid(), name: 'New template', font: 'Times New Roman', size: 12,
  blocks: ['letterhead', 'refdate', 'recipient', 'subject', 'salutation', 'paragraph', 'signature'].map(mk),
})

export const subst = (s, v) => (s || '').replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '')
export const fieldsOf = (blocks) => {
  const out = new Set()
  for (const b of blocks) for (const k of ['title', 'text', 'left', 'right'])
    for (const m of (b[k] || '').matchAll(/\{(\w+)\}/g)) out.add(m[1])
  return [...out]
}
