<template>
  <div class="sales-orders">
    <div class="page-header">
      <h1 class="page-title">Orders</h1>
      <a-button
        type="primary"
        style="background: #eb5202; border-color: #eb5202"
      >
        Create New Order
      </a-button>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="actions-bar">
      <div class="toolbar">
        <a-button @click="toggleFilters">Filters <filter-outlined /></a-button>
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

    <!-- 筛选表单 -->
    <div v-if="showFilters" class="filters-container">
      <a-form layout="vertical" :model="filters" @finish="handleApplyFilters">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Purchase Date">
              <div style="display: flex; gap: 8px">
                <a-date-picker
                  v-model:value="filters.purchase_date_from"
                  placeholder="From"
                  format="MM-DD-YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <a-date-picker
                  v-model:value="filters.purchase_date_to"
                  placeholder="To"
                  format="MM-DD-YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Grand Total (Base)">
              <div style="display: flex; gap: 8px">
                <a-input
                  v-model:value="filters.base_grand_total_from"
                  placeholder="From"
                />
                <a-input
                  v-model:value="filters.base_grand_total_to"
                  placeholder="To"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Grand Total (Purchased)">
              <div style="display: flex; gap: 8px">
                <a-input
                  v-model:value="filters.grand_total_from"
                  placeholder="From"
                />
                <a-input
                  v-model:value="filters.grand_total_to"
                  placeholder="To"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Purchase Point">
              <a-select
                v-model:value="filters.purchase_point"
                placeholder="Select Purchase Point"
                allow-clear
              >
                <a-select-option value="Main Website"
                  >Main Website</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="ID">
              <a-input v-model:value="filters.increment_id" placeholder="ID" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Bill-to Name">
              <a-input
                v-model:value="filters.bill_to_name"
                placeholder="Bill-to Name"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Ship-to Name">
              <a-input
                v-model:value="filters.ship_to_name"
                placeholder="Ship-to Name"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Status">
              <a-select
                v-model:value="filters.status"
                placeholder="Select Status"
                allow-clear
              >
                <a-select-option value="canceled">Canceled</a-select-option>
                <a-select-option value="closed">Closed</a-select-option>
                <a-select-option value="complete">Complete</a-select-option>
                <a-select-option value="fraud">Suspected Fraud</a-select-option>
                <a-select-option value="holded">On Hold</a-select-option>
                <a-select-option value="payment_review"
                  >Payment Review</a-select-option
                >
                <a-select-option value="paypal_canceled_reversal"
                  >PayPal Canceled Reversal</a-select-option
                >
                <a-select-option value="paypal_reversed"
                  >PayPal Reversed</a-select-option
                >
                <a-select-option value="pending">Pending</a-select-option>
                <a-select-option value="pending_payment"
                  >Pending Payment</a-select-option
                >
                <a-select-option value="pending_paypal"
                  >Pending PayPal</a-select-option
                >
                <a-select-option value="processing">Processing</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Braintree Transaction Source">
              <a-input
                v-model:value="filters.braintree_transaction_source"
                placeholder="Source"
              />
            </a-form-item>
          </a-col>
          <a-col :span="18" style="text-align: right; margin-top: 29px">
            <a-space>
              <a-button @click="handleResetFilters">Cancel</a-button>
              <a-button type="primary" @click="handleApplyFilters"
                >Apply Filters</a-button
              >
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-controls">
      <div class="left-controls">
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
          </a-select>

          <a-select
            v-if="bulkAction === 'update_status'"
            v-model:value="targetStatus"
            style="width: 150px"
            placeholder="Select Status"
          >
            <a-select-option value="canceled">Canceled</a-select-option>
            <a-select-option value="closed">Closed</a-select-option>
            <a-select-option value="complete">Complete</a-select-option>
            <a-select-option value="fraud">Suspected Fraud</a-select-option>
            <a-select-option value="holded">On Hold</a-select-option>
            <a-select-option value="payment_review"
              >Payment Review</a-select-option
            >
            <a-select-option value="pending">Pending</a-select-option>
            <a-select-option value="processing">Processing</a-select-option>
          </a-select>

          <a-button @click="handleBulkSubmit">Submit</a-button>
        </div>
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
          <a-select-option :value="200">200</a-select-option>
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
        :data-source="orders"
        :loading="loading"
        :pagination="false"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :row-key="(record) => record.entity_id"
        size="middle"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'purchase_date'">
            {{ formatDate(record.purchase_date) }}
          </template>
          <template v-else-if="column.key === 'base_grand_total'">
            {{ formatCurrency(record.base_grand_total) }}
          </template>
          <template v-else-if="column.key === 'grand_total'">
            {{ formatCurrency(record.grand_total) }}
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
import { ref, reactive, onMounted, computed, watch } from "vue";
import {
  EyeOutlined,
  SettingOutlined,
  UploadOutlined,
  DownOutlined,
  FilterOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

const loading = ref(false);
const orders = ref([]);
const bulkAction = ref(undefined);
const targetStatus = ref(undefined);
const selectedRowKeys = ref([]);
const showFilters = ref(true);

const filters = reactive({
  purchase_date_from: null,
  purchase_date_to: null,
  base_grand_total_from: null,
  base_grand_total_to: null,
  grand_total_from: null,
  grand_total_to: null,
  purchase_point: null,
  increment_id: null,
  bill_to_name: null,
  ship_to_name: null,
  status: null,
  braintree_transaction_source: null,
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const sortState = reactive({
  field: null,
  order: null,
});

const allColumns = [
  {
    title: "ID",
    dataIndex: "increment_id",
    key: "increment_id",
    width: 100,
    sorter: true,
  },
  {
    title: "Purchase Point",
    dataIndex: "purchase_point",
    key: "purchase_point",
    width: 150,
    sorter: true,
  },
  {
    title: "Purchase Date",
    dataIndex: "purchase_date",
    key: "purchase_date",
    width: 180,
    sorter: true,
  },
  {
    title: "Bill-to Name",
    dataIndex: "bill_to_name",
    key: "bill_to_name",
    sorter: true,
  },
  {
    title: "Ship-to Name",
    dataIndex: "ship_to_name",
    key: "ship_to_name",
    sorter: true,
  },
  {
    title: "Grand Total (Base)",
    dataIndex: "base_grand_total",
    key: "base_grand_total",
    align: "right",
    width: 120,
    sorter: true,
  },
  {
    title: "Grand Total (Purchased)",
    dataIndex: "grand_total",
    key: "grand_total",
    align: "right",
    width: 120,
    sorter: true,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 100,
    sorter: true,
  },
  {
    title: "Items",
    dataIndex: "total_item_count",
    key: "total_item_count",
    width: 80,
    align: "center",
    sorter: true,
  },
  {
    title: "Action",
    key: "action",
    width: 80,
  },
];

const visibleColumnKeys = ref(allColumns.map((c) => c.key));

const columns = computed(() => {
  return allColumns.filter((c) => visibleColumnKeys.value.includes(c.key));
});

const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  },
};

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
        handleView(record);
      }
    },
    style: {
      cursor: "pointer",
    },
  };
};

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
    orders.value = orders.value.filter(
      (item) => !selectedRowKeys.value.includes(item.entity_id)
    );
    selectedRowKeys.value = [];
    message.success("Records deleted (mock).");
  } else if (bulkAction.value === "update_status") {
    if (!targetStatus.value) {
      message.warning("Please select a status");
      return;
    }
    orders.value = orders.value.map((item) => {
      if (selectedRowKeys.value.includes(item.entity_id)) {
        return { ...item, status: targetStatus.value };
      }
      return item;
    });
    selectedRowKeys.value = [];
    targetStatus.value = undefined;
    bulkAction.value = undefined;
    message.success("Status updated (mock).");
  }
};

