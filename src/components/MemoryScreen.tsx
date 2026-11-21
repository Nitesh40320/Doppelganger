import { useState } from 'react'
import { useMemoryStore } from '../hooks/useMemoryStore'
import { MEMORY_CATEGORIES, type MemoryCategory, type MemoryEntry } from '../types/memory'

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function MemoryScreen() {
  const { entries, addEntry, updateEntry, deleteEntry, clearAll } = useMemoryStore()

  const [category, setCategory] = useState<MemoryCategory>('preference')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [confidence, setConfidence] = useState(80)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const categoryConfig = MEMORY_CATEGORIES[category]

  function handleAdd() {
    const text = content.trim()
    if (!text) return
    addEntry({
      category,
      content: text,
      source: categoryConfig.usesSourceAndConfidence ? source : undefined,
      confidence: categoryConfig.usesSourceAndConfidence ? confidence : undefined,
    })
    setContent('')
    setSource('')
    setConfidence(80)
  }

  function startEdit(entry: MemoryEntry) {
    setEditingId(entry.id)
    setEditContent(entry.content)
  }

  function saveEdit(id: string) {
    const text = editContent.trim()
    if (text) updateEntry(id, { content: text })
    setEditingId(null)
  }

  function handleClearAll() {
    if (entries.length === 0) return
    if (window.confirm(`Delete all ${entries.length} memory entries? This can't be undone.`)) {
      clearAll()
    }
  }

  function handleDelete(entry: MemoryEntry) {
    if (window.confirm('Delete this memory entry?')) {
      deleteEntry(entry.id)
    }
  }

  return (
    <section className="memory-screen">
      <header className="settings-header">
        <h1>Memory</h1>
      </header>
      <p className="placeholder-note memory-intro">
        No AI backend is connected yet (Phase 7), so nothing is learned automatically from
        conversations — entries here are only ever added by you, by hand. This matches the
        project's rule against training on raw chat history without deliberate consent: once a
        real backend exists, it would still only write here through the same categories below,
        never silently promoting an unverified claim to a fact.
      </p>

      <div className="memory-add-form hud-frame-soft">
        <div className="memory-add-row">
          <label className="field">
            <span className="field-label">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as MemoryCategory)}>
              {(Object.keys(MEMORY_CATEGORIES) as MemoryCategory[]).map((key) => (
                <option key={key} value={key}>
                  {MEMORY_CATEGORIES[key].label}
                </option>
              ))}
            </select>
            <span className="field-hint">{categoryConfig.description}</span>
          </label>
        </div>
        <label className="field">
          <span className="field-label">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What should be remembered?"
            rows={2}
          />
        </label>
        {categoryConfig.usesSourceAndConfidence && (
          <div className="memory-add-row">
            <label className="field">
              <span className="field-label">Source</span>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. told by user, Nov 21 2026"
              />
            </label>
            <label className="field">
              <span className="field-label">Confidence</span>
              <input
                type="range"
                min={0}
                max={100}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
              />
              <span className="field-hint">{confidence}%</span>
            </label>
          </div>
        )}
        <button type="button" className="chat-send-button memory-add-button" disabled={!content.trim()} onClick={handleAdd}>
          Add memory
        </button>
      </div>

      <div className="memory-list-header">
        <span className="hud-mono">{entries.length} ENTR{entries.length === 1 ? 'Y' : 'IES'}</span>
        <button type="button" className="reset-button" onClick={handleClearAll} disabled={entries.length === 0}>
          Clear all memory
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="field-hint">No memory entries yet.</p>
      ) : (
        <div className="memory-list">
          {entries.map((entry) => {
            const config = MEMORY_CATEGORIES[entry.category]
            const isEditing = editingId === entry.id
            return (
              <div key={entry.id} className={`memory-card hud-frame-soft memory-card-${entry.category}`}>
                <div className="memory-card-header">
                  <span className="outfit-badge hud-mono">{config.label.toUpperCase()}</span>
                  <span className="field-hint">{formatTimestamp(entry.updatedAt)}</span>
                </div>
                {isEditing ? (
                  <>
                    <textarea
                      className="memory-edit-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                    />
                    <div className="memory-card-actions">
                      <button type="button" className="chat-send-button" onClick={() => saveEdit(entry.id)}>
                        Save
                      </button>
                      <button type="button" className="reset-button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="memory-card-content">{entry.content}</p>
                    {config.usesSourceAndConfidence && (
                      <p className="field-hint">
                        {entry.source ? `Source: ${entry.source} — ` : ''}Confidence: {entry.confidence}%
                      </p>
                    )}
                    <div className="memory-card-actions">
                      <button type="button" className="reset-button" onClick={() => startEdit(entry)}>
                        Edit
                      </button>
                      <button type="button" className="reset-button memory-delete-button" onClick={() => handleDelete(entry)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
