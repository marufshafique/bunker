<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import {
  Cloud,
  FolderPlus,
  Upload,
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  Folder,
  File,
  Image,
  FileText,
  Trash2,
  CloudOff,
  File as FilePdf,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Sonner from '@/components/ui/sonner/Sonner.vue'

// ─── types ───
interface DriveItem {
  id: string
  name: string
  isFolder: boolean
  size: number
  createdAt: number
}

// ─── state ───
const items = ref<DriveItem[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const folderName = ref('')
const folderDialogOpen = ref(false)

// ─── computed ───
const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((it) => it.name.toLowerCase().includes(q))
})

const isEmpty = computed(() => filteredItems.value.length === 0)

// ─── helpers ───
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function getIconType(name: string, isFolder: boolean) {
  if (isFolder) return 'folder'
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) return 'image'
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) return 'doc'
  return 'file'
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric'
  return d.toLocaleDateString('en-US', opts)
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '—'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function iconComponent(type: string) {
  switch (type) {
    case 'folder': return Folder
    case 'image': return Image
    case 'pdf': return FilePdf
    case 'doc': return FileText
    default: return File
  }
}

function iconBgColor(type: string): string {
  switch (type) {
    case 'folder': return 'bg-amber-100 text-amber-700'
    case 'image': return 'bg-red-100 text-red-700'
    case 'pdf': return 'bg-red-100 text-red-700'
    case 'doc': return 'bg-green-100 text-green-700'
    default: return 'bg-blue-100 text-blue-700'
  }
}

// ─── actions ───
function addItem(name: string, isFolder: boolean, size = 0) {
  const item: DriveItem = { id: generateId(), name, isFolder, size, createdAt: Date.now() }
  items.value.unshift(item)
}

function deleteItem(id: string) {
  const idx = items.value.findIndex((it) => it.id === id)
  if (idx === -1) return
  const name = items.value[idx].name
  items.value.splice(idx, 1)
  toast('Deleted', {
    description: `"${name}" has been removed.`,
    icon: Trash2,
  })
}

function createFolder() {
  const name = folderName.value.trim()
  if (!name) {
    toast('Error', { description: 'Please enter a folder name.' })
    return
  }
  if (items.value.some((it) => it.name === name && it.isFolder)) {
    toast('Error', { description: 'A folder with that name already exists.' })
    return
  }
  addItem(name, true)
  folderName.value = ''
  folderDialogOpen.value = false
  toast('Folder created', { description: `"${name}" has been created.` })
}

function handleFiles(files: FileList) {
  let count = 0
  for (const file of files) {
    let name = file.name
    let counter = 1
    const dotIdx = name.lastIndexOf('.')
    let base = dotIdx > 0 ? name.slice(0, dotIdx) : name
    const ext = dotIdx > 0 ? name.slice(dotIdx) : ''
    while (items.value.some((it) => it.name === name && !it.isFolder)) {
      name = base + ' (' + counter + ')' + ext
      counter++
    }
    addItem(name, false, file.size)
    count++
  }
  if (count > 0) {
    toast('Uploaded', { description: `${count} file${count > 1 ? 's' : ''} added.` })
  }
}

function refresh() {
  // triggers reactivity (no-op render)
  toast('Refreshed', { description: 'View is up to date.' })
}

// ─── file input ref ───
const fileInput = ref<HTMLInputElement | null>(null)
function triggerUpload() {
  fileInput.value?.click()
}
function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFiles(target.files)
    target.value = ''
  }
}

// ─── drag & drop ───
const dropZone = ref<HTMLElement | null>(null)
const isDragging = ref(false)
function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}
function onDragLeave() {
  isDragging.value = false
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files?.length) {
    handleFiles(e.dataTransfer.files)
  }
}

