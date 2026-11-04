<template>
  <div
    v-bind="apiAttrs"
    ref="breadcrumb"
    :class="ns.b()"
    :aria-label="t('el.breadcrumb.label')"
    role="navigation"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, provide, ref } from 'vue'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { useAgentApi } from '@element-plus/hooks/use-agent-api'
import '@element-plus/utils/AgentApiRegistry'
import { breadcrumbKey } from './constants'

import type { BreadcrumbProps } from './breadcrumb'

defineOptions({
  name: 'ElBreadcrumb',
})

const { t } = useLocale()
const props = withDefaults(defineProps<BreadcrumbProps>(), {
  separator: '/',
})

const ns = useNamespace('breadcrumb')
const breadcrumb = ref<HTMLDivElement>()

provide(breadcrumbKey, props)

onMounted(() => {
  const items = breadcrumb.value!.querySelectorAll(`.${ns.e('item')}`)
  if (items.length) {
    items[items.length - 1].setAttribute('aria-current', 'page')
  }
})

const apiAttrs = useAgentApi('breadcrumb', {
  getBreadcrumbStatus: {
    handler: () => {
      const items: any[] = []
      if ((breadcrumbRef.value as any)?.children) {
        Array.from((breadcrumbRef.value as any).children).forEach(
          (el: any, idx: number) => {
            const text = el.textContent?.trim()
            const link = el.querySelector('a')
            if (text)
              items.push({
                key: String(idx),
                text,
                href: link?.getAttribute('href') || null,
              })
          }
        )
      }
      return { data: { items } }
    },
    description: 'Get breadcrumb items with key (for navigateTo) and text.',
    params: [],
  },
  navigateTo: {
    handler: (key: string) => {
      if (!(breadcrumbRef.value as any)?.children)
        return { error: { code: 'NO_ITEMS', message: 'No breadcrumb items.' } }
      const children = Array.from((breadcrumbRef.value as any).children)
      const idx = Number.parseInt(key, 10)
      let target: any = null
      if (!Number.isNaN(idx) && idx >= 0 && idx < children.length)
        target = children[idx]
      if (!target)
        return {
          error: {
            code: 'ITEM_NOT_FOUND',
            message: `Breadcrumb "${key}" not found. Use key from getBreadcrumbStatus items[].key.`,
          },
        }
      const link = target.querySelector('a')
      if (link) {
        link.click()
        return {
          data: {
            key,
            text: target.textContent?.trim(),
            href: link.getAttribute('href'),
          },
        }
      }
      target.click?.()
      return { data: { key, text: target.textContent?.trim() } }
    },
    description:
      'Navigate to breadcrumb item by key (from getBreadcrumbStatus items[].key).',
    params: [
      {
        name: 'key',
        type: 'string',
        required: true,
        description: 'Item key from getBreadcrumbStatus items[].key.',
      },
    ],
  },
})
</script>
