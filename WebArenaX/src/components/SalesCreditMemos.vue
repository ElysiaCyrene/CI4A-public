<template>
  <div class="sales-credit-memos">
    <div class="page-header">
      <h1 class="page-title">Credit Memos</h1>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="actions-bar">
      <div class="toolbar">
        <a-button @click="toggleFilters">
          <filter-outlined /> Filters
        </a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item>Default View</a-menu-item>
            </a-menu>
          </template>
          <a-button> <eye-outlined /> Default View <down-outlined /> </a-button>
        </a-dropdown>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item>Columns</a-menu-item>
            </a-menu>
          </template>
          <a-button> <setting-outlined /> Columns <down-outlined /> </a-button>
        </a-dropdown>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item>CSV</a-menu-item>
              <a-menu-item>Excel XML</a-menu-item>
            </a-menu>
          </template>
          <a-button> <upload-outlined /> Export <down-outlined /> </a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div v-if="showFilters" class="filters-section">
      <a-form layout="vertical" :model="filters" @finish="applyFilters">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Created">
              <div class="date-range">
                <a-date-picker
                  v-model:value="filters.created_at_from"
                  placeholder="from"
                  format="MM/DD/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <a-date-picker
                  v-model:value="filters.created_at_to"
                  placeholder="to"
                  format="MM/DD/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%; margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Order Date">
              <div class="date-range">
                <a-date-picker
                  v-model:value="filters.order_date_from"
                  placeholder="from"
                  format="MM/DD/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <a-date-picker
                  v-model:value="filters.order_date_to"
                  placeholder="to"
                  format="MM/DD/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%; margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Refunded">
              <div class="range-input">
                <a-input
                  v-model:value="filters.refunded_from"
                  placeholder="from"
                />
                <a-input
                  v-model:value="filters.refunded_to"
                  placeholder="to"
                  style="margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Credit Memo">
              <a-input v-model:value="filters.creditmemo_increment_id" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Order #">
              <a-input v-model:value="filters.order_increment_id" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Bill-to Name">
              <a-input v-model:value="filters.bill_to_name" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Status">
              <a-select v-model:value="filters.status" allow-clear>
                <a-select-option value="Pending">Pending</a-select-option>
                <a-select-option value="Refunded">Refunded</a-select-option>
                <a-select-option value="Canceled">Canceled</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <div class="filter-actions">
          <a-button @click="resetFilters" style="margin-right: 8px"
            >Cancel</a-button
          >
          <a-button type="primary" @click="applyFilters"
            >Apply Filters</a-button
          >
        </div>
      </a-form>
    </div>

    <div class="table-controls">
      <div class="left-controls">
        <a-select
          v-model:value="bulkAction"
          style="width: 120px"
          placeholder="Actions"
        >
          <a-select-option value="pdf_creditmemos"
            >PDF Credit Memos</a-select-option
          >
        </a-select>
        <span class="records-count">{{ pagination.total }} records found</span>
      </div>
      <div class="right-controls">
        <a-select
          v-model:value="pagination.pageSize"
          style="width: 100px"
          @change="handlePageSizeChange"
        >
          <a-select-option :value="20">20</a-select-option>
          <a-select-option :value="50">50</a-select-option>
          <a-select-option :value="100">100</a-select-option>
        </a-select>
        <span class="per-page-text">per page</span>
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="false"
          @change="handlePageChange"
          simple
        />
      </div>
    </div>

    <!-- 数据表格 -->
    <a-card :bordered="false" class="table-card">
      <a-table
        :columns="columns"
        :data-source="creditmemos"
        :loading="loading"
        :pagination="false"
        :row-selection="rowSelection"
        :row-key="(record) => record.entity_id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-else-if="column.key === 'order_created_at'">
            {{ formatDate(record.order_created_at) }}
          </template>
          <template v-else-if="column.key === 'refunded'">
            {{ formatCurrency(record.refunded) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="handleView(record)">View</a>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  EyeOutlined,
  SettingOutlined,
  UploadOutlined,
  DownOutlined,
  FilterOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";

const loading = ref(false);
const creditmemos = ref([]);
const bulkAction = ref(undefined);
const selectedRowKeys = ref([]);
const showFilters = ref(true);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const filters = reactive({
  created_at_from: null,
  created_at_to: null,
  order_date_from: null,
  order_date_to: null,
  refunded_from: "",
  refunded_to: "",
  creditmemo_increment_id: "",
  order_increment_id: "",
  bill_to_name: "",
  status: undefined,
});

const columns = [
  {
    title: "Credit Memo",
    dataIndex: "creditmemo_increment_id",
    key: "creditmemo_increment_id",
    sorter: true,
  },
  {
    title: "Created",
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: "Order #",
    dataIndex: "order_increment_id",
    key: "order_increment_id",
  },
  {
    title: "Order Date",
    dataIndex: "order_created_at",
    key: "order_created_at",
  },
  {
    title: "Bill-to Name",
    dataIndex: "bill_to_name",
    key: "bill_to_name",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Refunded",
    dataIndex: "refunded",
    key: "refunded",
  },
  {
    title: "Action",
    key: "action",
  },
];

const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  },
};

