<template>
  <div class="content-themes">
    <div class="page-header">
      <h1 class="page-title">Themes</h1>
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
            <a-form-item label="Theme Title">
              <a-input v-model:value="filters.theme_title" />
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
        row-key="theme_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a @click.prevent="handleView(record)">View</a>
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

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["navigate"]);

const showFilters = ref(true);
const loading = ref(false);
const data = ref([]);

const filters = reactive({
  theme_title: "",
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  { title: "ID", dataIndex: "theme_id", key: "theme_id", sorter: true },
  {
    title: "Theme Title",
    dataIndex: "theme_title",
    key: "theme_title",
    sorter: true,
  },
  {
    title: "Theme Path",
    dataIndex: "theme_path",
    key: "theme_path",
    sorter: true,
  },
  {
    title: "Parent ID",
    dataIndex: "parent_id",
    key: "parent_id",
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
      "/api/content/themes",
      {
        params,
      }
    );
    data.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    console.error("Error fetching themes:", error);
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
  filters.theme_title = "";
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

const handleView = (record) => {
  emit("navigate", "content_theme_view", {
    id: record.theme_id,
    savedState: {
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
    },
  });
};

onMounted(() => {
  if (props.initialFilters) {
    const { page, pageSize, ...rest } = props.initialFilters;
    Object.assign(filters, rest);
    if (page) pagination.current = page;
    if (pageSize) pagination.pageSize = pageSize;
  }
  fetchData();
});
</script>

<style scoped>
.content-themes {
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
