<script setup lang="ts">
import { File, Image, FileText, File as FilePdf, Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import type { DriveItem } from '@/types/drive'

const props = defineProps<{
  item: DriveItem
  viewMode: 'grid' | 'list'
}>()

const emit = defineEmits<{
  (e: 'delete-item', id: string): void
}>()

// ─── helpers ───
function getIconType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (
    [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'svg',
      'webp',
      'bmp',
      'ico',
    ].includes(ext)
  )
    return 'image'
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) return 'doc'
  return 'file'
}

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

function formatSize(bytes: number): string {
  if (bytes === 0) return '—'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  )
}

function iconComponent(type: string) {
  switch (type) {
    case 'image':
      return Image
    case 'pdf':
      return FilePdf
    case 'doc':
      return FileText
    default:
      return File
  }
}

function iconBgColor(type: string): string {
  switch (type) {
    case 'image':
      return 'bg-red-100 text-red-700'
    case 'pdf':
      return 'bg-red-100 text-red-700'
    case 'doc':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-blue-100 text-blue-700'
  }
}

// ─── computed ───
const iconType = getIconType(props.item.name)
</script>

<template>
  <div
    class="group rounded-2xl border border-[#f0f2f4] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#d1d5db] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    :class="
      viewMode === 'list'
        ? 'flex items-center gap-4 !rounded-xl !px-[18px] !py-3'
        : 'flex flex-col items-start'
    "
  >
    <!-- Icon -->
    <div
      class="flex shrink-0 items-center justify-center rounded-xl"
      :class="[
        iconBgColor(iconType),
        viewMode === 'list'
          ? 'size-9 text-xl'
          : 'mb-3 size-12 text-[28px]',
      ]"
    >
      <component
        :is="iconComponent(iconType)"
        :class="viewMode === 'list' ? 'size-5' : 'size-7'"
      />
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
      <span>{{ formatSize(item.size) }}</span>
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