watch(bulkAction, (val) => {
  if (val !== "update_status") {
    targetStatus.value = undefined;
  }
});

const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("MMM D, YYYY h:mm:ss A");
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "";
  return `$${parseFloat(value).toFixed(2)}`;
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });

    if (filters.purchase_date_from)
      params.append("purchase_date_from", filters.purchase_date_from);
    if (filters.purchase_date_to)
      params.append("purchase_date_to", filters.purchase_date_to);
    if (filters.base_grand_total_from)
      params.append("base_grand_total_from", filters.base_grand_total_from);
    if (filters.base_grand_total_to)
      params.append("base_grand_total_to", filters.base_grand_total_to);
    if (filters.grand_total_from)
      params.append("grand_total_from", filters.grand_total_from);
    if (filters.grand_total_to)
      params.append("grand_total_to", filters.grand_total_to);
    if (filters.purchase_point)
      params.append("purchase_point", filters.purchase_point);
    if (filters.increment_id)
      params.append("increment_id", filters.increment_id);
    if (filters.bill_to_name)
      params.append("bill_to_name", filters.bill_to_name);
    if (filters.ship_to_name)
      params.append("ship_to_name", filters.ship_to_name);
    if (filters.status) params.append("status", filters.status);
    if (filters.braintree_transaction_source)
      params.append(
        "braintree_transaction_source",
        filters.braintree_transaction_source
      );

    if (sortState.field && sortState.order) {
      params.append("sortField", sortState.field);
      params.append("sortOrder", sortState.order);
    }

    const response = await fetch(
      `/api/sales/orders?${params}`
    );
    const data = await response.json();

    orders.value = data.items || [];
    pagination.total = data.total || 0;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  } finally {
    loading.value = false;
  }
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const handleApplyFilters = () => {
  pagination.current = 1;
  fetchOrders();
};

