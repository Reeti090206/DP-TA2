import type { WorkspaceNotice } from './workspacePersistence'

export interface WorkspaceNoticeStore {
  getSnapshot: () => WorkspaceNotice | null
  subscribe: (listener: () => void) => () => void
  set: (notice: WorkspaceNotice | null) => void
}

export function createWorkspaceNoticeStore(
  initialNotice: WorkspaceNotice | null,
): WorkspaceNoticeStore {
  let notice = initialNotice
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => notice,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    set: (nextNotice) => {
      if (nextNotice === notice) {
        return
      }

      notice = nextNotice
      listeners.forEach((listener) => listener())
    },
  }
}
