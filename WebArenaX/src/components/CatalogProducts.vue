<template>
  <div class="catalog-products">
    <div class="page-header">
      <h1 class="page-title">Products</h1>
      <a-button type="primary" class="add-button" @click="handleAddProduct"
        >Add Product</a-button
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
          <a-button> <setting-outlined /> Columns <down-outlined /> </a-button>
        </a-popover>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="handleExport('csv')">CSV</a-menu-item>
              <a-menu-item @click="handleExport('xml')">Excel XML</a-menu-item>
            </a-menu>
          </template>
          <a-button> <upload-outlined /> Export <down-outlined /> </a-button>
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
                <a-input v-model:value="filters.id_from" placeholder="from" />
                <a-input
                  v-model:value="filters.id_to"
                  placeholder="to"
                  style="margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Price">
              <div class="range-input">
                <a-input
                  v-model:value="filters.price_from"
                  placeholder="from"
                />
                <a-input
                  v-model:value="filters.price_to"
                  placeholder="to"
                  style="margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Quantity">
              <div class="range-input">
                <a-input v-model:value="filters.qty_from" placeholder="from" />
                <a-input
                  v-model:value="filters.qty_to"
                  placeholder="to"
                  style="margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Last Updated At">
              <div class="date-range">
                <a-date-picker
                  v-model:value="filters.updated_at_from"
                  placeholder="from"
                  format="MM/DD/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <a-date-picker
                  v-model:value="filters.updated_at_to"
                  placeholder="to"
                  format="MM/DD/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%; margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Name">
              <a-input v-model:value="filters.name" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Type">
              <a-select v-model:value="filters.type_id" allow-clear>
                <a-select-option value="simple">Simple Product</a-select-option>
                <a-select-option value="configurable"
                  >Configurable Product</a-select-option
                >
                <a-select-option value="virtual"
                  >Virtual Product</a-select-option
                >
                <a-select-option value="bundle">Bundle Product</a-select-option>
                <a-select-option value="downloadable"
                  >Downloadable Product</a-select-option
                >
                <a-select-option value="grouped"
                  >Grouped Product</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="SKU">
              <a-input v-model:value="filters.sku" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Visibility">
              <a-select v-model:value="filters.visibility" allow-clear>
                <a-select-option value="Not Visible Individually"
                  >Not Visible Individually</a-select-option
                >
                <a-select-option value="Catalog">Catalog</a-select-option>
                <a-select-option value="Search">Search</a-select-option>
                <a-select-option value="Catalog, Search"
                  >Catalog, Search</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Status">
              <a-select v-model:value="filters.status" allow-clear>
                <a-select-option value="Enabled">Enabled</a-select-option>
                <a-select-option value="Disabled">Disabled</a-select-option>
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
        <div
          class="bulk-actions"
          style="display: flex; gap: 8px; align-items: center"
        >
          <a-select
            v-model:value="bulkAction"
            style="width: 200px"
            placeholder="Actions"
          >
            <a-select-option value="delete">Delete</a-select-option>
            <a-select-option value="update_status"
              >Update Status</a-select-option
            >
            <a-select-option value="update_price">Update Price</a-select-option>
            <a-select-option value="update_quantity"
              >Update Quantity</a-select-option
            >
          </a-select>

          <a-select
            v-if="bulkAction === 'update_status'"
            v-model:value="targetStatus"
            style="width: 150px"
            placeholder="Select Status"
          >
            <a-select-option value="Enabled">Enabled</a-select-option>
            <a-select-option value="Disabled">Disabled</a-select-option>
          </a-select>

          <a-input-number
            v-if="bulkAction === 'update_price'"
            v-model:value="targetPrice"
            style="width: 150px"
            placeholder="Enter Price"
            :min="0"
          />

          <a-input-number
            v-if="bulkAction === 'update_quantity'"
            v-model:value="targetQuantity"
            style="width: 150px"
            placeholder="Enter Quantity"
            :min="0"
          />

          <a-button @click="handleBulkSubmit">Submit</a-button>
        </div>

        <div style="flex: 1; text-align: right; margin-right: 16px">
          <span>{{ pagination.total }} records found</span>
        </div>

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
        :row-selection="rowSelection"
        :custom-row="customRow"
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :loading="loading"
        row-key="entity_id"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'thumbnail'">
            <div class="thumbnail-placeholder">
              <img
                v-if="record.thumbnail && record.thumbnail !== 'no_selection'"
                :src="`/media/catalog/product${record.thumbnail}`"
                alt="Thumbnail"
                style="max-width: 50px; max-height: 50px"
              />
              <div v-else class="no-image"></div>
            </div>
          </template>
          <template v-if="column.key === 'price'">
            {{ formatCurrency(record.price) }}
          </template>
          <template v-if="column.key === 'quantity'">
            {{ formatNumber(record.quantity) }}
          </template>
          <template v-if="column.key === 'visibility'">
            {{ getVisibilityLabel(record.visibility) }}
          </template>
          <template v-if="column.key === 'status'">
            {{ getStatusLabel(record.status) }}
          </template>
          <template v-if="column.key === 'updated_at'">
            {{ formatDate(record.updated_at) }}
          </template>
          <template v-if="column.key === 'action'">
            <a href="#" @click.prevent="editProduct(record)">Edit</a>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import {
  FilterOutlined,
  EyeOutlined,
  SettingOutlined,
  DownOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import axios from "axios";
import dayjs from "dayjs";

const emit = defineEmits(["navigate"]);

const handleAddProduct = () => {
  emit("navigate", "catalog_product_add");
};

const showFilters = ref(true);
const loading = ref(false);
const data = ref([]);
const selectedRowKeys = ref([]);
const bulkAction = ref(undefined);
const targetStatus = ref(undefined);
const targetPrice = ref(undefined);
const targetQuantity = ref(undefined);

const onSelectChange = (keys) => {
  console.log("selectedRowKeys changed: ", keys);
  selectedRowKeys.value = keys;
};

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: onSelectChange,
}));

