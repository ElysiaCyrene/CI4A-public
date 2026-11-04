<template>
  <div class="customer-groups">
    <div class="page-header">
      <h1 class="page-title">Customer Groups</h1>
      <a-button type="primary" class="add-button"
        >Add New Customer Group</a-button
      >
    </div>

    <!-- Search and Actions Bar -->
    <div class="actions-bar">
      <div class="search-container">
        <!-- Empty search container to maintain layout if needed, or remove -->
      </div>
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
          <a-col :span="8">
            <a-form-item label="ID">
              <div class="range-input">
                <a-input
                  v-model:value="filters.customer_group_id_from"
                  placeholder="from"
                />
                <a-input
                  v-model:value="filters.customer_group_id_to"
                  placeholder="to"
                  style="margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Group">
              <a-input v-model:value="filters.customer_group_code" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Tax Class">
              <a-input
                v-model:value="filters.tax_class_id"
                placeholder="Tax Class ID"
              />
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
        row-key="customer_group_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a href="#">Edit</a>
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
  customer_group_id_from: "",
  customer_group_id_to: "",
  customer_group_code: "",
  tax_class_id: "",
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  {
    title: "ID",
    dataIndex: "customer_group_id",
    key: "customer_group_id",
    sorter: true,
  },
  {
    title: "Group",
    dataIndex: "customer_group_code",
    key: "customer_group_code",
    sorter: true,
  },
  {
    title: "Tax Class",
    dataIndex: "tax_class_id",
    key: "tax_class_id",
    sorter: true,
  },
  { title: "Action", key: "action" },
];

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const resetFilters = () => {
  filters.customer_group_id_from = "";
  filters.customer_group_id_to = "";
  filters.customer_group_code = "";
  filters.tax_class_id = "";
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

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    };

    const response = await axios.get(
      "/api/customer-groups",
      { params }
    );
    data.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    console.error("Error fetching customer groups:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.customer-groups {
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

.add-button {
  background-color: #eb5202;
  border-color: #eb5202;
}

.add-button:hover {
  background-color: #d44902;
  border-color: #d44902;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.filters-section {
  background: #fff;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #d9d9d9;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.data-table {
  background: #fff;
  padding: 16px;
  border: 1px solid #d9d9d9;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.range-input {
  display: flex;
  flex-direction: column;
}
</style>
