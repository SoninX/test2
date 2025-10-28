<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1>Hello World</h1>
    <UButton>Click me</UButton>
  </div>
</template>
