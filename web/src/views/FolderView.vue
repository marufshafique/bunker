<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Trash2 } from '@lucide/vue'
import DriveHeader from '@/components/layout/DriveHeader.vue'
import DriveToolbar from '@/components/layout/DriveToolbar.vue'
import DriveContent from '@/components/layout/DriveContent.vue'
import type { DriveItem } from '@/types/drive'
import { useDriveFileRepo, useFolderRepo } from '@/stores/orm'

const props = defineProps<{ id: string }>()
const router = useRouter()

const fileRepo = useDriveFileRepo()
const folderRepo = useFolderRepo()

const searchQuery = ref('')
const folderName = ref('')

const filteredItems = computed<DriveItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()

  const all: DriveItem[] = [
    ...folderRepo.all().map((f) => f.toDriveItem()),
    ...fileRepo.all().map((f) => f.toDriveItem()),
  ]

  if (!q) return all

  return all.filter((it) => it.name.toLowerCase().includes(q))
})

async function loadFolder() {
  try {
    const folder = await folderRepo.get(props.id)
    folderName.value = folder.response?.data?.name ?? 'Folder'
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

function goBack() {
  router.push({ name: 'home' })
}

onMounted(loadFolder)
watch(() => props.id, loadFolder)
</script>

<template>
  <div class="flex min-h-screen justify-center bg-[#f1f3f6] p-1">
    <div
      class="flex max-h-[99vh] min-h-[99vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-md bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <header
        class="flex shrink-0 items-center gap-3 border-b border-[#eef0f2] px-7 py-2.5"
      >
        <button
          class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[#5f6368] transition-colors hover:bg-[#f1f3f6] hover:text-[#1a1a1a]"
          @click="goBack"
        >
          ← My Drive
        </button>
        <span class="text-[#d1d5db]">/</span>
        <span class="truncate text-sm font-medium text-[#1a1a1a]">
          {{ folderName }}
        </span>
      </header>

      <DriveHeader :folder-id="id" />

      <DriveToolbar v-model:search-query="searchQuery" />

      <DriveContent
        :items="filteredItems"
        :search-query="searchQuery"
        :folder-id="id"
        @delete-item="deleteItem"
        @click-item="onClickItem"
      />
    </div>
  </div>
</template>
