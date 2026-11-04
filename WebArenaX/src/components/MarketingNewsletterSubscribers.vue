<template>
  <div class="marketing-newsletter-subscribers">
    <div class="page-header">
      <h1 class="page-title">Newsletter Subscribers</h1>
    </div>

    <!-- Actions Bar -->
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
      </div>
    </div>

    <!-- Filters Section -->
    <div v-if="showFilters" class="filters-section">
      <a-form layout="vertical" :model="filters" @finish="applyFilters">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="ID">
              <div class="range-input">
                <a-input
                  v-model:value="filters.subscriber_id_from"
                  placeholder="from"
                />
                <a-input
                  v-model:value="filters.subscriber_id_to"
                  placeholder="to"
                  style="margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Email">
              <a-input v-model:value="filters.subscriber_email" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Status">
              <a-select v-model:value="filters.subscriber_status" allow-clear>
                <a-select-option value="Subscribed">Subscribed</a-select-option>
                <a-select-option value="Not Activated"
                  >Not Activated</a-select-option
                >
                <a-select-option value="Unsubscribed"
                  >Unsubscribed</a-select-option
                >
                <a-select-option value="Unconfirmed"
                  >Unconfirmed</a-select-option
                >
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

    <!-- Data Table -->
    <div class="data-table">
      <div class="table-header">
        <span>{{ pagination.total }} records found</span>
        <div class="pagination-controls">
          <a-select
            v-model:value="pagination.pageSize"
            style="width: 80px"
            @change="handlePageSizeChange"
          >
            <a-select-option :value="20">20</a-select-option>
            <a-select-option :value="50">50</a-select-option>
            <a-select-option :value="100">100</a-select-option>
            <a-select-option :value="200">200</a-select-option>
          </a-select>
          <span style="margin-left: 8px">per page</span>
          <a-pagination
            v-model:current="pagination.current"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            show-less-items
            @change="handlePageChange"
            style="display: inline-block; margin-left: 16px"
          />
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :loading="loading"
        row-key="subscriber_id"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'subscriber_status'">
            <a-tag :color="getStatusColor(record.subscriber_status)">
              {{ getStatusLabel(record.subscriber_status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'type'">
            {{ record.customer_id ? "Customer" : "Guest" }}
          </template>
          <template v-if="column.key === 'action'">
            <a href="#">Unsubscribe</a>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  FilterOutlined,
  EyeOutlined,
  SettingOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";
import axios from "axios";

const showFilters = ref(true);
const loading = ref(false);
const data = ref([]);

const filters = reactive({
  subscriber_id_from: "",
  subscriber_id_to: "",
  subscriber_email: "",
  subscriber_status: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  {
    title: "ID",
    dataIndex: "subscriber_id",
    key: "subscriber_id",
    sorter: true,
    width: 80,
  },
  {
    title: "Email",
    dataIndex: "subscriber_email",
    key: "subscriber_email",
    sorter: true,
  },
  { title: "Type", key: "type" },
  {
    title: "Customer Name",
    dataIndex: "customer_name",
    key: "customer_name",
    sorter: true,
  },
  {
    title: "Status",
    dataIndex: "subscriber_status",
    key: "subscriber_status",
    sorter: true,
  },
  { title: "Store", dataIndex: "store_id", key: "store_id" }, // Placeholder
  { title: "Store View", key: "store_view" }, // Placeholder
  { title: "Action", key: "action" },
];

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const resetFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = undefined;
  });
  filters.subscriber_id_from = "";
  filters.subscriber_id_to = "";
  filters.subscriber_email = "";
  fetchData();
};

const applyFilters = () => {
  pagination.current = 1;
  fetchData();
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchData();
};

const handlePageSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.current = 1;
  fetchData();
};

const getStatusLabel = (status) => {
  switch (status) {
    case 1:
      return "Subscribed";
    case 2:
      return "Not Activated";
    case 3:
      return "Unsubscribed";
    case 4:
      return "Unconfirmed";
    default:
      return "Unknown";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 1:
      return "green";
    case 3:
      return "red";
    default:
      return "default";
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const statusMap = {
      Subscribed: 1,
      "Not Activated": 2,
      Unsubscribed: 3,
      Unconfirmed: 4,
    };

    const statusParam =
      filters.subscriber_status &&
      statusMap[filters.subscriber_status] !== undefined
        ? statusMap[filters.subscriber_status]
        : undefined;

    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      subscriber_id: filters.subscriber_id_from, // Simplified
      subscriber_email: filters.subscriber_email,
    };

    if (statusParam !== undefined) params.subscriber_status = statusParam;

    const response = await axios.get("/api/marketing/newsletter-subscribers", {
      params,
    });
    data.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.marketing-newsletter-subscribers {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.actions-bar {
  background: #fff;
  padding: 12px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.filters-section {
  background: #fff;
  padding: 24px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 16px;
}

.range-input {
  display: flex;
  flex-direction: column;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.data-table {
  background: #fff;
  padding: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pagination-controls {
  display: flex;
  align-items: center;
}
</style>
