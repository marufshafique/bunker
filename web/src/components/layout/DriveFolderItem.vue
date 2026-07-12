<script setup lang="ts">
import { Folder, Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import type { DriveItem } from '@/types/drive'

defineProps<{
  item: DriveItem
  viewMode: 'grid' | 'list'
}>()

const emit = defineEmits<{
  (e: 'click-item', id: string): void
  (e: 'delete-item', id: string): void
}>()

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric'
  return d.toLocaleDateString('en-US', opts)
}
</script>

<template>
  <div
    class="group cursor-pointer rounded-md border border-border bg-card p-4 shadow-sm transition-all duration-150 hover:border-muted-foreground/30 hover:shadow-md"
    :class="
      viewMode === 'list'
        ? 'flex items-center gap-4 rounded-md px-4 py-3'
        : 'flex flex-col items-start'
    "
    @click="emit('click-item', item.id)"
  >
    <!-- Icon -->
    <div
      class="flex shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"
      :class="
        viewMode === 'list'
          ? 'size-9 text-xl'
          : 'mb-3 size-12 text-2xl'
      "
    >
      <Folder :class="viewMode === 'list' ? 'size-5' : 'size-7'" />
    </div>

    <!-- Name -->
    <div
      class="mb-1 w-full truncate text-sm font-medium text-foreground"
      :class="{ 'mb-0! flex-1': viewMode === 'list' }"
      :title="item.name"
    >
      {{ item.name }}
    </div>

    <!-- Meta -->
    <div
      class="flex w-full justify-between text-xs text-muted-foreground"
      :class="{ 'w-auto! gap-6': viewMode === 'list' }"
    >
      <span>—</span>
      <span>{{ formatDate(item.createdAt) }}</span>
    </div>

    <!-- Delete action -->
    <div
      class="mt-2.5 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      :class="{ 'mt-0! opacity-100!': viewMode === 'list' }"
    >
      <Button
        variant="ghost"
        size="icon-xs"
        class="rounded-xl bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Delete"
        @click.stop="emit('delete-item', item.id)"
      >
        <Trash2 class="size-4" />
      </Button>
    </div>
  </div>
</template>