const customRow = (record) => {
  return {
    onClick: (event) => {
      // Prevent navigation when clicking on checkbox or action links
      const isCheckbox =
        event.target.closest(".ant-checkbox-wrapper") ||
        event.target.type === "checkbox";
      const isAction =
        event.target.closest("a") || event.target.tagName === "A";

      if (!isCheckbox && !isAction) {
        editProduct(record);
      }
    },
    style: {
      cursor: "pointer",
    },
  };
};

const filters = reactive({
  id_from: "",
  id_to: "",
  price_from: "",
  price_to: "",
  qty_from: "",
  qty_to: "",
  name: "",
  sku: "",
  status: undefined,
  visibility: undefined,
  type_id: undefined,
  updated_at_from: null,
  updated_at_to: null,
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const allColumns = [
  {
    title: "ID",
    dataIndex: "entity_id",
    key: "entity_id",
    sorter: true,
    width: 80,
  },
  { title: "Thumbnail", key: "thumbnail", width: 100 },
  { title: "Name", dataIndex: "name", key: "name", sorter: true },
  { title: "Type", dataIndex: "type_id", key: "type_id", sorter: true },
  {
    title: "Attribute Set",
    dataIndex: "attribute_set_name",
    key: "attribute_set_name",
    sorter: true,
  },
  { title: "SKU", dataIndex: "sku", key: "sku", sorter: true },
  { title: "Price", dataIndex: "price", key: "price", sorter: true },
  { title: "Quantity", dataIndex: "quantity", key: "quantity", sorter: true },
  {
    title: "Visibility",
    dataIndex: "visibility",
    key: "visibility",
    sorter: true,
  },
  { title: "Status", dataIndex: "status", key: "status", sorter: true },
  { title: "Websites", key: "websites" }, // Placeholder
  {
    title: "Last Updated At",
    dataIndex: "updated_at",
    key: "updated_at",
    sorter: true,
  },
  { title: "Action", key: "action" },
];

const visibleColumnKeys = ref(allColumns.map((c) => c.key));

const columns = computed(() => {
  return allColumns.filter((c) => visibleColumnKeys.value.includes(c.key));
});

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const handleBulkSubmit = () => {
  if (!bulkAction.value) {
    message.warning("Please select an action");
    return;
  }
  if (selectedRowKeys.value.length === 0) {
    message.warning("Please select items");
    return;
  }

  if (bulkAction.value === "delete") {
    // Update the local list immediately
    data.value = data.value.filter(
      (item) => !selectedRowKeys.value.includes(item.entity_id)
    );
    selectedRowKeys.value = [];
    message.success("Records deleted (mock).");
  } else if (bulkAction.value === "update_status") {
    if (!targetStatus.value) {
      message.warning("Please select a status");
      return;
    }
    const statusMap = { Enabled: 1, Disabled: 2 };
    const newStatusId = statusMap[targetStatus.value] || targetStatus.value;

    data.value = data.value.map((item) => {
      if (selectedRowKeys.value.includes(item.entity_id)) {
        return { ...item, status: newStatusId };
      }
      return item;
    });
    selectedRowKeys.value = [];
    targetStatus.value = undefined;
    bulkAction.value = undefined;
    message.success("Status updated (mock).");
  } else if (bulkAction.value === "update_price") {
    if (targetPrice.value === undefined || targetPrice.value === null) {
      message.warning("Please enter a price");
      return;
    }
    data.value = data.value.map((item) => {
      if (selectedRowKeys.value.includes(item.entity_id)) {
        return { ...item, price: targetPrice.value };
      }
      return item;
    });
    selectedRowKeys.value = [];
    targetPrice.value = undefined;
    bulkAction.value = undefined;
    message.success("Price updated (mock).");
  } else if (bulkAction.value === "update_quantity") {
    if (targetQuantity.value === undefined || targetQuantity.value === null) {
      message.warning("Please enter a quantity");
      return;
    }
    data.value = data.value.map((item) => {
      if (selectedRowKeys.value.includes(item.entity_id)) {
        return { ...item, quantity: targetQuantity.value };
      }
      return item;
    });
    selectedRowKeys.value = [];
    targetQuantity.value = undefined;
    bulkAction.value = undefined;
    message.success("Quantity updated (mock).");
  }
};

const editProduct = (record) => {
  emit("navigate", "catalog_product_edit", {
    id: record.entity_id,
    savedState: {
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
    },
  });
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const resetFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = null;
  });
  filters.id_from = "";
  filters.id_to = "";
  filters.price_from = "";
  filters.price_to = "";
  filters.qty_from = "";
  filters.qty_to = "";
  filters.name = "";
  filters.sku = "";
  filters.status = undefined;
  filters.visibility = undefined;
  filters.type_id = undefined;
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

const formatDate = (dateString) => {
  if (!dateString) return "";
  return dayjs(dateString).format("MMM D, YYYY h:mm:ss A");
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return parseFloat(value).toFixed(4);
};

const getVisibilityLabel = (value) => {
  const map = {
    1: "Not Visible Individually",
    2: "Catalog",
    3: "Search",
    4: "Catalog, Search",
    "Not Visible Individually": "Not Visible Individually",
    Catalog: "Catalog",
    Search: "Search",
    "Catalog, Search": "Catalog, Search",
  };
  return map[value] || value;
};

const getStatusLabel = (value) => {
  const map = {
    1: "Enabled",
    2: "Disabled",
  };
  return map[value] || value;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    };

    if (filters.status) {
      const statusMap = { Enabled: 1, Disabled: 2 };
      params.status = statusMap[filters.status] || filters.status;
    }

    // If visibility filter is a human-readable label, map it to the numeric ID expected by the API
    if (filters.visibility) {
      const visibilityMap = {
        "Not Visible Individually": 1,
        Catalog: 2,
        Search: 3,
        "Catalog, Search": 4,
      };
      params.visibility =
        visibilityMap[filters.visibility] || filters.visibility;
    }

    if (filters.updated_at_from) {
      params.updated_at_from = dayjs(filters.updated_at_from).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }
    if (filters.updated_at_to) {
      params.updated_at_to = dayjs(filters.updated_at_to).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }

    const response = await axios.get(
      "/api/catalog/products",
      { params }
    );
    data.value = response.data.items;
    pagination.total = response.data.total;

    // Apply temporary updates if any
    const updates = [];
    if (props.initialFilters) {
      if (props.initialFilters.tempUpdates) {
        updates.push(...props.initialFilters.tempUpdates);
      } else if (props.initialFilters.tempUpdate) {
        updates.push(props.initialFilters.tempUpdate);
      }
    }

    if (updates.length > 0) {
      updates.forEach((temp) => {
        // Ensure numeric/string comparison works for IDs
        const index = data.value.findIndex(
          (p) => p.entity_id == temp.entity_id
        );

        if (index !== -1) {
          data.value[index] = {
            ...data.value[index],
            ...temp, // Spread all fields
          };
        } else {
          // It's a new item (Add Product case) or edited item from another page
          data.value.unshift(temp);
        }
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loading.value = false;
  }
};

const getRowValue = (record, col) => {
  let val = record[col.dataIndex];

  if (col.key === "price") {
    val = formatCurrency(val);
  } else if (col.key === "quantity") {
    val = formatNumber(val);
  } else if (col.key === "visibility") {
    val = getVisibilityLabel(val);
  } else if (col.key === "status") {
    val = getStatusLabel(val);
  } else if (col.key === "updated_at") {
    val = formatDate(val);
  }

  return val;
};

const downloadCSV = (data) => {
  const cols = columns.value.filter(
    (c) => c.key !== "action" && c.key !== "thumbnail"
  );
  const headers = cols.map((c) => c.title).join(",");

  const rows = data.map((record) => {
    return cols
      .map((col) => {
        const val = getRowValue(record, col);
        const safeVal =
          val === null || val === undefined
            ? ""
            : String(val).replace(/"/g, '""');
        return `"${safeVal}"`;
      })
      .join(",");
  });

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const downloadExcelXML = (data) => {
  const cols = columns.value.filter(
    (c) => c.key !== "action" && c.key !== "thumbnail"
  );
  let xml =
    '<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">\n<Worksheet ss:Name="Sheet1">\n<Table>\n';

  // Headers
  xml += "<Row>\n";
  cols.forEach((col) => {
    xml += `<Cell><Data ss:Type="String">${col.title}</Data></Cell>\n`;
  });
  xml += "</Row>\n";

  // Data
  data.forEach((record) => {
    xml += "<Row>\n";
    cols.forEach((col) => {
      let val = getRowValue(record, col);
      val = val === null || val === undefined ? "" : String(val);
      // Escape XML special chars
      val = val
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
      xml += `<Cell><Data ss:Type="String">${val}</Data></Cell>\n`;
    });
    xml += "</Row>\n";
  });

  xml += "</Table>\n</Worksheet>\n</Workbook>";

  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.xml";
  link.click();
  URL.revokeObjectURL(url);
};

const handleExport = async (format) => {
  loading.value = true;
  try {
    const params = {
      page: 1,
      pageSize: pagination.total > 0 ? pagination.total : 100000,
      ...filters,
    };

    if (filters.updated_at_from) {
      params.updated_at_from = dayjs(filters.updated_at_from).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }
    if (filters.updated_at_to) {
      params.updated_at_to = dayjs(filters.updated_at_to).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }

    const response = await axios.get(
      "/api/catalog/products",
      { params }
    );
    const exportData = response.data.items;

    if (format === "csv") {
      downloadCSV(exportData);
    } else if (format === "xml") {
      downloadExcelXML(exportData);
    }
  } catch (error) {
    console.error("Error exporting data:", error);
  } finally {
    loading.value = false;
  }
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
.catalog-products {
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

.date-range {
  display: flex;
  flex-direction: column;
}

.thumbnail-placeholder {
  width: 50px;
  height: 50px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image {
  width: 100%;
  height: 100%;
  background: #eee;
}
</style>
