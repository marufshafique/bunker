<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Trash2 } from '@lucide/vue'
import DriveHeader from '@/components/layout/DriveHeader.vue'
import DriveToolbar from '@/components/layout/DriveToolbar.vue'
import DriveContent from '@/components/layout/DriveContent.vue'
import type { DriveItem } from '@/types/drive'
import { useDriveFileRepo, useFolderRepo } from '@/stores/orm'

const router = useRouter()
const fileRepo = useDriveFileRepo()
const folderRepo = useFolderRepo()

const searchQuery = ref('')

const filteredItems = computed<DriveItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const all: DriveItem[] = [
    ...folderRepo.foldersById(null).map((f) => f.toDriveItem()),
    ...fileRepo.filesByFolderId(null).map((f) => f.toDriveItem()),
  ]

  if (!q) {
    return all
  }

  return all.filter((it) => it.name.toLowerCase().includes(q))
})

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

function onClickItem(id: string, isFolder: boolean) {
  if (isFolder) {
    router.push({ name: 'folder', params: { id } })
  }
}

async function downloadItem(id: string, name: string) {
  try {
    await fileRepo.download(id, name)
  } catch {
    toast('Error', {
      description: `Failed to download "${name}".`,
    })
  }
}

onMounted(() => {
  Promise.all([fileRepo.list(), folderRepo.list()]).catch(() => {
    toast('Error', {
      description: 'Failed to load files from the server.',
    })
  })
})
</script>

<template>
  <div class="flex min-h-screen justify-center bg-muted p-1">
    <div
      class="flex max-h-screen min-h-screen w-full max-w-6xl flex-col overflow-hidden rounded-md bg-card shadow-2xl"
    >
      <DriveHeader />

      <DriveToolbar v-model:search-query="searchQuery" />

      <DriveContent
        :items="filteredItems"
        :search-query="searchQuery"
        @delete-item="deleteItem"
        @click-item="onClickItem"
        @download-item="downloadItem"
      />
    </div>
  </div>
</template>
