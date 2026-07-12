<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DropdownMenuLabel } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  inset?: boolean
}>()
</script>

<template>
  <DropdownMenuLabel
    v-bind="$props"
    :class="
      cn(
        'px-2.5 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuLabel>
</template>
