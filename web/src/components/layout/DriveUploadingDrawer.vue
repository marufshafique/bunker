<script lang="ts" setup>
import {
  File,
  Image,
  FileText,
  LoaderCircle,
  CircleCheck,
  CircleAlert,
} from '@lucide/vue'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

export interface UploadingFile {
  id: string
  name: string
  status: 'uploading' | 'done' | 'error'
}

defineProps<{
  files: UploadingFile[]
}>()

const drawerOpen = defineModel({ default: false })

// ─── helpers (mirrors DriveFileItem) ───
function getIconType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (
    ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)
  )
    return 'image'
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) return 'doc'
  return 'file'
}

function iconComponent(type: string) {
  switch (type) {
    case 'image':
      return Image
    case 'pdf':
      return File
    case 'doc':
      return FileText
    default:
      return File
  }
}

function iconBgColor(type: string): string {
  switch (type) {
    case 'image':
      return 'bg-red-100 text-red-700'
    case 'pdf':
      return 'bg-red-100 text-red-700'
    case 'doc':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-blue-100 text-blue-700'
  }
}
</script>

<template>
  <Drawer v-model:open="drawerOpen">
    <DrawerContent>
      <div class="mx-auto w-full max-w-6xl">
        <DrawerHeader class="text-left">
          <DrawerTitle>Uploading</DrawerTitle>
          <DrawerDescription>
            Uploading these files to the folder.
          </DrawerDescription>
        </DrawerHeader>

        <div class="flex flex-col gap-2 px-4 pb-8">
          <p
            v-if="files.length === 0"
            class="text-muted-foreground py-6 text-center text-sm"
          >
            No files uploading.
          </p>

          <div
            v-for="file in files"
            :key="file.id"
            class="border-border bg-card flex items-center gap-4 rounded-md border px-4 py-3 shadow-sm"
            :title="file.name"
          >
            <!-- Icon -->
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-xl"
              :class="iconBgColor(getIconType(file.name))"
            >
              <component
                :is="iconComponent(getIconType(file.name))"
                class="size-5"
              />
            </div>

            <!-- Name -->
            <div
              class="text-foreground flex-1 truncate text-sm font-medium"
              :title="file.name"
            >
              {{ file.name }}
            </div>

            <!-- Status -->
            <LoaderCircle
              v-if="file.status === 'uploading'"
              class="text-muted-foreground size-5 shrink-0 animate-spin"
            />
            <CircleCheck
              v-else-if="file.status === 'done'"
              class="size-5 shrink-0 text-green-600"
            />
            <CircleAlert
              v-else
              class="size-5 shrink-0 text-red-600"
            />
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
