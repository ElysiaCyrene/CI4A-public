<template>
  <div v-bind="apiAttrs" :class="[ns.b(), ns.is('disabled', disabled)]">
    <el-tooltip
      ref="popperRef"
      :role="role"
      :effect="effect"
      :fallback-placements="['bottom', 'top']"
      :popper-options="popperOptions"
      :gpu-acceleration="false"
      :placement="placement"
      :popper-class="[ns.e('popper'), popperClass!]"
      :popper-style="popperStyle"
      :trigger="trigger"
      :trigger-keys="triggerKeys"
      :trigger-target-el="contentRef"
      :show-arrow="showArrow"
      :show-after="trigger === 'hover' ? showTimeout : 0"
      :hide-after="trigger === 'hover' ? hideTimeout : 0"
      :virtual-ref="virtualRef ?? triggeringElementRef"
      :virtual-triggering="virtualTriggering || splitButton"
      :disabled="disabled"
      :transition="`${ns.namespace.value}-zoom-in-top`"
      :teleported="teleported"
      :append-to="appendTo"
      pure
      focus-on-target
      :persistent="persistent"
      @before-show="handleBeforeShowTooltip"
      @show="handleShowTooltip"
      @before-hide="handleBeforeHideTooltip"
    >
      <template #content>
        <el-scrollbar
          ref="scrollbar"
          :wrap-style="wrapStyle"
          tag="div"
          :view-class="ns.e('list')"
        >
          <el-roving-focus-group
            :loop="loop"
            :current-tab-id="currentTabId"
            orientation="horizontal"
            @current-tab-id-change="handleCurrentTabIdChange"
          >
            <slot name="dropdown" />
          </el-roving-focus-group>
        </el-scrollbar>
      </template>
      <template v-if="!splitButton" #default>
        <el-only-child
          :id="triggerId"
          ref="triggeringElementRef"
          role="button"
          :tabindex="tabindex"
        >
          <slot name="default" />
        </el-only-child>
      </template>
    </el-tooltip>
    <template v-if="splitButton">
      <el-button-group>
        <el-button
          ref="referenceElementRef"
          v-bind="buttonProps"
          :size="dropdownSize"
          :type="type"
          :disabled="disabled"
          :tabindex="tabindex"
          @click="handlerMainButtonClick"
        >
          <slot name="default" />
        </el-button>
        <el-button
          :id="triggerId"
          ref="triggeringElementRef"
          v-bind="buttonProps"
          role="button"
          :size="dropdownSize"
          :type="type"
          :class="ns.e('caret-button')"
          :disabled="disabled"
          :tabindex="tabindex"
          :aria-label="t('el.dropdown.toggleDropdown')"
        >
          <el-icon :class="ns.e('icon')"><arrow-down /></el-icon>
        </el-button>
      </el-button-group>
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  provide,
  ref,
  toRef,
  unref,
} from 'vue'
import ElButton from '@element-plus/components/button'
import ElTooltip from '@element-plus/components/tooltip'
import ElScrollbar from '@element-plus/components/scrollbar'
import ElIcon from '@element-plus/components/icon'
import ElRovingFocusGroup from '@element-plus/components/roving-focus-group'
import { ElOnlyChild } from '@element-plus/components/slot'
import { useFormSize } from '@element-plus/components/form'
import { addUnit, ensureArray } from '@element-plus/utils'
import { ArrowDown } from '@element-plus/icons-vue'
import { useId, useLocale, useNamespace } from '@element-plus/hooks'
import { useAgentApi } from '@element-plus/hooks/use-agent-api'
import '@element-plus/utils/AgentApiRegistry'
import { dropdownProps } from './dropdown'
import {
  DROPDOWN_INJECTION_KEY,
  DROPDOWN_INSTANCE_INJECTION_KEY,
} from './tokens'

import type { TooltipInstance } from '@element-plus/components/tooltip'
import type { CSSProperties } from 'vue'

const { ButtonGroup: ElButtonGroup } = ElButton

