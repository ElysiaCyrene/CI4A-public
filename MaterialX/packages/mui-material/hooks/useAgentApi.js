import { useEffect, useState, useRef } from 'react'

export function useAgentApi(componentType, actions) {
  const [apiAttrs, setApiAttrs] = useState({})
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
