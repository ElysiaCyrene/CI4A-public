<template>
  <div class="sales-orders">
    <div class="page-header">
      <h1 class="page-title">Orders</h1>
      <el-button type="primary" style="background: #eb5202; border-color: #eb5202">Create New Order</el-button>
    </div>

    <!-- Toolbar -->
    <div class="actions-bar">
      <div class="toolbar">
        <el-button @click="toggleFilters"><el-icon><Filter /></el-icon> Filters</el-button>
        <el-dropdown>
          <el-button><el-icon><View /></el-icon> Default View <el-icon><ArrowDown /></el-icon></el-button>
          <template #dropdown><el-dropdown-menu><el-dropdown-item>Default View</el-dropdown-item></el-dropdown-menu></template>
        </el-dropdown>
        <el-popover trigger="click" placement="bottom-end" :width="220">
          <template #reference>
            <el-button><el-icon><Setting /></el-icon> Columns <el-icon><ArrowDown /></el-icon></el-button>
          </template>
          <el-checkbox-group v-model="visibleColumnKeys" style="display:flex;flex-direction:column">
            <el-checkbox v-for="c in allColumns" :key="c.key" :value="c.key" style="margin-bottom:8px">{{ c.title }}</el-checkbox>
          </el-checkbox-group>
        </el-popover>
        <el-dropdown @command="handleExport">
          <el-button><el-icon><Upload /></el-icon> Export <el-icon><ArrowDown /></el-icon></el-button>
          <template #dropdown><el-dropdown-menu>
            <el-dropdown-item command="csv">CSV</el-dropdown-item>
            <el-dropdown-item command="xml">Excel XML</el-dropdown-item>
          </el-dropdown-menu></template>
        </el-dropdown>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="filters-section">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="fl">Purchase Date</div>
          <div style="display:flex;gap:8px">
            <el-date-picker v-model="filters.purchase_date_from" type="date" placeholder="From" value-format="YYYY-MM-DD" size="small" style="width:100%" />
            <el-date-picker v-model="filters.purchase_date_to" type="date" placeholder="To" value-format="YYYY-MM-DD" size="small" style="width:100%" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="fl">Grand Total (Base)</div>
          <div style="display:flex;gap:8px"><el-input v-model="filters.base_grand_total_from" placeholder="From" size="small" /><el-input v-model="filters.base_grand_total_to" placeholder="To" size="small" /></div>
        </el-col>
        <el-col :span="6">
          <div class="fl">Grand Total (Purchased)</div>
          <div style="display:flex;gap:8px"><el-input v-model="filters.grand_total_from" placeholder="From" size="small" /><el-input v-model="filters.grand_total_to" placeholder="To" size="small" /></div>
        </el-col>
        <el-col :span="6">
          <div class="fl">Purchase Point</div>
          <el-select v-model="filters.purchase_point" clearable size="small" style="width:100%"><el-option label="Main Website" value="Main Website" /></el-select>
        </el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top:12px">
        <el-col :span="6">
          <div class="fl">ID</div><el-input v-model="filters.increment_id" placeholder="ID" size="small" />
        </el-col>
        <el-col :span="6">
          <div class="fl">Bill-to Name</div><el-input v-model="filters.bill_to_name" placeholder="Bill-to Name" size="small" />
        </el-col>
        <el-col :span="6">
          <div class="fl">Ship-to Name</div><el-input v-model="filters.ship_to_name" placeholder="Ship-to Name" size="small" />
        </el-col>
        <el-col :span="6">
          <div class="fl">Status</div>
          <el-select v-model="filters.status" clearable size="small" style="width:100%">
            <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-col>
      </el-row>
      <div class="filter-actions">
        <el-button @click="handleResetFilters">Cancel</el-button>
        <el-button type="primary" @click="handleApplyFilters">Apply Filters</el-button>
      </div>
    </div>

    <!-- Table Controls -->
    <div class="table-controls">
      <div class="bulk-actions">
        <el-select v-model="bulkAction" placeholder="Actions" style="width:200px" size="small">
          <el-option label="Delete" value="delete" /><el-option label="Update Status" value="update_status" />
        </el-select>
        <el-select v-if="bulkAction==='update_status'" v-model="targetStatus" placeholder="Select Status" style="width:150px;margin-left:8px" size="small">
          <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-button @click="handleBulkSubmit" size="small" style="margin-left:8px">Submit</el-button>
        <span class="records-count">{{ pagination.total }} records found</span>
      </div>
      <div class="right-controls">
        <el-select v-model="pagination.pageSize" style="width:80px" size="small" @change="handlePageSizeChange">
          <el-option :value="20" label="20" /><el-option :value="50" label="50" /><el-option :value="100" label="100" /><el-option :value="200" label="200" />
        </el-select>
        <span class="per-page">per page</span>
        <el-pagination v-model:current-page="pagination.current" :total="pagination.total" :page-size="pagination.pageSize" layout="prev,pager,next" small @current-change="handlePageChange" />
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <el-table :data="orders" v-loading="loading" row-key="entity_id" @selection-change="onSelect" @row-click="onRowClick" border stripe style="cursor:pointer">
        <el-table-column type="selection" width="45" />
        <el-table-column v-if="vis('increment_id')" prop="increment_id" label="ID" width="100" sortable="custom" @sort-change="onSort" />
        <el-table-column v-if="vis('purchase_point')" prop="purchase_point" label="Purchase Point" width="150" sortable="custom" />
        <el-table-column v-if="vis('purchase_date')" prop="purchase_date" label="Purchase Date" width="180" sortable="custom">
          <template #default="{row}">{{ fmt(row.purchase_date) }}</template>
        </el-table-column>
        <el-table-column v-if="vis('bill_to_name')" prop="bill_to_name" label="Bill-to Name" sortable="custom" />
        <el-table-column v-if="vis('ship_to_name')" prop="ship_to_name" label="Ship-to Name" sortable="custom" />
        <el-table-column v-if="vis('base_grand_total')" prop="base_grand_total" label="Grand Total (Base)" width="120" align="right" sortable="custom">
          <template #default="{row}">{{ cur(row.base_grand_total) }}</template>
        </el-table-column>
        <el-table-column v-if="vis('grand_total')" prop="grand_total" label="Grand Total (Purchased)" width="120" align="right" sortable="custom">
          <template #default="{row}">{{ cur(row.grand_total) }}</template>
        </el-table-column>
        <el-table-column v-if="vis('status')" prop="status" label="Status" width="120" sortable="custom" />
        <el-table-column v-if="vis('total_item_count')" prop="total_item_count" label="Items" width="80" align="center" sortable="custom" />
        <el-table-column v-if="vis('action')" label="Action" width="80" fixed="right">
          <template #default="{row}"><a href="#" @click.prevent.stop="handleView(row)">View</a></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Filter, View, Setting, ArrowDown, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const emit = defineEmits(['navigate'])
