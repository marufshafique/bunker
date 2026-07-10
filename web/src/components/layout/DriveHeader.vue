<script setup lang="ts">
import { ref } from 'vue'
import { Cloud, FolderPlus, Upload, RefreshCw } from '@lucide/vue'
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

const emit = defineEmits<{
  (e: 'create-folder', name: string): void
  (e: 'upload', files: FileList): void
  (e: 'refresh'): void
}>()

const dialogOpen = ref(false)
const folderName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function submitFolder() {
  const name = folderName.value.trim()
  if (!name) return
  emit('create-folder', name)
  folderName.value = ''
  dialogOpen.value = false
}

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('upload', target.files)
    target.value = ''
  }
}
</script>

<template>
  <header class="flex items-center justify-between px-7 py-4 border-b border-[#eef0f2] shrink-0 gap-3 flex-wrap">
    <!-- Brand -->
    <div class="flex items-center gap-2.5 font-semibold text-xl tracking-[-0.3px] text-[#1a1a1a]">
      <Cloud class="size-[30px] text-[#0b57d0]" />
      <span class="bg-gradient-to-br from-[#0b57d0] to-[#1a73e8] bg-clip-text text-transparent">
        Drive
      </span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2.5 flex-wrap">
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button
            class="rounded-full h-9 px-4 gap-1.5 text-sm bg-[#0b57d0] hover:bg-[#0847b0] shadow-[0_2px_6px_rgba(11,87,208,0.2)] hover:shadow-[0_4px_12px_rgba(11,87,208,0.3)] hover:-translate-y-px">
            <FolderPlus />
            <span class="max-sm:hidden">New folder</span>
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[420px] rounded-[28px] p-8">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2.5 text-xl font-semibold">
              <FolderPlus class="size-7 text-[#0b57d0]" />
              New folder
            </DialogTitle>
            <DialogDescription class="text-[#5f6368] mt-1.5">
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            v-model="folderName"
            placeholder="My folder"
            class="rounded-2xl h-11 border-2 border-[#e8eaed] bg-[#fafbfc] focus-visible:border-[#0b57d0] focus-visible:bg-white text-[15px] focus-visible:ring-0"
            @keydown.enter="submitFolder"
          />
          <DialogFooter class="mt-6 gap-2.5">
            <Button
              variant="secondary"
              class="rounded-full h-10 px-6 bg-[#f1f3f6] hover:bg-[#e8eaed] text-[#1e1e1e]"
              @click="dialogOpen = false"
            >
              Cancel
            </Button>
            <Button
              class="rounded-full h-10 px-6 bg-[#0b57d0] hover:bg-[#0847b0]"
              @click="submitFolder"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        class="rounded-full h-9 px-4 gap-1.5 text-sm bg-[#0b57d0] hover:bg-[#0847b0] shadow-[0_2px_6px_rgba(11,87,208,0.2)] hover:shadow-[0_4px_12px_rgba(11,87,208,0.3)] hover:-translate-y-px"
        @click="triggerUpload">
        <Upload />
        <span class="max-sm:hidden">Upload</span>
      </Button>
      <input ref="fileInput" type="file" multiple class="hidden" @change="onFileChange" />

      <Button
        variant="secondary"
        size="icon"
        class="rounded-full size-9 bg-[#f1f3f6] hover:bg-[#e8eaed]"
        title="Refresh"
        @click="emit('refresh')"
      >
        <RefreshCw />
      </Button>
    </div>
  </header>
</template>
