<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Trash2 } from '@lucide/vue'
import Sonner from '@/components/ui/sonner/Sonner.vue'
import DriveHeader from '@/components/layout/DriveHeader.vue'
import DriveToolbar from '@/components/layout/DriveToolbar.vue'
import DriveContent from '@/components/layout/DriveContent.vue'
import type { DriveItem } from '@/components/layout/DriveContent.vue'
import { uploadFile, listFiles, deleteFile } from '@/lib/api'
import type { BackendFile } from '@/lib/api'

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
function backendFileToDriveItem(f: BackendFile): DriveItem {
  return {
    id: f.id,
    name: f.original_name,
    isFolder: false,
    size: f.file_size_bytes,
    createdAt: new Date(f.uploaded_at).getTime(),
  }
}

// ─── actions ───
async function loadFiles() {
  try {
    const files = await listFiles()
    items.value = files.map(backendFileToDriveItem)
  } catch {
    toast('Error', {
      description: 'Failed to load files from the server.',
    })
  }
}

function addItem(name: string, isFolder: boolean, size = 0) {
  const item: DriveItem = {
    id:
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 6),
    name,
    isFolder,
    size,
    createdAt: Date.now(),
  }
  items.value.unshift(item)
}

async function deleteItem(id: string) {
  const idx = items.value.findIndex((it) => it.id === id)
  if (idx === -1) return
  const name = items.value[idx].name
  items.value.splice(idx, 1)
  try {
    await deleteFile(id)
  } catch {
    toast('Error', {
      description: `Failed to delete "${name}" from the server.`,
    })
  }
  toast('Deleted', {
    description: `"${name}" has been removed.`,
    icon: Trash2,
  })
}

function onCreateFolder(name: string) {
  if (items.value.some((it) => it.name === name && it.isFolder)) {
    toast('Error', {
      description: 'A folder with that name already exists.',
    })
    return
  }
  addItem(name, true)
  toast('Folder created', {
    description: `"${name}" has been created.`,
  })
}

async function handleFiles(files: FileList) {
  let count = 0
  for (const file of files) {
    try {
      const uploaded = await uploadFile(file)
      items.value.unshift(backendFileToDriveItem(uploaded))
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
    <Sonner rich-colors position="bottom-center" />
  </div>
</template>
