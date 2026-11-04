<template>
  <div class="content-widgets">
    <div class="page-header">
      <h1 class="page-title">Widgets</h1>
      <a-button type="primary" class="add-button">Add Widget</a-button>
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
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="Widget Title">
              <a-input v-model:value="filters.title" />
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
        row-key="instance_id"
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
  title: "",
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  { title: "ID", dataIndex: "instance_id", key: "instance_id", sorter: true },
  { title: "Widget Title", dataIndex: "title", key: "title", sorter: true },
  {
    title: "Theme",
    dataIndex: "theme_title",
    key: "theme_title",
    sorter: true,
  },
  {
    title: "Sort Order",
    dataIndex: "sort_order",
    key: "sort_order",
    sorter: true,
  },
  { title: "Action", key: "action" },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    };
    const response = await axios.get(
      "/api/content/widgets",
      {
        params,
      }
    );
    data.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    console.error("Error fetching widgets:", error);
  } finally {
    loading.value = false;
  }
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const applyFilters = () => {
  pagination.current = 1;
  fetchData();
};

const resetFilters = () => {
  filters.title = "";
  applyFilters();
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

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.content-widgets {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.actions-bar {
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
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
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
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
