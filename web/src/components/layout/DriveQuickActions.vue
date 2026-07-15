<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, FolderPlus, Upload } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useDriveFileRepo, useFolderRepo } from '@/stores/orm'
import type { Folder } from '@/models/Folder'
import { useRoute } from 'vue-router'

const props = defineProps<{
  folderId?: string
}>()

const fileRepo = useDriveFileRepo()
const folderRepo = useFolderRepo()

const drawerOpen = ref(false)
const dialogOpen = ref(false)
const folderName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const route = useRoute()
const folder = computed<Folder>(() => {
  const id = route.params.id as string

  return folderRepo.find((id as string) ?? '') ?? ({} as Folder)
})

function openNewFolder() {
  drawerOpen.value = false
  dialogOpen.value = true
}

function triggerUpload() {
  fileInput.value?.click()
}

async function submitFolder() {
  const name = folderName.value.trim()
  if (!name) return

  if (folderRepo.all().some((f) => f.name === name)) {
    toast('Error', {
      description: 'A folder with that name already exists.',
    })
    return
  }

  try {
    await folderRepo.create({
      name,
      folder_id: props.folderId ?? null,
    })
    toast('Folder created', {
      description: `"${name}" has been created.`,
    })
    folderName.value = ''
    dialogOpen.value = false
  } catch {
    toast('Error', {
      description: 'Failed to create folder on the server.',
    })
  }
}

async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  drawerOpen.value = false

  let count = 0
  for (const file of target.files) {
    try {
      await fileRepo.upload(file, folder.value.id, folder.value.name)
      count++
    } catch {
      toast('Error', {
        description: `Failed to upload "${file.name}".`,
      })
    }
  }
  target.value = ''

  if (count > 0) {
    toast('Uploaded', {
      description: `${count} file${count > 1 ? 's' : ''} uploaded.`,
    })
  }
}
</script>

<template>
  <!-- Floating action button (bottom-right) -->
  <Button
    size="icon"
    class="bg-primary hover:bg-primary/80 absolute right-6 bottom-6 z-40 size-14 rounded-full shadow-lg transition-transform hover:-translate-y-px hover:shadow-xl [&_svg]:size-6"
    title="Create"
    @click="drawerOpen = true"
  >
    <Plus />
  </Button>

  <!-- Bottom drawer with create actions -->
  <Drawer v-model:open="drawerOpen">
    <DrawerContent>
      <div class="mx-auto w-full max-w-6xl">
        <DrawerHeader class="text-left">
          <DrawerTitle>Create</DrawerTitle>
          <DrawerDescription>
            Add a new folder or upload files.
          </DrawerDescription>
        </DrawerHeader>

        <div class="flex flex-col gap-2 px-4 pb-8">
          <button
            type="button"
            class="border-border bg-card hover:bg-accent flex items-center gap-3.5 rounded-2xl border px-4 py-4 text-left transition-colors"
            @click="openNewFolder"
          >
            <span
              class="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full"
            >
              <FolderPlus class="size-5" />
            </span>
            <span>
              <span class="text-foreground block text-sm font-medium">
                New folder
              </span>
              <span class="text-muted-foreground block text-xs">
                Create an empty folder here
              </span>
            </span>
          </button>

          <button
            type="button"
            class="border-border bg-card hover:bg-accent flex items-center gap-3.5 rounded-2xl border px-4 py-4 text-left transition-colors"
            @click="triggerUpload"
          >
            <span
              class="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full"
            >
              <Upload class="size-5" />
            </span>
            <span>
              <span class="text-foreground block text-sm font-medium">
                Upload file
              </span>
              <span class="text-muted-foreground block text-xs">
                Upload one or more files
              </span>
            </span>
          </button>
        </div>
      </div>
    </DrawerContent>
  </Drawer>

  <input
    ref="fileInput"
    type="file"
    multiple
    class="hidden"
    @change="onFileChange"
  />

  <Dialog v-model:open="dialogOpen">
    <DialogContent
      class="top-8 translate-y-0 rounded-md p-8 sm:top-1/2 sm:max-w-md sm:-translate-y-1/2"
    >
      <DialogHeader>
        <DialogTitle
          class="flex items-center gap-2.5 text-xl font-semibold"
        >
          <FolderPlus class="text-primary size-7" />
          New folder
        </DialogTitle>
        <DialogDescription class="text-muted-foreground mt-1.5">
          Enter a name for your new folder.
        </DialogDescription>
      </DialogHeader>
      <Input
        v-model="folderName"
        placeholder="My folder"
        class="border-border bg-muted/40 focus-visible:border-primary focus-visible:bg-card h-11 rounded-2xl border-2 text-sm focus-visible:ring-0"
        @keydown.enter="submitFolder"
      />
      <DialogFooter class="mt-6 gap-2.5">
        <Button
          variant="secondary"
          class="bg-muted text-foreground hover:bg-accent h-10 rounded-full px-6"
          @click="dialogOpen = false"
        >
          Cancel
        </Button>
        <Button
          class="bg-primary hover:bg-primary/80 h-10 rounded-full px-6"
          @click="submitFolder"
        >
          Create
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