export default defineComponent({
  name: 'ElDropdown',
  components: {
    ElButton,
    ElButtonGroup,
    ElScrollbar,
    ElTooltip,
    ElRovingFocusGroup,
    ElOnlyChild,
    ElIcon,
    ArrowDown,
  },
  props: dropdownProps,
  emits: ['visible-change', 'click', 'command'],
  setup(props, { emit }) {
    const _instance = getCurrentInstance()
    const ns = useNamespace('dropdown')
    const { t } = useLocale()

    const triggeringElementRef = ref()
    const referenceElementRef = ref()
    const popperRef = ref<TooltipInstance>()
    const contentRef = ref<HTMLElement>()
    const scrollbar = ref(null)
    const currentTabId = ref<string | null>(null)
    const isUsingKeyboard = ref(false)

    const wrapStyle = computed<CSSProperties>(() => ({
      maxHeight: addUnit(props.maxHeight),
    }))
    const dropdownTriggerKls = computed(() => [ns.m(dropdownSize.value)])
    const trigger = computed(() => ensureArray(props.trigger))

    const defaultTriggerId = useId().value
    const triggerId = computed<string>(() => props.id || defaultTriggerId)

    function handleClick() {
      popperRef.value?.onClose(undefined, 0)
    }

    function handleClose() {
      popperRef.value?.onClose()
    }

    function handleOpen() {
      popperRef.value?.onOpen()
    }

    const dropdownSize = useFormSize()

    function commandHandler(...args: any[]) {
      emit('command', ...args)
    }

    function onItemEnter() {
      // NOOP for now
    }

    function onItemLeave() {
      const contentEl = unref(contentRef)

      trigger.value.includes('hover') &&
        contentEl?.focus({
          preventScroll: true,
        })
      currentTabId.value = null
    }

    function handleCurrentTabIdChange(id: string) {
      currentTabId.value = id
    }

    function handleBeforeShowTooltip() {
      emit('visible-change', true)
    }

    function handleShowTooltip(event?: Event) {
      isUsingKeyboard.value = event?.type === 'keydown'
      contentRef.value?.focus()
    }

    function handleBeforeHideTooltip() {
      emit('visible-change', false)
    }

    provide(DROPDOWN_INJECTION_KEY, {
      contentRef,
      role: computed(() => props.role),
      triggerId,
      isUsingKeyboard,
      onItemEnter,
      onItemLeave,
      handleClose,
    })

    provide(DROPDOWN_INSTANCE_INJECTION_KEY, {
      instance: _instance,
      dropdownSize,
      handleClick,
      commandHandler,
      trigger: toRef(props, 'trigger'),
      hideOnClick: toRef(props, 'hideOnClick'),
    })

    const handlerMainButtonClick = (event: MouseEvent) => {
      emit('click', event)
    }

    const apiAttrs = useAgentApi('dropdown', {
      getDropdownStatus: {
        handler: () => {
          // Search entire document for dropdown items
          const itemEls = document.querySelectorAll(
            '.el-dropdown-menu__item, .el-dropdown__popper .el-dropdown-menu__item, [role="menu"] li'
          )
          const items = Array.from(itemEls)
            .filter(
              (i: any) =>
                !i.classList.contains('is-disabled') &&
                !i.classList.contains('hidden')
            )
            .map((item: any, idx: number) => ({
              key: String(idx),
              text: item.textContent?.trim() || '',
              command:
                item.getAttribute('command') || item.dataset.command || '',
            }))
          return { data: { disabled: props.disabled, items } }
        },
        description:
          'Get dropdown items (from DOM, after dropdown has been opened once).',
        params: [],
      },
      navigateTo: {
        handler: async (key: string) => {
          if (props.disabled) return { error: { code: 'COMPONENT_DISABLED' } }
          popperRef.value?.onOpen()
          // Wait for portal — try multiple selectors
          let items: NodeListOf<Element> | null = null
          for (let i = 0; i < 15; i++) {
            await new Promise((r) => setTimeout(r, 50))
            items = document.querySelectorAll(
              '.el-dropdown-menu__item:not(.is-disabled), [role="menu"] li:not([aria-disabled="true"]), .el-dropdown__popper li:not(.is-disabled)'
            )
            if (items && items.length > 0) break
          }
          if (!items || items.length === 0) {
            return {
              error: {
                code: 'NO_ITEMS',
                message: 'No dropdown items appeared after 750ms.',
              },
            }
          }
          const idx = Number.parseInt(key, 10)
          let target: Element | null = null
          if (!Number.isNaN(idx) && idx >= 0 && idx < items.length)
            target = items[idx]
          else {
            items.forEach((item: any) => {
              if (
                item.textContent?.trim() === key ||
                item.getAttribute('command') === key
              )
                target = item
            })
          }
          if (!target) {
            return {
              error: {
                code: 'ITEM_NOT_FOUND',
                message: `"${key}" not found. Items: ${Array.from(items)
                  .map((i: any) => i.textContent?.trim())
                  .join(', ')}`,
              },
            }
          }
          ;(target as HTMLElement).click()
          return { data: { key, text: target.textContent?.trim() } }
        },
        description:
          'Open dropdown and click an item by index (e.g. "0") or command.',
        params: [
          {
            name: 'key',
            type: 'string',
            required: true,
            description: '0-based index or command value.',
          },
        ],
      },
    })

    return {
      t,
      ns,
      scrollbar,
      wrapStyle,
      dropdownTriggerKls,
      dropdownSize,
      triggerId,
      currentTabId,
      handleCurrentTabIdChange,
      handlerMainButtonClick,
      handleClose,
      handleOpen,
      handleBeforeShowTooltip,
      handleShowTooltip,
      handleBeforeHideTooltip,
      popperRef,
      contentRef,
      triggeringElementRef,
      referenceElementRef,
      apiAttrs,
    }
  },
})
</script>
