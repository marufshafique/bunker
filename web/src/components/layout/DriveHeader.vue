<script setup lang="ts">
import { computed, ref } from 'vue'
import { Cloud, FolderPlus, Upload, RefreshCw } from '@lucide/vue'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { useDriveFileRepo, useFolderRepo } from '@/stores/orm'
import type { Folder } from '@/models/Folder'

const props = defineProps<{
  folderId?: string
}>()

const fileRepo = useDriveFileRepo()
const folderRepo = useFolderRepo()

const dialogOpen = ref(false)
const folderName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

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

function triggerUpload() {
  fileInput.value?.click()
}

const folder = computed<Folder>(() => {
  return folderRepo.find(props.folderId ?? '') ?? ({} as Folder)
})
async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

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

async function refresh() {
  try {
    await Promise.all([fileRepo.list(), folderRepo.list()])
    toast('Refreshed', { description: 'View is up to date.' })
  } catch {
    toast('Error', {
      description: 'Failed to refresh from the server.',
    })
  }
}
</script>

<template>
  <header
    class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#eef0f2] px-7 py-4"
  >
    <!-- Brand -->
    <div
      class="flex items-center gap-2.5 text-xl font-semibold tracking-[-0.3px] text-[#1a1a1a]"
    >
      <Cloud class="size-[30px] text-[#0b57d0]" />
      <span
        class="bg-gradient-to-br from-[#0b57d0] to-[#1a73e8] bg-clip-text text-transparent"
      >
        Drive
      </span>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap items-center gap-2.5">
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button
            class="h-9 gap-1.5 rounded-full bg-[#0b57d0] px-4 text-sm shadow-[0_2px_6px_rgba(11,87,208,0.2)] hover:-translate-y-px hover:bg-[#0847b0] hover:shadow-[0_4px_12px_rgba(11,87,208,0.3)]"
          >
            <FolderPlus />
            <span class="max-sm:hidden">New folder</span>
          </Button>
        </DialogTrigger>
        <DialogContent class="rounded-[28px] p-8 sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle
              class="flex items-center gap-2.5 text-xl font-semibold"
            >
              <FolderPlus class="size-7 text-[#0b57d0]" />
              New folder
            </DialogTitle>
            <DialogDescription class="mt-1.5 text-[#5f6368]">
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            v-model="folderName"
            placeholder="My folder"
            class="h-11 rounded-2xl border-2 border-[#e8eaed] bg-[#fafbfc] text-[15px] focus-visible:border-[#0b57d0] focus-visible:bg-white focus-visible:ring-0"
            @keydown.enter="submitFolder"
          />
          <DialogFooter class="mt-6 gap-2.5">
            <Button
              variant="secondary"
              class="h-10 rounded-full bg-[#f1f3f6] px-6 text-[#1e1e1e] hover:bg-[#e8eaed]"
              @click="dialogOpen = false"
            >
              Cancel
            </Button>
            <Button
              class="h-10 rounded-full bg-[#0b57d0] px-6 hover:bg-[#0847b0]"
              @click="submitFolder"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        class="h-9 gap-1.5 rounded-full bg-[#0b57d0] px-4 text-sm shadow-[0_2px_6px_rgba(11,87,208,0.2)] hover:-translate-y-px hover:bg-[#0847b0] hover:shadow-[0_4px_12px_rgba(11,87,208,0.3)]"
        @click="triggerUpload"
      >
        <Upload />
        <span class="max-sm:hidden">Upload</span>
      </Button>
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        @change="onFileChange"
      />

      <Button
        variant="secondary"
        size="icon"
        class="size-9 rounded-full bg-[#f1f3f6] hover:bg-[#e8eaed]"
        title="Refresh"
        @click="refresh"
      >
        <RefreshCw />
      </Button>
    </div>
  </header>
</template>
