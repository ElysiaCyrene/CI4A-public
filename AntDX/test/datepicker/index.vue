<template>
  <div class="test-datepicker-wrapper">
    <ADatePicker v-model:value="value" placeholder="Select date" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import ADatePicker from '../../components/date-picker';

const value = ref<any>(null);
</script>

<style scoped>
.test-datepicker-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
