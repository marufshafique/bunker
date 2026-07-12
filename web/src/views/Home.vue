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
    ...fileRepo.all().map((f) => f.toDriveItem()),
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

onMounted(() => {
  Promise.all([fileRepo.list(), folderRepo.list()]).catch(() => {
    toast('Error', {
      description: 'Failed to load files from the server.',
    })
  })
})
</script>

<template>
  <div class="flex min-h-screen justify-center bg-[#f1f3f6] p-1">
    <div
      class="flex max-h-[99vh] min-h-[99vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-md bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <DriveHeader />

      <DriveToolbar v-model:search-query="searchQuery" />

      <DriveContent
        :items="filteredItems"
        :search-query="searchQuery"
        @delete-item="deleteItem"
        @click-item="onClickItem"
      />
    </div>
  </div>
</template>