const handleResetFilters = () => {
  Object.keys(filters).forEach((key) => (filters[key] = null));
  pagination.current = 1;
  fetchOrders();
  showFilters.value = false;
};

const handleSearch = () => {
  pagination.current = 1;
  fetchOrders();
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchOrders();
};

const handlePageSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.current = 1;
  fetchOrders();
};

const handleTableChange = (pag, filters, sorter) => {
  if (sorter.field) {
    sortState.field = sorter.field;
    sortState.order = sorter.order;
  } else {
    sortState.field = null;
    sortState.order = null;
  }
  fetchOrders();
};

const getRowValue = (record, col) => {
  let val;
  val = record[col.dataIndex];

  if (col.key === "purchase_date") {
    val = formatDate(val);
  } else if (col.key === "base_grand_total" || col.key === "grand_total") {
    val = formatCurrency(val);
  }

  return val;
};

const downloadCSV = (data) => {
  const cols = columns.value.filter((c) => c.key !== "action");
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
  link.download = "orders.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const downloadExcelXML = (data) => {
  const cols = columns.value.filter((c) => c.key !== "action");
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
  link.download = "orders.xml";
  link.click();
  URL.revokeObjectURL(url);
};

const handleExport = async (format) => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: 1,
      pageSize: pagination.total > 0 ? pagination.total : 100000,
    });

    if (filters.purchase_date_from)
      params.append("purchase_date_from", filters.purchase_date_from);
    if (filters.purchase_date_to)
      params.append("purchase_date_to", filters.purchase_date_to);
    if (filters.base_grand_total_from)
      params.append("base_grand_total_from", filters.base_grand_total_from);
    if (filters.base_grand_total_to)
      params.append("base_grand_total_to", filters.base_grand_total_to);
    if (filters.grand_total_from)
      params.append("grand_total_from", filters.grand_total_from);
    if (filters.grand_total_to)
      params.append("grand_total_to", filters.grand_total_to);
    if (filters.purchase_point)
      params.append("purchase_point", filters.purchase_point);
    if (filters.increment_id)
      params.append("increment_id", filters.increment_id);
    if (filters.bill_to_name)
      params.append("bill_to_name", filters.bill_to_name);
    if (filters.ship_to_name)
      params.append("ship_to_name", filters.ship_to_name);
    if (filters.status) params.append("status", filters.status);
    if (filters.braintree_transaction_source)
      params.append(
        "braintree_transaction_source",
        filters.braintree_transaction_source
      );

    if (sortState.field && sortState.order) {
      params.append("sortField", sortState.field);
      params.append("sortOrder", sortState.order);
    }

    const response = await fetch(
      `/api/sales/orders?${params}`
    );
    const data = await response.json();
    const exportData = data.items || [];

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

const emit = defineEmits(["navigate"]);

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const handleView = (record) => {
  emit("navigate", "sales_order_view", {
    id: record.entity_id,
    savedState: {
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sortState.field,
      sortOrder: sortState.order,
    },
  });
};

onMounted(() => {
  if (props.initialFilters) {
    const { page, pageSize, sortField, sortOrder, ...rest } =
      props.initialFilters;
    Object.assign(filters, rest);
    if (page) pagination.current = page;
    if (pageSize) pagination.pageSize = pageSize;
    if (sortField) sortState.field = sortField;
    if (sortOrder) sortState.order = sortOrder;
  }
  fetchOrders();
});
</script>

<style scoped>
.sales-orders {
  padding-bottom: 24px;
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
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: #f5f5f5;
  padding: 12px;
  border: 1px solid #e3e3e3;
}

.filters-container {
  background: #f5f5f5;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e3e3e3;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
  color: #666;
}

.per-page-text {
  color: #666;
}

.table-card {
  border: 1px solid #e3e3e3;
}
</style>
