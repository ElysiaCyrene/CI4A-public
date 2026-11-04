<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <div class="page-actions">
        <span style="font-weight: 600; margin-right: 8px">Scope:</span>
        <el-select v-model="selectedScope" style="width: 200px">
          <el-option label="All Store Views" value="all" />
          <el-option label="Default Store View" value="1" />
        </el-select>
        <el-button type="primary" @click="fetchData" style="background: #eb5202; border-color: #eb5202">
          Reload Data
        </el-button>
      </div>
    </div>

    <!-- Advanced Reporting -->
    <div class="advanced-reporting">
      <div>
        <h3 style="margin: 0 0 4px 0; font-size: 16px">Advanced Reporting</h3>
        <p style="margin: 0; color: #666; font-size: 13px">
          Gain new insights and take command of your business' performance,
          using our dynamic product, order, and customer reports tailored to
          your customer data.
        </p>
      </div>
      <el-button style="color: #007bdb; border-color: #007bdb; font-weight: 600">
        Go to Advanced Reporting <el-icon style="margin-left: 4px"><TopRight /></el-icon>
      </el-button>
    </div>

    <!-- Chart Section -->
    <el-card style="margin-bottom: 24px">
      <div style="margin-bottom: 20px">
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0">Lifetime Sales</h3>
        <div style="font-size: 24px; font-weight: 600; color: #eb5202">
          {{ formatCurrency(lifetimeSales) }}
        </div>
      </div>
      <div style="margin-bottom: 20px">
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0">Average Order</h3>
        <div style="font-size: 24px; font-weight: 600; color: #eb5202">
          {{ formatCurrency(averageOrder) }}
        </div>
      </div>
      <div style="display: flex; border-top: 1px solid #e3e3e3; padding-top: 20px">
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 200px">
          <span style="color: #666; font-size: 13px">
            Chart is disabled. To enable the chart, click <a href="#">here</a>.
          </span>
        </div>
        <div style="width: 300px; padding-left: 20px">
          <div v-for="s in chartStats" :key="s.label" style="margin-bottom: 20px">
            <div style="font-weight: 600; font-size: 13px; color: #333">{{ s.label }}</div>
            <div style="font-size: 18px; font-weight: 600; color: #eb5202">{{ s.value }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TopRight } from '@element-plus/icons-vue'

const selectedScope = ref('all')
const lifetimeSales = ref(0)
const averageOrder = ref(0)
const chartStats = [
  { label: 'Revenue', value: '$0.00' },
  { label: 'Tax', value: '$0.00' },
  { label: 'Shipping', value: '$0.00' },
  { label: 'Quantity', value: '0' },
]

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0)
}

const fetchData = async () => {
  try {
    const params = new URLSearchParams()
    if (selectedScope.value !== 'all') {
      params.append('store_id', selectedScope.value)
    }
    const qs = params.toString() ? `?${params.toString()}` : ''

    const statsRes = await fetch(`/api/dashboard/stats${qs}`)
    const statsData = await statsRes.json()
    lifetimeSales.value = statsData.lifetime_sales || 0
    averageOrder.value = statsData.average_order || 0
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard-container {
  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 300;
  margin: 0;
  color: #333;
}
.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.advanced-reporting {
  background: #fff;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e3e3e3;
}
</style>
