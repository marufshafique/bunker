<script setup lang="ts">
import { Cloud } from '@lucide/vue'
import { useFolderRepo } from '@/stores/orm'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{
  folderId?: string
}>()

const router = useRouter()

const route = useRoute()
const folder = computed(() => {
  return useFolderRepo().find(route.params.id as string)
})

function goBack() {
  router.push({ name: 'home' })
}
</script>

<template>
  <header
    class="border-border flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
  >
    <div
      class="text-foreground flex items-center gap-2.5 text-xl font-semibold tracking-tight"
    >
      <Cloud class="text-primary size-8" />
      <span
        class="from-primary to-primary/80 bg-linear-to-br bg-clip-text text-transparent"
      >
        Drive
      </span>
    </div>

    <div v-if="folder?.name" class="flex shrink-0 items-center gap-2">
      <button
        class="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
        @click="goBack"
      >
        ← My Drive
      </button>

      <span class="text-muted-foreground/50">/</span>
      <span class="text-foreground truncate text-sm font-medium">
        {{ folder?.name }}
      </span>
    </div>
  </header>
</template>
