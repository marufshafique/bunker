<script setup lang="ts">
import { Search, LayoutGrid, List } from '@lucide/vue'
import { Button } from '@/components/ui/button'

const viewMode = defineModel<'grid' | 'list'>('viewMode', { required: true })
const searchQuery = defineModel<string>('searchQuery', { required: true })
</script>

<template>
  <div class="flex items-center justify-between px-7 pt-2 pb-3 border-b border-[#f0f2f4] shrink-0 gap-3 flex-wrap">
    <!-- View toggle -->
    <div class="flex gap-1 bg-[#f1f3f6] rounded-full p-[3px]">
      <Button :variant="viewMode === 'grid' ? 'secondary' : 'ghost'" size="sm"
        class="rounded-full h-8 px-3.5 text-[13px]" :class="viewMode === 'grid'
          ? 'bg-white text-[#1a1a1a] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:bg-white'
          : 'text-[#5f6368] bg-transparent hover:bg-[#e8eaed]'" @click="viewMode = 'grid'">
        <LayoutGrid />
      </Button>
      <Button :variant="viewMode === 'list' ? 'secondary' : 'ghost'" size="sm"
        class="rounded-full h-8 px-3.5 text-[13px]" :class="viewMode === 'list'
          ? 'bg-white text-[#1a1a1a] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:bg-white'
          : 'text-[#5f6368] bg-transparent hover:bg-[#e8eaed]'" @click="viewMode = 'list'">
        <List />
      </Button>
    </div>

    <!-- Search -->
    <div
      class="flex items-center bg-[#f1f3f6] rounded-full px-4 gap-2 min-w-[200px] flex-1 max-w-[340px] focus-within:bg-[#e8eaed] transition-colors">
      <Search class="size-5 text-[#5f6368] shrink-0" />
      <input v-model="searchQuery" type="text" placeholder="Search files & folders…"
        class="bg-transparent border-none outline-none py-2.5 text-sm font-[inherit] w-full text-[#1e1e1e] placeholder:text-[#5f6368]" />
    </div>
  </div>
</template>
