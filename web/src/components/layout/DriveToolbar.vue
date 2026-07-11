<script setup lang="ts">
import { Search, LayoutGrid, List } from '@lucide/vue'
import { useStorage } from '@vueuse/core'
import { Button } from '@/components/ui/button'

const viewMode = useStorage<'grid' | 'list'>('drive-view-mode', 'grid')

const searchQuery = defineModel<string>('searchQuery', {
  required: true,
})
</script>

<template>
  <div
    class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#f0f2f4] px-7 pt-2 pb-3"
  >
    <!-- View toggle -->
    <div class="flex gap-1 rounded-full bg-[#f1f3f6] p-[3px]">
      <Button
        :variant="viewMode === 'grid' ? 'secondary' : 'ghost'"
        size="sm"
        class="h-8 rounded-full px-3.5 text-[13px]"
        :class="
          viewMode === 'grid'
            ? 'bg-white text-[#1a1a1a] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:bg-white'
            : 'bg-transparent text-[#5f6368] hover:bg-[#e8eaed]'
        "
        @click="viewMode = 'grid'"
      >
        <LayoutGrid />
      </Button>
      <Button
        :variant="viewMode === 'list' ? 'secondary' : 'ghost'"
        size="sm"
        class="h-8 rounded-full px-3.5 text-[13px]"
        :class="
          viewMode === 'list'
            ? 'bg-white text-[#1a1a1a] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:bg-white'
            : 'bg-transparent text-[#5f6368] hover:bg-[#e8eaed]'
        "
        @click="viewMode = 'list'"
      >
        <List />
      </Button>
    </div>

    <!-- Search -->
    <div
      class="flex max-w-[340px] min-w-[200px] flex-1 items-center gap-2 rounded-full bg-[#f1f3f6] px-4 transition-colors focus-within:bg-[#e8eaed]"
    >
      <Search class="size-5 shrink-0 text-[#5f6368]" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search files & folders…"
        class="w-full border-none bg-transparent py-2.5 font-[inherit] text-sm text-[#1e1e1e] outline-none placeholder:text-[#5f6368]"
      />
    </div>
  </div>
</template>
