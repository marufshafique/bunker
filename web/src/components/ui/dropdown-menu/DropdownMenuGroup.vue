<script setup lang="ts">
import { DropdownMenuGroup } from 'reka-ui'
</script>

<template>
  <DropdownMenuGroup v-bind="$props">
    <slot />
  </DropdownMenuGroup>
</template>
