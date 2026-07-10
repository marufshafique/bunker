<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Trash2 } from '@lucide/vue'
import Sonner from '@/components/ui/sonner/Sonner.vue'
import DriveHeader from '@/components/layout/DriveHeader.vue'
import DriveToolbar from '@/components/layout/DriveToolbar.vue'
import DriveContent from '@/components/layout/DriveContent.vue'
import type { DriveItem } from '@/components/layout/DriveContent.vue'

// ─── state ───
const items = ref<DriveItem[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')

// ─── computed ───
const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((it) => it.name.toLowerCase().includes(q))
})

// ─── helpers ───
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
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

function onCreateFolder(name: string) {
  if (items.value.some((it) => it.name === name && it.isFolder)) {
    toast('Error', { description: 'A folder with that name already exists.' })
    return
  }
  addItem(name, true)
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
  toast('Refreshed', { description: 'View is up to date.' })
}

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
      <DriveHeader @create-folder="onCreateFolder" @upload="handleFiles" @refresh="refresh" />

      <DriveToolbar v-model:view-mode="viewMode" v-model:search-query="searchQuery" />

      <DriveContent :items="filteredItems" :view-mode="viewMode" :search-query="searchQuery" @delete-item="deleteItem"
        @upload="handleFiles" />
    </div>

    <!-- Toast provider -->
    <Sonner rich-colors position="bottom-center" />
  </div>
</template>