const formatDate = (date) => {
  return dayjs(date).format("MMM D, YYYY h:mm:ss A");
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const fetchCreditMemos = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });

    if (filters.created_at_from)
      params.append(
        "created_at_from",
        filters.created_at_from.format("YYYY-MM-DD")
      );
    if (filters.created_at_to)
      params.append(
        "created_at_to",
        filters.created_at_to.format("YYYY-MM-DD")
      );
    if (filters.order_date_from)
      params.append(
        "order_date_from",
        filters.order_date_from.format("YYYY-MM-DD")
      );
    if (filters.order_date_to)
      params.append(
        "order_date_to",
        filters.order_date_to.format("YYYY-MM-DD")
      );
    if (filters.refunded_from)
      params.append("refunded_from", filters.refunded_from);
    if (filters.refunded_to) params.append("refunded_to", filters.refunded_to);
    if (filters.creditmemo_increment_id)
      params.append("creditmemo_increment_id", filters.creditmemo_increment_id);
    if (filters.order_increment_id)
      params.append("order_increment_id", filters.order_increment_id);
    if (filters.bill_to_name)
      params.append("bill_to_name", filters.bill_to_name);
    if (filters.status) params.append("status", filters.status);

    const response = await fetch(
      `/api/sales/credit-memos?${params}`
    );
    const data = await response.json();

    creditmemos.value = data.items || [];
    pagination.total = data.total || 0;
  } catch (error) {
    console.error("Failed to fetch credit memos:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchCreditMemos();
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const applyFilters = () => {
  pagination.current = 1;
  fetchCreditMemos();
};

const resetFilters = () => {
  filters.created_at_from = null;
  filters.created_at_to = null;
  filters.order_date_from = null;
  filters.order_date_to = null;
  filters.refunded_from = "";
  filters.refunded_to = "";
  filters.creditmemo_increment_id = "";
  filters.order_increment_id = "";
  filters.bill_to_name = "";
  filters.status = undefined;
  showFilters.value = false;
  fetchCreditMemos();
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchCreditMemos();
};

const handlePageSizeChange = () => {
  pagination.current = 1;
  fetchCreditMemos();
};

const handleView = (record) => {
  console.log("View credit memo:", record);
};

onMounted(() => {
  fetchCreditMemos();
});
</script>

<style scoped>
.sales-credit-memos {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 300;
  margin: 0;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  background-color: #f5f5f5;
  padding: 10px;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.records-count {
  color: #303030;
}

.per-page-text {
  color: #303030;
}

.table-card {
  border: 1px solid #e3e3e3;
}

.table-card :deep(.ant-table-thead > tr > th) {
  background: #514943;
  color: white;
  font-weight: 600;
}

.filters-section {
  background: #f5f5f5;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e3e3e3;
}

.date-range,
.range-input {
  display: flex;
  flex-direction: column;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
