<script setup lang="ts">
import { Search, LayoutGrid, List } from '@lucide/vue'
import { useStorage } from '@vueuse/core'
import { Button } from '@/components/ui/button'

const viewMode = useStorage<'grid' | 'list'>(
  'drive-view-mode',
  'grid',
)

const searchQuery = defineModel<string>('searchQuery', {
  required: true,
})
</script>

<template>
  <div
    class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 pt-2 pb-3"
  >
    <!-- View toggle -->
    <div class="flex gap-1 rounded-full bg-muted p-0.5">
      <Button
        :variant="viewMode === 'grid' ? 'secondary' : 'ghost'"
        size="sm"
        class="h-8 rounded-full px-3.5 text-xs"
        :class="
          viewMode === 'grid'
            ? 'bg-card text-foreground shadow-sm hover:bg-card'
            : 'bg-transparent text-muted-foreground hover:bg-accent'
        "
        @click="viewMode = 'grid'"
      >
        <LayoutGrid />
      </Button>
      <Button
        :variant="viewMode === 'list' ? 'secondary' : 'ghost'"
        size="sm"
        class="h-8 rounded-full px-3.5 text-xs"
        :class="
          viewMode === 'list'
            ? 'bg-card text-foreground shadow-sm hover:bg-card'
            : 'bg-transparent text-muted-foreground hover:bg-accent'
        "
        @click="viewMode = 'list'"
      >
        <List />
      </Button>
    </div>

    <!-- Search -->
    <div
      class="flex max-w-sm min-w-48 flex-1 items-center gap-2 rounded-full bg-muted px-4 transition-colors focus-within:bg-accent"
    >
      <Search class="size-5 shrink-0 text-muted-foreground" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search files & folders…"
        class="w-full border-none bg-transparent py-2.5 font-[inherit] text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  </div>
</template>
