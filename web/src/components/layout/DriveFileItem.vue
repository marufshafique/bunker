<script setup lang="ts">
import { ref } from 'vue'
import {
  File,
  Image,
  FileText,
  File as FilePdf,
  MoreVertical,
  Download,
  Trash2,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { DriveItem } from '@/types/drive'

const props = defineProps<{
  item: DriveItem
  viewMode: 'grid' | 'list'
}>()

const emit = defineEmits<{
  (e: 'delete-item', id: string): void
  (e: 'download-item', id: string, name: string): void
}>()

const open = ref(false)
const detailsOpen = ref(false)

function openDetails() {
  detailsOpen.value = true
}

function handleDownload() {
  emit('download-item', props.item.id, props.item.name)
}

function handleDelete() {
  emit('delete-item', props.item.id)
}

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

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
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
    class="group cursor-pointer rounded-md border border-border bg-card p-4 shadow-sm transition-all duration-150 hover:border-muted-foreground/30 hover:shadow-md"
    :class="
      viewMode === 'list'
        ? 'flex items-center gap-4 rounded-md! px-4! py-3!'
        : 'flex flex-col items-start'
    "
    role="button"
    tabindex="0"
    :title="item.name"
    @click="openDetails"
    @keydown.enter="openDetails"
  >
    <!-- Icon -->
    <div
      class="flex shrink-0 items-center justify-center rounded-xl"
      :class="[
        iconBgColor(iconType),
        viewMode === 'list'
          ? 'size-9 text-xl'
          : 'mb-3 size-12 text-2xl',
      ]"
    >
      <component
        :is="iconComponent(iconType)"
        :class="viewMode === 'list' ? 'size-5' : 'size-7'"
      />
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
      <span>{{ formatSize(item.size) }}</span>
      <span>{{ formatDate(item.createdAt) }}</span>
    </div>

    <!-- Actions dropdown -->
    <div
      class="relative mt-2.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      :class="{ 'mt-0! opacity-100!': viewMode === 'list' }"
      @click.stop
    >
      <DropdownMenu v-model:open="open">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon-xs"
            class="rounded-xl bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            title="More actions"
          >
            <MoreVertical class="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent @click.stop>
          <DropdownMenuItem @click="handleDownload">
            <Download class="text-muted-foreground" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem
            class="text-red-600 focus:bg-red-50 focus:text-red-700"
            @click="handleDelete"
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <!-- File details drawer -->
  <Drawer v-model:open="detailsOpen">
    <DrawerContent>
      <div class="mx-auto w-full max-w-6xl">
        <DrawerHeader class="text-left">
          <div class="flex items-center gap-3">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-xl"
              :class="iconBgColor(iconType)"
            >
              <component :is="iconComponent(iconType)" class="size-6" />
            </div>
            <div class="min-w-0">
              <DrawerTitle class="truncate">{{ item.name }}</DrawerTitle>
              <DrawerDescription>File details</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <dl class="flex flex-col gap-1 px-4 pb-2 text-sm">
          <div
            class="flex items-center justify-between gap-4 border-b border-border py-3"
          >
            <dt class="text-muted-foreground">Name</dt>
            <dd class="truncate font-medium text-foreground">
              {{ item.name }}
            </dd>
          </div>
          <div
            class="flex items-center justify-between gap-4 border-b border-border py-3"
          >
            <dt class="text-muted-foreground">Size</dt>
            <dd class="font-medium text-foreground">
              {{ formatSize(item.size) }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-4 py-3">
            <dt class="text-muted-foreground">Uploaded at</dt>
            <dd class="font-medium text-foreground">
              {{ formatDateTime(item.createdAt) }}
            </dd>
          </div>
        </dl>

        <DrawerFooter>
          <Button
            class="h-11 gap-2 rounded-full bg-primary hover:bg-primary/80"
            @click="handleDownload"
          >
            <Download class="size-4" />
            Download
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
