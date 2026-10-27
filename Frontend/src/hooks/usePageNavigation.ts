import { useEffect, useState } from 'react'
import type { PageId } from '../types/navigation'

const PAGE_HASHES: Record<PageId, string> = {
  impact: '#/impact',
  scenarios: '#/scenarios',
}

function readPageFromHash(): PageId {
  return window.location.hash === PAGE_HASHES.scenarios ? 'scenarios' : 'impact'
}

export function usePageNavigation() {
  const [page, setPage] = useState<PageId>(() => readPageFromHash())

  useEffect(() => {
    const handleHashChange = () => setPage(readPageFromHash())

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (nextPage: PageId) => {
    setPage(nextPage)

    if (window.location.hash !== PAGE_HASHES[nextPage]) {
      window.location.hash = PAGE_HASHES[nextPage]
    }
  }

  return { page, navigate }
}