const props = defineProps({ initialFilters: { type: Object, default: () => ({}) } })

const loading = ref(false), orders = ref([]), showFilters = ref(true)
const bulkAction = ref(undefined), targetStatus = ref(undefined)
const selectedRowKeys = ref([])
const sortState = reactive({ field: null, order: null })

const filters = reactive({
  purchase_date_from: null, purchase_date_to: null,
  base_grand_total_from: null, base_grand_total_to: null,
  grand_total_from: null, grand_total_to: null,
  purchase_point: null, increment_id: null,
  bill_to_name: null, ship_to_name: null, status: null,
})
const pagination = reactive({ current: 1, pageSize: 20, total: 0 })

const statusOptions = ['canceled','closed','complete','fraud','holded','payment_review','pending','pending_payment','processing']

const allColumns = [
  { title:'ID', key:'increment_id' }, { title:'Purchase Point', key:'purchase_point' },
  { title:'Purchase Date', key:'purchase_date' }, { title:'Bill-to Name', key:'bill_to_name' },
  { title:'Ship-to Name', key:'ship_to_name' }, { title:'Grand Total (Base)', key:'base_grand_total' },
  { title:'Grand Total (Purchased)', key:'grand_total' }, { title:'Status', key:'status' },
  { title:'Items', key:'total_item_count' }, { title:'Action', key:'action' },
]
const visibleColumnKeys = ref(allColumns.map(c=>c.key))
const vis = (k) => visibleColumnKeys.value.includes(k)

const fmt = (d) => d ? dayjs(d).format('MMM D, YYYY h:mm:ss A') : ''
const cur = (v) => v == null ? '' : '$'+parseFloat(v).toFixed(2)

const onSelect = (rows) => { selectedRowKeys.value = rows.map(r=>r.entity_id) }
const onRowClick = (row) => { handleView(row) }
const onSort = ({ prop, order }) => { sortState.field = order ? prop : null; sortState.order = order || null; fetchOrders() }

