<template>
  <div class="order-count-report">
    <div class="page-header">
      <h1 class="page-title">Order Count Report</h1>
    </div>

    <!-- 筛选栏 -->
    <a-card :bordered="false" style="margin-bottom: 16px">
      <a-form
        class="filter-container"
        :model="filters"
        layout="inline"
        @finish="fetchReport"
      >
        <div class="filter-item">
          <span>From:</span>
          <a-date-picker
            v-model:value="filters.from"
            format="MM/DD/YYYY"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div class="filter-item">
          <span>To:</span>
          <a-date-picker
            v-model:value="filters.to"
            format="MM/DD/YYYY"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div class="filter-item">
          <span>Show By:</span>
          <a-select v-model:value="filters.period" style="width: 120px">
            <a-select-option value="year">Year</a-select-option>
            <a-select-option value="month">Month</a-select-option>
            <a-select-option value="day">Day</a-select-option>
          </a-select>
        </div>
        <a-button type="primary" html-type="submit" :loading="loading"
          >Refresh</a-button
        >
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false" v-if="hasSearched">
      <div class="export-bar">
        <span>Export to:</span>
        <a-select v-model:value="exportFormat" style="width: 100px">
          <a-select-option value="csv">CSV</a-select-option>
          <a-select-option value="excel">Excel</a-select-option>
        </a-select>
        <a-button @click="handleExport">Export</a-button>

        <a-popover
          title="Select Columns"
          trigger="click"
          placement="bottomRight"
        >
          <template #content>
            <a-checkbox-group
              v-model:value="visibleColumnKeys"
              style="display: flex; flex-direction: column"
            >
              <a-checkbox
                v-for="col in allColumns"
                :key="col.key"
                :value="col.key"
                style="margin-left: 0; margin-bottom: 8px"
              >
                {{ col.title }}
              </a-checkbox>
            </a-checkbox-group>
          </template>
          <a-button style="margin-left: 8px">
            <setting-outlined /> Columns
          </a-button>
        </a-popover>
      </div>

      <a-table
        :columns="columns"
        :data-source="reportData"
        :loading="loading"
        :pagination="false"
        row-key="id"
        class="report-table"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'period'">
            <span v-if="shouldShowPeriod(index)">{{ record.period }}</span>
          </template>
          <template v-else-if="column.key === 'average_order_value'">
            {{ formatCurrency(record.average_order_value) }}
          </template>
          <template v-else-if="column.key === 'total_order_value'">
            {{ formatCurrency(record.total_order_value) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { SettingOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

const loading = ref(false);
const reportData = ref([]);
const exportFormat = ref(undefined);
const hasSearched = ref(false);

const filters = reactive({
  from: null,
  to: null,
  period: undefined,
});

const allColumns = [
  {
    title: "Interval",
    key: "period",
    dataIndex: "period",
    width: 150,
  },
  {
    title: "Customer",
    dataIndex: "customer_name",
    key: "customer_name",
  },
  {
    title: "Orders",
    dataIndex: "orders_count",
    key: "orders_count",
    align: "right",
  },
  {
    title: "Average",
    dataIndex: "average_order_value",
    key: "average_order_value",
    align: "right",
  },
  {
    title: "Total",
    dataIndex: "total_order_value",
    key: "total_order_value",
    align: "right",
  },
];

const visibleColumnKeys = ref(allColumns.map((c) => c.key));

const columns = computed(() => {
  return allColumns.filter((c) => visibleColumnKeys.value.includes(c.key));
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const shouldShowPeriod = (index) => {
  if (index === 0) return true;
  return reportData.value[index].period !== reportData.value[index - 1].period;
};

const handleExport = () => {
  message.success("Export successfully");
};

const fetchReport = async () => {
  loading.value = true;
  hasSearched.value = true;
  try {
    const params = new URLSearchParams({
      period: filters.period || "year",
    });

    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);

    const response = await fetch(
      `/api/reports/order-count?${params}`
    );
    const data = await response.json();

    // Add unique ID for table key
    reportData.value = data.map((item, index) => ({
      ...item,
      id: index,
    }));
  } catch (error) {
    console.error("Failed to fetch report:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.report-table :deep(.ant-table-thead > tr > th) {
  background: #514943;
  color: white;
  font-weight: bold;
}
</style>