// ─── keyboard shortcut for folder dialog ───
function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    folderDialogOpen.value = true
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// ─── seed demo ───
function seedDemo() {
  const now = Date.now()
  const demos = [
    { name: 'Projects', isFolder: true },
    { name: 'Designs', isFolder: true },
    { name: 'Report Q2.pdf', isFolder: false, size: 2457600 },
    { name: 'Meeting Notes.docx', isFolder: false, size: 184320 },
    { name: 'Team Photo.png', isFolder: false, size: 4128768 },
    { name: 'Budget 2026.xlsx', isFolder: false, size: 655360 },
  ]
  for (const d of demos) {
    items.value.push({
      id: generateId(),
      name: d.name,
      isFolder: d.isFolder,
      size: d.size || 0,
      createdAt: now - Math.random() * 86400000 * 20,
    })
  }
  items.value.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1
    return a.name.localeCompare(b.name)
  })
}

onMounted(seedDemo)
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-[#f1f3f6] p-5">
    <!-- ── Main Card ── -->
    <div
      class="max-w-[1100px] w-full h-[90vh] max-h-[800px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between px-7 py-4 border-b border-[#eef0f2] shrink-0 gap-3 flex-wrap">
        <div class="flex items-center gap-2.5 font-semibold text-xl tracking-[-0.3px] text-[#1a1a1a]">
          <Cloud class="size-[30px] text-[#0b57d0]" />
          <span class="bg-gradient-to-br from-[#0b57d0] to-[#1a73e8] bg-clip-text text-transparent">
            Drive
          </span>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <Dialog v-model:open="folderDialogOpen">
            <DialogTrigger as-child>
              <Button
                class="rounded-full h-9 px-4 gap-1.5 text-sm bg-[#0b57d0] hover:bg-[#0847b0] shadow-[0_2px_6px_rgba(11,87,208,0.2)] hover:shadow-[0_4px_12px_rgba(11,87,208,0.3)] hover:-translate-y-px">
                <FolderPlus />
                <span class="max-sm:hidden">New folder</span>
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[420px] rounded-[28px] p-8">
              <DialogHeader>
                <DialogTitle class="flex items-center gap-2.5 text-xl font-semibold">
                  <FolderPlus class="size-7 text-[#0b57d0]" />
                  New folder
                </DialogTitle>
                <DialogDescription class="text-[#5f6368] mt-1.5">
                  Enter a name for your new folder.
                </DialogDescription>
              </DialogHeader>
              <Input v-model="folderName" placeholder="My folder"
                class="rounded-2xl h-11 border-2 border-[#e8eaed] bg-[#fafbfc] focus-visible:border-[#0b57d0] focus-visible:bg-white text-[15px] focus-visible:ring-0"
                @keydown.enter="createFolder" />
              <DialogFooter class="mt-6 gap-2.5">
                <Button variant="secondary"
                  class="rounded-full h-10 px-6 bg-[#f1f3f6] hover:bg-[#e8eaed] text-[#1e1e1e]"
                  @click="folderDialogOpen = false">
                  Cancel
                </Button>
                <Button class="rounded-full h-10 px-6 bg-[#0b57d0] hover:bg-[#0847b0]" @click="createFolder">
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            class="rounded-full h-9 px-4 gap-1.5 text-sm bg-[#0b57d0] hover:bg-[#0847b0] shadow-[0_2px_6px_rgba(11,87,208,0.2)] hover:shadow-[0_4px_12px_rgba(11,87,208,0.3)] hover:-translate-y-px"
            @click="triggerUpload">
            <Upload />
            <span class="max-sm:hidden">Upload</span>
          </Button>
          <input ref="fileInput" type="file" multiple class="hidden" @change="onFileChange" />

          <Button variant="secondary" size="icon" class="rounded-full size-9 bg-[#f1f3f6] hover:bg-[#e8eaed]"
            title="Refresh" @click="refresh">
            <RefreshCw />
          </Button>
        </div>
      </header>

      <!-- Toolbar -->
      <div class="flex items-center justify-between px-7 pt-2 pb-3 border-b border-[#f0f2f4] shrink-0 gap-3 flex-wrap">
        <!-- View toggle -->
        <div class="flex gap-1 bg-[#f1f3f6] rounded-full p-[3px]">
          <Button :variant="viewMode === 'grid' ? 'secondary' : 'ghost'" size="sm"
            class="rounded-full h-8 px-3.5 text-[13px]"
            :class="viewMode === 'grid' ? 'bg-white text-[#1a1a1a] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:bg-white' : 'text-[#5f6368] bg-transparent hover:bg-[#e8eaed]'"
            @click="viewMode = 'grid'">
            <LayoutGrid />
          </Button>
          <Button :variant="viewMode === 'list' ? 'secondary' : 'ghost'" size="sm"
            class="rounded-full h-8 px-3.5 text-[13px]"
            :class="viewMode === 'list' ? 'bg-white text-[#1a1a1a] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:bg-white' : 'text-[#5f6368] bg-transparent hover:bg-[#e8eaed]'"
            @click="viewMode = 'list'">
            <List />
          </Button>
        </div>

        <!-- Search -->
        <div
          class="flex items-center bg-[#f1f3f6] rounded-full px-4 gap-2 min-w-[200px] flex-1 max-w-[340px] focus-within:bg-[#e8eaed] transition-colors">
          <Search class="size-5 text-[#5f6368] shrink-0" />
          <input v-model="searchQuery" type="text" placeholder="Search files & folders…"
            class="bg-transparent border-none outline-none py-2.5 text-sm font-[inherit] w-full text-[#1e1e1e] placeholder:text-[#5f6368]" />
        </div>
      </div>

      <!-- Content -->
      <div ref="dropZone" class="flex-1 overflow-y-auto px-7 py-4 pb-7 bg-[#fafbfc] transition-colors"
        :class="{ 'bg-[#eef2f7]': isDragging }" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
        <!-- Empty state -->
        <div v-if="isEmpty" class="flex flex-col items-center justify-center h-full text-[#5f6368] text-center p-5">
          <CloudOff class="size-[72px] text-[#d1d5db] mb-4" />
          <h3 class="font-medium text-lg text-[#1e1e1e] mb-1.5">
            {{ searchQuery ? 'No results found' : 'Nothing here yet' }}
          </h3>
          <p class="text-sm max-w-xs">
            {{ searchQuery ? 'Try a different search term.' : 'Upload files or create a folder to get started.' }}
          </p>
        </div>

        <!-- File grid / list -->
        <div v-else class="grid gap-4" :class="viewMode === 'grid'
          ? 'grid-cols-[repeat(auto-fill,minmax(170px,1fr))] max-[420px]:grid-cols-2'
          : 'grid-cols-1 gap-0.5'">
          <div v-for="item in filteredItems" :key="item.id"
            class="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#f0f2f4] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#d1d5db] hover:-translate-y-0.5 transition-all duration-150 group"
            :class="viewMode === 'list'
              ? 'flex items-center !py-3 !px-[18px] gap-4 !rounded-xl'
              : 'flex flex-col items-start'">
            <!-- Icon -->
            <div class="rounded-xl flex items-center justify-center shrink-0" :class="[
              iconBgColor(getIconType(item.name, item.isFolder)),
              viewMode === 'list'
                ? 'size-9 text-xl'
                : 'size-12 text-[28px] mb-3',
            ]">
              <component :is="iconComponent(getIconType(item.name, item.isFolder))"
                :class="viewMode === 'list' ? 'size-5' : 'size-7'" />
            </div>

            <!-- Name -->
            <div class="font-medium text-sm text-[#1e1e1e] truncate w-full mb-1"
              :class="{ 'flex-1 !mb-0': viewMode === 'list' }" :title="item.name">
              {{ item.name }}
            </div>

            <!-- Meta -->
            <div class="text-xs text-[#5f6368] flex justify-between w-full"
              :class="{ '!w-auto gap-6': viewMode === 'list' }">
              <span>{{ item.isFolder ? '—' : formatSize(item.size) }}</span>
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>

            <!-- Delete action -->
            <div class="mt-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              :class="{ '!opacity-100 !mt-0': viewMode === 'list' }">
              <Button variant="ghost" size="icon-xs"
                class="rounded-xl bg-[#f1f3f6] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#1e1e1e]" title="Delete"
                @click="deleteItem(item.id)">
                <Trash2 class="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast provider -->
    <Sonner rich-colors position="bottom-center" />
  </div>
</template>
