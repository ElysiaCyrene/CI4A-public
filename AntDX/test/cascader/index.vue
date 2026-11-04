<template>
  <div class="test-cascader-wrapper">
    <ACascader v-model:value="value" :options="options" placeholder="Please select" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import ACascader from '../../components/cascader';

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
];

const value = ref<string[]>([]);
</script>

<style scoped>
.test-cascader-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
