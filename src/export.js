import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, BorderStyle, Tab } from 'docx'
import { subst } from './blocks.js'

const AL = { left: AlignmentType.LEFT, center: AlignmentType.CENTER, right: AlignmentType.RIGHT, justify: AlignmentType.JUSTIFIED }
const WIDTH = 9026 // A4 text width in twips with 2.54 cm margins
const rule = (color, size) => ({ bottom: { style: BorderStyle.SINGLE, size, color, space: 4 } })
const lines = (s, v) => subst(s, v).split('\n')

const build = (b, v) => {
  switch (b.type) {
    case 'letterhead':
      return [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: subst(b.title, v), bold: true, size: 32 })] }),
        ...lines(b.text, v).map((l, i, a) => new Paragraph({
          alignment: AlignmentType.CENTER, children: [new TextRun(l)],
          ...(i === a.length - 1 ? { border: rule('000000', 8), spacing: { after: 240 } } : {}),
        })),
      ]
    case 'refdate':
      return [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: WIDTH }], spacing: { after: 200 },
        children: [new TextRun(subst(b.left, v)), new TextRun({ children: [new Tab(), subst(b.right, v)] })],
      })]
    case 'divider':
      return [new Paragraph({ border: rule('999999', 6), spacing: { after: 200 }, children: [] })]
    case 'spacer':
      return [new Paragraph({ children: [] })]
    case 'list':
      return lines(b.text, v).filter(Boolean).map((l, i) => new Paragraph({
        indent: { left: 360 }, spacing: { after: 80 }, children: [new TextRun(`${i + 1}. ${l}`)],
      }))
    default:
      return lines(b.text, v).map((l, i, a) => new Paragraph({
        alignment: AL[b.align] || AlignmentType.LEFT,
        spacing: { after: i === a.length - 1 ? 200 : 0 },
        children: [new TextRun({ text: l, bold: !!b.bold })],
      }))
  }
}

// snap = { font, size, blocks }; v = field values (including ref_no and date)
export const render = (snap, v) => {
  const font = { ascii: snap.font, hAnsi: snap.font, cs: snap.font, eastAsia: snap.font }
  return Packer.toBlob(new Document({
    styles: { default: { document: { run: { font, size: snap.size * 2 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: snap.blocks.flatMap((b) => build(b, v)),
    }],
  }))
}

export const download = (blob, name) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
