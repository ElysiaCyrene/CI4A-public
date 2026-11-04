import '../AgentApiRegistry/AgentApiRegistry.js';
import { useEffect, useState, useRef } from 'react'
import type { APIAction } from '../AgentApiRegistry/AgentApiRegistry'

/**
 * React hook: registers a component with window.__ci4a__ on mount,
 * unregisters on unmount. Returns { 'data-cid': string } to spread onto root DOM element.
 */
export function useAgentApi(componentType: string, actions: Record<string, APIAction>) {
  const [apiAttrs, setApiAttrs] = useState<{ 'data-cid': string }>({})
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__ci4a__) {
      const attrs = window.__ci4a__.register(componentType, actionsRef.current)
      setApiAttrs(attrs)
      return () => {
        window.__ci4a__?.unregister(attrs['data-cid'])
      }
    }
  }, [componentType])

  return apiAttrs
}
