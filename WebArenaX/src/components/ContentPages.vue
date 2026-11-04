<template>
  <div class="content-pages">
    <div class="page-header">
      <h1 class="page-title">Pages</h1>
      <a-button
        type="primary"
        class="add-button"
        @click="$emit('navigate', 'content_page_edit')"
        >Add New Page</a-button
      >
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
          <a-col :span="8">
            <a-form-item label="Title">
              <a-input v-model:value="filters.title" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="URL Key">
              <a-input v-model:value="filters.identifier" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Status">
              <a-select v-model:value="filters.is_active" allow-clear>
                <a-select-option :value="1">Enabled</a-select-option>
                <a-select-option :value="0">Disabled</a-select-option>
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
        row-key="page_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'is_active'">
            <a-tag :color="record.is_active ? 'green' : 'red'">
              {{ record.is_active ? "Enabled" : "Disabled" }}
            </a-tag>
          </template>
          <template v-if="column.key === 'creation_time'">
            {{ formatDate(record.creation_time) }}
          </template>
          <template v-if="column.key === 'update_time'">
            {{ formatDate(record.update_time) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">Edit</a>
              <a-divider type="vertical" />
              <a @click="handleDelete(record)" style="color: red">Delete</a>
              <a-divider type="vertical" />
              <a @click="handleView(record)">View</a>
            </a-space>
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
import dayjs from "dayjs";

const emit = defineEmits(["navigate"]);

const showFilters = ref(true);
const loading = ref(false);
const data = ref([]);

const filters = reactive({
  title: "",
  identifier: "",
  is_active: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  { title: "ID", dataIndex: "page_id", key: "page_id", sorter: true },
  { title: "Title", dataIndex: "title", key: "title", sorter: true },
  {
    title: "URL Key",
    dataIndex: "identifier",
    key: "identifier",
    sorter: true,
  },
  { title: "Status", dataIndex: "is_active", key: "is_active", sorter: true },
  {
    title: "Created",
    dataIndex: "creation_time",
    key: "creation_time",
    sorter: true,
  },
  {
    title: "Modified",
    dataIndex: "update_time",
    key: "update_time",
    sorter: true,
  },
  { title: "Action", key: "action", width: 200 },
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
      "/api/content/pages",
      {
        params,
      }
    );
    data.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    console.error("Error fetching pages:", error);
  } finally {
    loading.value = false;
  }
};

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const handleEdit = (record) => {
  emit("navigate", "content_page_edit", {
    id: record.page_id,
    savedState: {
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
    },
  });
};

const handleView = (record) => {
  emit("navigate", "content_page_view", {
    id: record.page_id,
    savedState: {
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
    },
  });
};

const handleDelete = (record) => {
  // Remove from local list as per requirement "不删数据库" (don't delete from DB)
  data.value = data.value.filter((item) => item.page_id !== record.page_id);
  pagination.total -= 1;
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
  filters.identifier = "";
  filters.is_active = undefined;
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

const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("MMM D, YYYY h:mm:ss A");
};

onMounted(() => {
  if (props.initialFilters) {
    const { page, pageSize, tempUpdate, ...rest } = props.initialFilters;
    Object.assign(filters, rest);
    if (page) pagination.current = page;
    if (pageSize) pagination.pageSize = pageSize;
    // Don't apply tempUpdate here, do it after fetchData
  }
  fetchData().then(() => {
    // Re-apply temp update after fetch if needed (in case fetch overwrites it)
    if (props.initialFilters && props.initialFilters.tempUpdate) {
      const tempUpdate = props.initialFilters.tempUpdate;
      const newPage = props.initialFilters.newPage;

      if (newPage) {
        data.value.unshift(tempUpdate);
      } else {
        const index = data.value.findIndex(
          (item) => item.page_id === tempUpdate.page_id
        );
        if (index !== -1) {
          data.value[index] = { ...data.value[index], ...tempUpdate };
        }
      }
    }
  });
});
</script>

<style scoped>
.content-pages {
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
