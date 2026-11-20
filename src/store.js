import { get, set } from 'idb-keyval'

const KEY = 'letterdesk-v1'
export const empty = { templates: [], letters: [], settings: { fy: '', seq: 1 }, lastBackup: null }

export const load = async () => {
  const d = { ...empty, ...(await get(KEY)) }
  return { ...d, templates: d.templates.filter((t) => t.blocks) }
}
export const save = (db) => set(KEY, db)
