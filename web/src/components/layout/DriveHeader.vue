<script setup lang="ts">
import { Cloud, RefreshCw } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { useDriveFileRepo, useFolderRepo } from '@/stores/orm'

const props = defineProps<{
  folderId?: string
}>()

const fileRepo = useDriveFileRepo()
const folderRepo = useFolderRepo()

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
    class="border-border flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
  >
    <div
      class="text-foreground flex items-center gap-2.5 text-xl font-semibold tracking-tight"
    >
      <Cloud class="text-primary size-7" />
      <span
        class="from-primary to-primary/80 bg-gradient-to-br bg-clip-text text-transparent"
      >
        Drive
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <Button
        variant="secondary"
        size="icon"
        class="bg-muted hover:bg-accent size-9 rounded-full"
        title="Refresh"
        @click="refresh"
      >
        <RefreshCw />
      </Button>
    </div>
  </header>
</template>