const toggleFilters = () => { showFilters.value = !showFilters.value }
const handleApplyFilters = () => { pagination.current = 1; fetchOrders() }
const handleResetFilters = () => { Object.keys(filters).forEach(k=>filters[k]=null); pagination.current = 1; fetchOrders(); showFilters.value = false }
const handlePageChange = (p) => { pagination.current = p; fetchOrders() }
const handlePageSizeChange = (s) => { pagination.pageSize = s; pagination.current = 1; fetchOrders() }

const handleView = (r) => emit('navigate', 'sales_order_view', { id: r.entity_id, savedState: { ...filters, page: pagination.current, pageSize: pagination.pageSize, sortField: sortState.field, sortOrder: sortState.order } })

const handleBulkSubmit = () => {
  if (!bulkAction.value) return ElMessage.warning('Please select an action')
  if (selectedRowKeys.value.length === 0) return ElMessage.warning('Please select items')
  if (bulkAction.value === 'delete') {
    orders.value = orders.value.filter(i => !selectedRowKeys.value.includes(i.entity_id))
    selectedRowKeys.value = []; ElMessage.success('Records deleted (mock).')
  } else if (bulkAction.value === 'update_status') {
    if (!targetStatus.value) return ElMessage.warning('Please select a status')
    orders.value = orders.value.map(i => selectedRowKeys.value.includes(i.entity_id) ? { ...i, status: targetStatus.value } : i)
    selectedRowKeys.value = []; targetStatus.value = undefined; bulkAction.value = undefined
    ElMessage.success('Status updated (mock).')
  }
}

const handleExport = async (format) => {
  loading.value = true
  try {
    const qs = buildQs(Math.max(pagination.total, 100000))
    const r = await fetch(`/api/sales/orders?${qs}`)
    const d = await r.json()
    const cols = allColumns.filter(c => c.key !== 'action' && vis(c.key))
    const rows = (d.items||[]).map(row => cols.map(c => '"'+String(getCell(row,c)??'').replace(/"/g,'""')+'"').join(','))
    const csv = [cols.map(c=>c.title).join(','), ...rows].join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='orders.csv'; a.click()
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const getCell = (row, col) => {
  const v = row[col.key]
  if (col.key === 'purchase_date') return fmt(v)
  if (col.key === 'base_grand_total' || col.key === 'grand_total') return cur(v)
  return v
}

const buildQs = (pageSize) => {
  const p = new URLSearchParams({ page: 1, pageSize })
  Object.entries(filters).forEach(([k,v]) => { if (v != null && v !== '') p.append(k, v) })
  if (sortState.field) { p.append('sortField', sortState.field); p.append('sortOrder', sortState.order) }
  return p.toString()
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const p = new URLSearchParams({ page: pagination.current, pageSize: pagination.pageSize })
    Object.entries(filters).forEach(([k,v]) => { if (v != null && v !== '') p.append(k, v) })
    if (sortState.field) { p.append('sortField', sortState.field); p.append('sortOrder', sortState.order) }
    const r = await fetch(`/api/sales/orders?${p}`)
    const d = await r.json()
    orders.value = d.items || []
    pagination.total = d.total || 0
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

onMounted(() => {
  if (props.initialFilters) {
    const { page, pageSize, sortField, sortOrder, ...rest } = props.initialFilters
    Object.assign(filters, rest)
    if (page) pagination.current = page
    if (pageSize) pagination.pageSize = pageSize
    if (sortField) sortState.field = sortField
    if (sortOrder) sortState.order = sortOrder
  }
  fetchOrders()
})
</script>

<style scoped>
.sales-orders { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 28px; font-weight: 300; margin: 0; color: #262626; }
.actions-bar { display: flex; align-items: center; margin-bottom: 16px; background: #f5f5f5; padding: 12px; border: 1px solid #e3e3e3; border-radius: 4px; justify-content: flex-end; }
.toolbar { display: flex; gap: 8px; }
.filters-section { background: #f5f5f5; padding: 16px; margin-bottom: 16px; border: 1px solid #e3e3e3; border-radius: 4px; }
.fl { font-weight: 600; font-size: 12px; margin-bottom: 6px; color: #333; }
.filter-actions { display: flex; justify-content: flex-end; margin-top: 12px; gap: 8px; }
.table-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.bulk-actions { display: flex; align-items: center; gap: 8px; }
.records-count { color: #666; font-size: 13px; }
.right-controls { display: flex; align-items: center; gap: 8px; }
.per-page { color: #666; font-size: 13px; }
.table-card { background: #fff; padding: 16px; border: 1px solid #e3e3e3; border-radius: 4px; }
</style>
