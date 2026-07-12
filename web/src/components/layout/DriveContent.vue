<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { CloudOff } from '@lucide/vue'
import { useDriveFileRepo } from '@/stores/orm'
import type { DriveItem } from '@/types/drive'
import DriveFolderItem from '@/components/layout/DriveFolderItem.vue'
import DriveFileItem from '@/components/layout/DriveFileItem.vue'

const viewMode = useStorage<'grid' | 'list'>(
  'drive-view-mode',
  'grid',
)

const props = defineProps<{
  items: DriveItem[]
  searchQuery: string
  folderId?: string
}>()

const fileRepo = useDriveFileRepo()

const emit = defineEmits<{
  (e: 'delete-item', id: string): void
  (e: 'click-item', id: string, isFolder: boolean): void
  (e: 'download-item', id: string, name: string): void
}>()

// ─── drag & drop ───
const isDragging = ref(false)
function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}
function onDragLeave() {
  isDragging.value = false
}
async function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (!e.dataTransfer?.files?.length) return

  let count = 0
  for (const file of e.dataTransfer.files) {
    try {
      await fileRepo.upload(file, props.folderId ?? null)
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
</script>

<template>
  <div
    class="bg-muted/40 flex-1 overflow-y-auto px-6 py-4 pb-6 transition-colors"
    :class="{ 'bg-muted': isDragging }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Empty state -->
    <div
      v-if="items.length === 0"
      class="text-muted-foreground flex h-full flex-col items-center justify-center p-5 text-center"
    >
      <CloudOff class="text-muted-foreground/50 mb-4 size-16" />
      <h3 class="text-foreground mb-1.5 text-lg font-medium">
        {{ searchQuery ? 'No results found' : 'Nothing here yet' }}
      </h3>
      <p class="max-w-xs text-sm">
        {{
          searchQuery
            ? 'Try a different search term.'
            : 'Upload files or create a folder to get started.'
        }}
      </p>
    </div>

    <!-- File grid / list -->
    <div
      v-else
      class="grid gap-4"
      :class="
        viewMode === 'grid'
          ? 'grid-cols-[repeat(auto-fill,minmax(170px,1fr))] max-[420px]:grid-cols-2'
          : 'grid-cols-1 gap-0.5'
      "
    >
      <DriveFolderItem
        v-for="item in items.filter((i) => i.isFolder)"
        :key="item.id"
        :item="item"
        :view-mode="viewMode"
        @click-item="(id) => emit('click-item', id, true)"
        @delete-item="(id) => emit('delete-item', id)"
      />

      <DriveFileItem
        v-for="item in items.filter((i) => !i.isFolder)"
        :key="item.id"
        :item="item"
        :view-mode="viewMode"
        @delete-item="(id) => emit('delete-item', id)"
        @download-item="(id, name) => emit('download-item', id, name)"
      />
    </div>
  </div>
</template>
