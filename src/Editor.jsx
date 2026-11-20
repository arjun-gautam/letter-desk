import { useState } from 'react'
import { CATALOG, mk, fieldsOf, subst } from './blocks.js'

const FONTS = ['Times New Roman', 'Arial', 'Calibri', 'Mangal', 'Kalimati']
const NO_TEXT = ['spacer', 'divider']

// Paper preview. With `values` it shows the filled letter; without, it highlights {placeholders}.
export function Preview({ t, values }) {
  const R = (s = '') => values ? subst(s, values)
    : s.split(/(\{\w+\})/g).map((p, i) => (/^\{\w+\}$/.test(p) ? <mark key={i}>{p}</mark> : p))
  const pre = { whiteSpace: 'pre-wrap' }
  return (
    <div className="paper" style={{ fontFamily: `"${t.font}", serif`, fontSize: t.size + 'px' }}>
      {t.blocks.map((b) => {
        if (b.type === 'letterhead') return <div key={b.id} className="lh"><b style={{ fontSize: '1.4em' }}>{R(b.title)}</b><div style={pre}>{R(b.text)}</div></div>
        if (b.type === 'refdate') return <div key={b.id} className="rd"><span>{R(b.left)}</span><span>{R(b.right)}</span></div>
        if (b.type === 'divider') return <hr key={b.id} />
        if (b.type === 'spacer') return <div key={b.id} style={{ height: '1.4em' }} />
        if (b.type === 'list') return <div key={b.id} className="bl">{(b.text || '').split('\n').filter(Boolean).map((l, i) => <div key={i}>{i + 1}. {R(l)}</div>)}</div>
        return <div key={b.id} className="bl" style={{ ...pre, textAlign: b.align, fontWeight: b.bold ? 700 : 400 }}>{R(b.text)}</div>
      })}
    </div>
  )
}

export default function Editor({ tpl, onSave, onClose }) {
  const [t, setT] = useState(tpl)
  const [over, setOver] = useState(null)
  const n = t.blocks.length
  const set = (patch) => setT({ ...t, ...patch })
  const setB = (id, patch) => set({ blocks: t.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })
  const insert = (type, at) => { const bl = [...t.blocks]; bl.splice(at, 0, mk(type)); set({ blocks: bl }) }
  const move = (id, at) => {
    const from = t.blocks.findIndex((b) => b.id === id)
    if (from < 0) return
    const rest = t.blocks.filter((b) => b.id !== id)
    rest.splice(at > from ? at - 1 : at, 0, t.blocks[from])
    set({ blocks: rest })
  }
  const drop = (e) => {
    e.preventDefault()
    const d = e.dataTransfer.getData('text/plain'), at = over ?? n
    setOver(null)
    if (d.startsWith('new:')) insert(d.slice(4), at)
    else if (d.startsWith('move:')) move(d.slice(5), at)
  }
  const fields = fieldsOf(t.blocks)

  return (
    <div className="app wide">
      <header>
        <h1>Template</h1>
        <div className="actions">
          <button className="primary" disabled={!t.name.trim()} onClick={() => onSave(t)}>Save template</button>
          <button onClick={onClose}>Close without saving</button>
        </div>
      </header>

      <div className="split">
        <div>
          <section>
            <div className="meta">
              <label>Template name<input value={t.name} onChange={(e) => set({ name: e.target.value })} /></label>
              <label>Font<input list="fonts" value={t.font} onChange={(e) => set({ font: e.target.value })} /></label>
              <label>Size (pt)<input type="number" min="8" max="20" value={t.size} onChange={(e) => set({ size: +e.target.value || 12 })} /></label>
            </div>
            <datalist id="fonts">{FONTS.map((f) => <option key={f} value={f} />)}</datalist>

            <h2>Components</h2>
            <p className="muted">Drag a component into the letter, or click it to add at the end.</p>
            <div className="chips">
              {Object.entries(CATALOG).map(([k, c]) => (
                <div key={k} className="chip" role="button" tabIndex={0} draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'new:' + k)}
                  onDragEnd={() => setOver(null)}
                  onClick={() => insert(k, n)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), insert(k, n))}>
                  {c.label}
                </div>
              ))}
            </div>
          </section>

          <h2>Letter layout</h2>
          <div className="canvas" onDragOver={(e) => { e.preventDefault(); if (e.target === e.currentTarget) setOver(n) }} onDrop={drop}>
            {n === 0 && <p className="muted pad">Drop components here.</p>}
            {t.blocks.map((b, i) => (
              <div key={b.id}>
                {over === i && <div className="drop" />}
                <div className="card"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setOver(e.clientY < r.top + r.height / 2 ? i : i + 1) }}>
                  <div className="card-head">
                    <span className="handle" draggable title="Drag to reorder"
                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', 'move:' + b.id); e.dataTransfer.setDragImage(e.currentTarget.closest('.card'), 10, 10) }}
                      onDragEnd={() => setOver(null)}>⠿ {CATALOG[b.type].label}</span>
                    <span className="actions">
                      <button disabled={i === 0} onClick={() => move(b.id, i - 1)} aria-label="Move up">Up</button>
                      <button disabled={i === n - 1} onClick={() => move(b.id, i + 2)} aria-label="Move down">Down</button>
                      <button onClick={() => set({ blocks: t.blocks.filter((x) => x.id !== b.id) })}>Remove</button>
                    </span>
                  </div>
                  {b.type === 'letterhead' && <input value={b.title} onChange={(e) => setB(b.id, { title: e.target.value })} />}
                  {b.type === 'refdate' && (
                    <div className="two">
                      <input value={b.left} onChange={(e) => setB(b.id, { left: e.target.value })} />
                      <input value={b.right} onChange={(e) => setB(b.id, { right: e.target.value })} />
                    </div>
                  )}
                  {!NO_TEXT.includes(b.type) && b.type !== 'refdate' && (
                    <textarea rows={Math.min(6, (b.text || '').split('\n').length + 1)} value={b.text} onChange={(e) => setB(b.id, { text: e.target.value })} />
                  )}
                  {!NO_TEXT.includes(b.type) && !['letterhead', 'refdate', 'list'].includes(b.type) && (
                    <div className="opts">
                      <select value={b.align} onChange={(e) => setB(b.id, { align: e.target.value })} aria-label="Alignment">
                        {['left', 'center', 'right', 'justify'].map((a) => <option key={a}>{a}</option>)}
                      </select>
                      <label className="inline"><input type="checkbox" checked={!!b.bold} onChange={(e) => setB(b.id, { bold: e.target.checked })} /> Bold</label>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {over === n && n > 0 && <div className="drop" />}
          </div>
        </div>

        <aside>
          <h2>Preview</h2>
          <Preview t={t} />
          <p className="muted">Form fields: {fields.filter((f) => !['ref_no', 'date'].includes(f)).join(', ') || 'none yet'}. Type {'{field_name}'} in any text to add one.</p>
        </aside>
      </div>
    </div>
  )
}
