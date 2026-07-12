<script setup lang="ts">
import { DropdownMenuTrigger } from 'reka-ui'
</script>

<template>
  <DropdownMenuTrigger v-bind="$props">
    <slot />
  </DropdownMenuTrigger>
</template>
