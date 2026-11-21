export type ScreenId = 'companion' | 'wardrobe' | 'settings' | 'memory' | 'workspace' | 'activity'

interface NavItem {
  id: ScreenId
  label: string
  enabled: boolean
  disabledReason?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'companion', label: 'Companion', enabled: true },
  { id: 'wardrobe', label: 'Wardrobe', enabled: true },
  { id: 'settings', label: 'Character Settings', enabled: true },
  { id: 'memory', label: 'Memory', enabled: false, disabledReason: 'Arrives in Phase 10' },
  { id: 'workspace', label: 'Workspace', enabled: false, disabledReason: 'Arrives in Phase 10' },
  { id: 'activity', label: 'Activity', enabled: false, disabledReason: 'Arrives in Phase 10' },
]

interface SidebarProps {
  active: ScreenId
  onSelect: (id: ScreenId) => void
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-title">DOPPELGÄNGER</div>
      <div className="sidebar-subtitle">COMPANION INTERFACE</div>
      <ul className="sidebar-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`sidebar-item${active === item.id ? ' active' : ''}${!item.enabled ? ' disabled' : ''}`}
              disabled={!item.enabled}
              title={item.disabledReason}
              onClick={() => item.enabled && onSelect(item.id)}
            >
              {item.label}
              {!item.enabled && <span className="sidebar-badge">soon</span>}
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <span className="sidebar-pulse" aria-hidden="true" />
        SYSTEM ONLINE — PHASE 06
      </div>
    </nav>
  )
}
