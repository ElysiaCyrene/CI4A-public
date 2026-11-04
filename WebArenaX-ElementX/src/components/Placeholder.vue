<template>
  <div style="text-align: center; padding: 80px 20px">
    <h2 style="color: #666; font-weight: 400">{{ name }}</h2>
    <p style="color: #999; font-size: 13px; margin-top: 8px">
      This page will be implemented soon.
    </p>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true }
})
</script>
