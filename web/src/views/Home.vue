<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Trash2 } from '@lucide/vue'
import Sonner from '@/components/ui/sonner/Sonner.vue'
import DriveHeader from '@/components/layout/DriveHeader.vue'
import DriveToolbar from '@/components/layout/DriveToolbar.vue'
import DriveContent from '@/components/layout/DriveContent.vue'
import type { DriveItem } from '@/components/layout/DriveContent.vue'
import { useDriveFileRepo } from '@/stores/orm'

// ─── pinia-orm repository (files) ───
const fileRepo = useDriveFileRepo()

// ─── local state (folders only, no backend support yet) ───
const folders = ref<DriveItem[]>([])

const viewMode = useStorage<'grid' | 'list'>('drive-view-mode', 'grid')
const searchQuery = ref('')

// ─── computed: merge ORM files + local folders into a single DriveItem[] ───
const filteredItems = computed<DriveItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const all: DriveItem[] = [
    ...folders.value,
    ...fileRepo.all().map((f) => f.toDriveItem()),
  ]
  if (!q) return all
  return all.filter((it) => it.name.toLowerCase().includes(q))
})

// ─── actions ───
async function loadFiles() {
  try {
    await fileRepo.list()
  } catch {
    toast('Error', {
      description: 'Failed to load files from the server.',
    })
  }
}

function addFolder(name: string) {
  const item: DriveItem = {
    id:
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 6),
    name,
    isFolder: true,
    size: 0,
    createdAt: Date.now(),
  }
  folders.value.unshift(item)
}

async function deleteItem(id: string) {
  // Try ORM (file) first
  const file = fileRepo.find(id)
  if (file) {
    const name = file.original_name
    try {
      await fileRepo.remove(id)
    } catch {
      toast('Error', {
        description: `Failed to delete "${name}" from the server.`,
      })
      return
    }
    toast('Deleted', {
      description: `"${name}" has been removed.`,
      icon: Trash2,
    })
    return
  }
  // Otherwise treat as folder
  const idx = folders.value.findIndex((f) => f.id === id)
  if (idx === -1) return
  const name = folders.value[idx].name
  folders.value.splice(idx, 1)
  toast('Deleted', {
    description: `"${name}" has been removed.`,
    icon: Trash2,
  })
}

function onCreateFolder(name: string) {
  if (folders.value.some((it) => it.name === name)) {
    toast('Error', {
      description: 'A folder with that name already exists.',
    })
    return
  }
  addFolder(name)
  toast('Folder created', {
    description: `"${name}" has been created.`,
  })
}

async function handleFiles(files: FileList) {
  let count = 0
  for (const file of files) {
    try {
      await fileRepo.upload(file)
      count++
    } catch {
      toast('Error', {
        description: `Failed to upload "${file.name}".`,
      })
    }
  }
  if (count > 0) {
    toast('Uploaded', {
      description: `${count} file${count > 1 ? 's' : ''} uploaded.`,
    })
  }
}

async function refresh() {
  await loadFiles()
  toast('Refreshed', { description: 'View is up to date.' })
}

onMounted(loadFiles)
</script>

<template>
  <div class="flex min-h-screen justify-center bg-[#f1f3f6] p-1">
    <!-- ── Main Card ── -->
    <div
      class="flex max-h-[99vh] min-h-[99vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-md bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <DriveHeader
        @create-folder="onCreateFolder"
        @upload="handleFiles"
        @refresh="refresh"
      />

      <DriveToolbar
        v-model:view-mode="viewMode"
        v-model:search-query="searchQuery"
      />

      <DriveContent
        :items="filteredItems"
        :view-mode="viewMode"
        :search-query="searchQuery"
        @delete-item="deleteItem"
        @upload="handleFiles"
      />
    </div>

    <!-- Toast provider -->
    <Sonner rich-colors close-button position="bottom-right" />
  </div>
</template>
