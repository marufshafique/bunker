<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Trash2 } from '@lucide/vue'
import DriveHeader from '@/components/layout/DriveHeader.vue'
import DriveToolbar from '@/components/layout/DriveToolbar.vue'
import DriveContent from '@/components/layout/DriveContent.vue'
import DriveQuickActions from '@/components/layout/DriveQuickActions.vue'
import type { DriveItem } from '@/types/drive'
import { useDriveFileRepo, useFolderRepo } from '@/stores/orm'

const props = defineProps<{ id: string }>()
const router = useRouter()

const fileRepo = useDriveFileRepo()
const folderRepo = useFolderRepo()

const searchQuery = ref('')

const filteredItems = computed<DriveItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()

  const all: DriveItem[] = [
    ...folderRepo.foldersById(props.id).map((f) => f.toDriveItem()),
    ...fileRepo.filesByFolderId(props.id).map((f) => f.toDriveItem()),
  ]

  if (!q) {
    return all
  }

  return all.filter((it) => it.name.toLowerCase().includes(q))
})

async function loadFolder() {
  try {
    await Promise.all([
      fileRepo.list(props.id),
      folderRepo.list(props.id),
    ])
  } catch {
    toast('Error', { description: 'Failed to load folder contents.' })
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

onMounted(loadFolder)
watch(() => props.id, loadFolder)
</script>

<template>
  <div class="bg-muted flex min-h-screen justify-center p-1">
    <div
      class="bg-card flex max-h-screen w-full max-w-6xl flex-col overflow-hidden rounded-md shadow-2xl"
    >
      <DriveHeader :folder-id="id" />

      <DriveToolbar v-model:search-query="searchQuery" />

      <DriveContent
        :items="filteredItems"
        :search-query="searchQuery"
        :folder-id="id"
        @delete-item="deleteItem"
        @click-item="onClickItem"
        @download-item="downloadItem"
      />
    </div>

    <DriveQuickActions />
  </div>
</template>
