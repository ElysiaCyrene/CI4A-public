<template>
  <div class="product-views-report">
    <div class="page-header">
      <h1 class="page-title">Product Views Report</h1>
      <a-button
        type="primary"
        style="background: #eb5202; border-color: #eb5202"
        @click="fetchReport"
        >Show Report</a-button
      >
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <h3>Filter</h3>
      <a-form layout="vertical" :model="filters" @finish="fetchReport">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="Period"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 4 }"
            >
              <a-select v-model:value="filters.period">
                <a-select-option value="day">Day</a-select-option>
                <a-select-option value="month">Month</a-select-option>
                <a-select-option value="year">Year</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="From"
              required
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 6 }"
            >
              <a-date-picker
                v-model:value="filters.from"
                format="MM/DD/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 150px"
              />
              <calendar-outlined style="margin-left: 8px; color: #666" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="To"
              required
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 6 }"
            >
              <a-date-picker
                v-model:value="filters.to"
                format="MM/DD/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 150px"
              />
              <calendar-outlined style="margin-left: 8px; color: #666" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="Empty Rows"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 4 }"
            >
              <a-select v-model:value="filters.emptyRows">
                <a-select-option value="No">No</a-select-option>
                <a-select-option value="Yes">Yes</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="export-bar">
      <span>Export to:</span>
      <a-select style="width: 80px; margin: 0 8px">
        <a-select-option value="CSV">CSV</a-select-option>
        <a-select-option value="Excel">Excel XML</a-select-option>
      </a-select>
      <a-button @click="handleExport">Export</a-button>
    </div>

    <!-- Data Table -->
    <div class="data-table">
      <div v-if="data.length === 0" class="no-records">0 records found</div>
      <a-table
        v-else
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :loading="loading"
        row-key="period_group"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'price'">
            {{ formatCurrency(record.price) }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { CalendarOutlined } from "@ant-design/icons-vue";
import axios from "axios";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

const loading = ref(false);
const data = ref([]);

const filters = reactive({
  period: undefined,
  from: undefined,
  to: undefined,
  emptyRows: undefined,
});

const columns = [
  { title: "Interval", dataIndex: "period_group", key: "period_group" },
  { title: "Product", dataIndex: "product_name", key: "product_name" },
  { title: "Price", dataIndex: "price", key: "price", align: "right" },
  { title: "Views", dataIndex: "views", key: "views", align: "right" },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const handleExport = () => {
  message.success("Export successfully");
};

const fetchReport = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      "/api/reports/products/views",
      {
        params: filters,
      }
    );
    data.value = response.data;
  } catch (error) {
    console.error("Error fetching product views report:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {});
</script>

<style scoped>
.product-views-report {
  padding: 20px;
  background: #f4f5f7;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 300;
  color: #262626;
  margin: 0;
}

.filter-section {
  background: #fff;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #d9d9d9;
}

.filter-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 1px solid #e3e3e3;
  padding-bottom: 10px;
}

.export-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.data-table {
  background: #fff;
  padding: 0;
  border: 1px solid #d9d9d9;
}

.no-records {
  padding: 20px;
  text-align: left;
  color: #333;
}

:deep(.ant-form-item-label) {
  text-align: left;
  font-weight: 600;
}
</style>
