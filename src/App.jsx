import { useEffect, useState } from 'react'
import { load, save } from './store.js'
import { fieldsOf, uid, starter } from './blocks.js'
import { render, download } from './export.js'
import Editor, { Preview } from './Editor.jsx'
import HowItWorks from './HowItWorks.jsx'

const AUTO = ['ref_no', 'date']
const DAY = 864e5
const today = () => new Date().toISOString().slice(0, 10)
const refOf = (s) => `${s.fy ? s.fy + '/' : ''}${String(s.seq).padStart(3, '0')}`
const safe = (s) => s.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-')
const ago = (t) => Math.floor((Date.now() - t) / DAY)
const fieldsFor = (t) => fieldsOf(t.blocks).filter((f) => !AUTO.includes(f))
const snapOf = (t) => ({ font: t.font, size: t.size, blocks: t.blocks })

export default function App() {
  const [db, setDb] = useState(null)
  const [tab, setTab] = useState('new')
  const [draft, setDraft] = useState(null)
  const [editing, setEditing] = useState(null)
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    load().then(setDb)
    navigator.storage?.persist?.()
  }, [])
  if (!db) return <p className="pad">Loading…</p>

  const update = (next) => { setDb(next); save(next) }
  const tpl = db.templates.find((t) => t.id === draft?.tid)
  const stale = (db.letters.length || db.templates.length) && (!db.lastBackup || ago(db.lastBackup) >= 7)

  if (editing) {
    const saveTpl = (t) => {
      const has = db.templates.some((x) => x.id === t.id)
      update({ ...db, templates: has ? db.templates.map((x) => (x.id === t.id ? t : x)) : [...db.templates, t] })
      setEditing(null)
    }
    return <Editor tpl={editing} onSave={saveTpl} onClose={() => setEditing(null)} />
  }

  const build = async (l) => {
    try {
      download(await render(l.snap, { ...l.values, ref_no: l.ref, date: l.date }), `${safe(l.ref)}_${safe(l.templateName)}.docx`)
      setErr('')
      return true
    } catch (e) {
      setErr('Could not generate the letter: ' + e.message)
      return false
    }
  }

  const generate = async () => {
    const l = { id: uid(), ref: refOf(db.settings), date: draft.date, tid: tpl.id, templateName: tpl.name, values: draft.values, snap: snapOf(tpl), at: Date.now() }
    if (!(await build(l))) return
    update({ ...db, letters: [l, ...db.letters], settings: { ...db.settings, seq: db.settings.seq + 1 } })
    setDraft(null)
    setTab('register')
  }

  const reuse = (l) => {
    if (!db.templates.some((t) => t.id === l.tid)) return setErr('The template for this letter was deleted.')
    setDraft({ tid: l.tid, date: today(), values: { ...l.values } })
    setTab('new')
    setErr('')
  }

  const exportBackup = () => {
    const next = { ...db, lastBackup: Date.now() }
    download(new Blob([JSON.stringify(next)], { type: 'application/json' }), `letterdesk-backup-${today()}.json`)
    update(next)
  }

  const importBackup = async (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f || !confirm('Replace ALL current data with this backup?')) return
    try {
      const d = JSON.parse(await f.text())
      if (!Array.isArray(d.templates) || !Array.isArray(d.letters)) throw new Error()
      update({ ...d, settings: { fy: '', seq: 1, ...d.settings } })
      setErr('')
    } catch {
      setErr('That file is not a Letter Desk backup.')
    }
  }

  const setSetting = (k, v) => update({ ...db, settings: { ...db.settings, [k]: v } })
  const shown = db.letters.filter((l) => (l.ref + l.templateName + Object.values(l.values).join(' ')).toLowerCase().includes(q.toLowerCase()))
  const tabs = [['new', 'New letter'], ['register', `Register (${db.letters.length})`], ['templates', 'Templates'], ['settings', 'Settings & backup'], ['how', 'How it works']]

  return (
    <div className={'app' + (tab === 'new' && draft ? ' wide' : '')}>
      <header>
        <h1>Letter Desk</h1>
        <nav>
          {tabs.map(([k, label]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setErr('') }}>{label}</button>
          ))}
        </nav>
      </header>

      {stale ? (
        <p className="warn">
          {db.lastBackup ? `Last backup was ${ago(db.lastBackup)} days ago.` : 'No backup yet.'}{' '}
          <button className="link" onClick={exportBackup}>Back up now</button>
        </p>
      ) : null}
      {err && <p className="err" role="alert">{err}</p>}

      {tab === 'new' && !draft && (
        <section>
          <h2>Choose a template</h2>
          {db.templates.length === 0 && <p className="muted">No templates yet. Create one in Templates.</p>}
          <div className="list">
            {db.templates.map((t) => (
              <button key={t.id} className="row" onClick={() => setDraft({ tid: t.id, date: today(), values: {} })}>
                <b>{t.name}</b>
                <span className="muted">{fieldsFor(t).length} fields</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {tab === 'new' && draft && tpl && (
        <div className="split">
          <section>
            <h2>{tpl.name}</h2>
            <p className="muted">Reference number: <b>{refOf(db.settings)}</b></p>
            <label>Date
              <input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </label>
            {fieldsFor(tpl).map((f) => {
              const props = { value: draft.values[f] || '', onChange: (e) => setDraft({ ...draft, values: { ...draft.values, [f]: e.target.value } }) }
              return (
                <label key={f}>{f.replace(/_/g, ' ')}
                  {/body|detail|content|text|matter|list|address/i.test(f) ? <textarea rows={5} {...props} /> : <input {...props} />}
                </label>
              )
            })}
            <div className="actions">
              <button className="primary" onClick={generate}>Create and download</button>
              <button onClick={() => setDraft(null)}>Cancel</button>
            </div>
          </section>
          <aside>
            <Preview t={tpl} values={{ ...draft.values, ref_no: refOf(db.settings), date: draft.date }} />
          </aside>
        </div>
      )}

      {tab === 'register' && (
        <section>
          <input className="search" placeholder="Search by number, template, or any field" value={q} onChange={(e) => setQ(e.target.value)} />
          {shown.length === 0 && <p className="muted">{db.letters.length ? 'No letters match.' : 'Letters you create will be listed here.'}</p>}
          <div className="list">
            {shown.map((l) => (
              <div key={l.id} className="row">
                <div>
                  <b>{l.ref}</b> <span className="muted">{l.date} · {l.templateName}</span>
                  <div>{l.values.subject || Object.values(l.values)[0] || ''}</div>
                </div>
                <div className="actions">
                  <button onClick={() => build(l)}>Download</button>
                  <button onClick={() => reuse(l)}>Use as base</button>
                  <button onClick={() => confirm(`Delete ${l.ref}?`) && update({ ...db, letters: db.letters.filter((x) => x.id !== l.id) })}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'templates' && (
        <section>
          <div className="actions"><button className="primary" onClick={() => setEditing(starter())}>New template</button></div>
          <div className="list" style={{ marginTop: 12 }}>
            {db.templates.length === 0 && <p className="muted">Start from the standard letter layout, then change it.</p>}
            {db.templates.map((t) => (
              <div key={t.id} className="row">
                <div><b>{t.name}</b><div className="muted">{fieldsFor(t).join(', ') || 'No fields'}</div></div>
                <div className="actions">
                  <button onClick={() => setEditing(t)}>Edit</button>
                  <button onClick={() => setEditing({ ...t, id: uid(), name: t.name + ' copy', blocks: t.blocks.map((b) => ({ ...b, id: uid() })) })}>Duplicate</button>
                  <button onClick={() => confirm(`Delete template "${t.name}"? Past letters keep their own copy.`) && update({ ...db, templates: db.templates.filter((x) => x.id !== t.id) })}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'settings' && (
        <section>
          <h2>Numbering</h2>
          <label>Prefix, such as the fiscal year (optional)
            <input value={db.settings.fy} onChange={(e) => setSetting('fy', e.target.value)} placeholder="2083/84" />
          </label>
          <label>Next number
            <input type="number" min="1" value={db.settings.seq} onChange={(e) => setSetting('seq', Math.max(1, +e.target.value || 1))} />
          </label>
          <h2>Backup</h2>
          <p className="muted">
            Data lives in this browser. Save a backup file regularly to a USB drive or another folder, and keep this app file in one fixed place.
          </p>
          <div className="actions">
            <button className="primary" onClick={exportBackup}>Save backup file</button>
            <label className="file">Restore from backup<input type="file" accept=".json" onChange={importBackup} /></label>
          </div>
          {db.lastBackup && <p className="muted">Last backup: {new Date(db.lastBackup).toLocaleString()}</p>}
        </section>
      )}
      {tab === 'how' && (
        <section>
          <HowItWorks />
        </section>
      )}
    </div>
  )
}
