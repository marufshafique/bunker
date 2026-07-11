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
import { useDriveFileRepo, useFolderRepo } from '@/stores/orm'

const fileRepo = useDriveFileRepo()
const folderRepo = useFolderRepo()

const viewMode = useStorage<'grid' | 'list'>(
  'drive-view-mode',
  'grid',
)
const searchQuery = ref('')

const filteredItems = computed<DriveItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const all: DriveItem[] = [
    ...folderRepo.all().map((f) => f.toDriveItem()),
    ...fileRepo.all().map((f) => f.toDriveItem()),
  ]
  if (!q) return all
  return all.filter((it) => it.name.toLowerCase().includes(q))
})

async function loadFiles() {
  try {
    await Promise.all([fileRepo.list(), folderRepo.list()])
  } catch {
    toast('Error', {
      description: 'Failed to load files from the server.',
    })
  }
}

async function deleteItem(id: string) {
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

  const folder = folderRepo.find(id)
  if (folder) {
    const name = folder.name
    try {
      await folderRepo.remove(id)
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
}

async function onCreateFolder(name: string) {
  if (folderRepo.all().some((f) => f.name === name)) {
    toast('Error', {
      description: 'A folder with that name already exists.',
    })
    return
  }
  try {
    await folderRepo.create({ name })
    toast('Folder created', {
      description: `"${name}" has been created.`,
    })
  } catch {
    toast('Error', {
      description: 'Failed to create folder on the server.',
    })
  }
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
