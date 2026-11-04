import '@element-plus/utils/AgentApiRegistry'
import { onMounted, onUnmounted, shallowRef } from 'vue'
import type { APIAction } from '@element-plus/utils/AgentApiRegistry'

export function useAgentApi(componentType: string, actions: Record<string, APIAction>) {
  const apiAttrs = shallowRef<Record<string, any>>({})

  onMounted(() => {
    if (typeof window !== 'undefined' && window.__ci4a__) {
      apiAttrs.value = window.__ci4a__.register(componentType, actions)
    }
  })

  onUnmounted(() => {
    if (apiAttrs.value && window.__ci4a__) {
      window.__ci4a__.unregister(apiAttrs.value['data-cid'])
    }
  })

  return apiAttrs
}
