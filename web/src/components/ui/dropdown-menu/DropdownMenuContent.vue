<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DropdownMenuContent, DropdownMenuPortal } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
}>()
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="$props"
      :class="
        cn(
          'z-50 min-w-36 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          props.class,
        )
      "
      :side-offset="sideOffset ?? 4"
      :align="align ?? 'end'"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
