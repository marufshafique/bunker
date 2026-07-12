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
    class="group rounded-2xl border border-[#f0f2f4] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#d1d5db] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] cursor-pointer"
    :class="
      viewMode === 'list'
        ? 'flex items-center gap-4 !rounded-xl !px-[18px] !py-3'
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
          : 'mb-3 size-12 text-[28px]'
      "
    >
      <Folder :class="viewMode === 'list' ? 'size-5' : 'size-7'" />
    </div>

    <!-- Name -->
    <div
      class="mb-1 w-full truncate text-sm font-medium text-[#1e1e1e]"
      :class="{ '!mb-0 flex-1': viewMode === 'list' }"
      :title="item.name"
    >
      {{ item.name }}
    </div>

    <!-- Meta -->
    <div
      class="flex w-full justify-between text-xs text-[#5f6368]"
      :class="{ '!w-auto gap-6': viewMode === 'list' }"
    >
      <span>—</span>
      <span>{{ formatDate(item.createdAt) }}</span>
    </div>

    <!-- Delete action -->
    <div
      class="mt-2.5 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      :class="{ '!mt-0 !opacity-100': viewMode === 'list' }"
    >
      <Button
        variant="ghost"
        size="icon-xs"
        class="rounded-xl bg-[#f1f3f6] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#1e1e1e]"
        title="Delete"
        @click.stop="emit('delete-item', item.id)"
      >
        <Trash2 class="size-4" />
      </Button>
    </div>
  </div>
</template>
