<template>
  <div class="catalog-products">
    <div class="page-header">
      <h1 class="page-title">Products</h1>
      <el-button type="primary" class="add-button" @click="handleAddProduct">
        Add Product
      </el-button>
    </div>

    <!-- Actions Bar -->
    <div class="actions-bar">
      <div class="toolbar">
        <el-button @click="toggleFilters">
          <el-icon><Filter /></el-icon> Filters
        </el-button>
        <el-dropdown>
          <el-button>
            <el-icon><View /></el-icon> Default View <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>Default View</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-popover trigger="click" placement="bottom-end" :width="220">
          <template #reference>
            <el-button>
              <el-icon><Setting /></el-icon> Columns <el-icon><ArrowDown /></el-icon>
            </el-button>
          </template>
          <el-checkbox-group v-model="visibleColumnKeys" style="display: flex; flex-direction: column">
            <el-checkbox v-for="col in allColumns" :key="col.key" :value="col.key" style="margin-bottom: 8px">
              {{ col.title }}
            </el-checkbox>
          </el-checkbox-group>
        </el-popover>
        <el-dropdown @command="handleExport">
          <el-button>
            <el-icon><Upload /></el-icon> Export <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="csv">CSV</el-dropdown-item>
              <el-dropdown-item command="xml">Excel XML</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Filters Section -->
    <div v-if="showFilters" class="filters-section">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="filter-label">ID</div>
          <div class="range-input">
            <el-input v-model="filters.id_from" placeholder="from" size="small" />
            <el-input v-model="filters.id_to" placeholder="to" size="small" style="margin-top: 4px" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="filter-label">Price</div>
          <div class="range-input">
            <el-input v-model="filters.price_from" placeholder="from" size="small" />
            <el-input v-model="filters.price_to" placeholder="to" size="small" style="margin-top: 4px" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="filter-label">Quantity</div>
          <div class="range-input">
            <el-input v-model="filters.qty_from" placeholder="from" size="small" />
            <el-input v-model="filters.qty_to" placeholder="to" size="small" style="margin-top: 4px" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="filter-label">Last Updated At</div>
          <div class="date-range">
            <el-date-picker v-model="filters.updated_at_from" type="date" placeholder="from" value-format="YYYY-MM-DD" size="small" style="width: 100%" />
            <el-date-picker v-model="filters.updated_at_to" type="date" placeholder="to" value-format="YYYY-MM-DD" size="small" style="width: 100%; margin-top: 4px" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top: 12px">
        <el-col :span="6">
          <div class="filter-label">Name</div>
          <el-input v-model="filters.name" size="small" />
        </el-col>
        <el-col :span="6">
          <div class="filter-label">Type</div>
          <el-select v-model="filters.type_id" clearable size="small" style="width: 100%">
            <el-option label="Simple Product" value="simple" />
            <el-option label="Configurable Product" value="configurable" />
            <el-option label="Virtual Product" value="virtual" />
            <el-option label="Bundle Product" value="bundle" />
            <el-option label="Downloadable Product" value="downloadable" />
            <el-option label="Grouped Product" value="grouped" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <div class="filter-label">SKU</div>
          <el-input v-model="filters.sku" size="small" />
        </el-col>
        <el-col :span="6">
          <div class="filter-label">Visibility</div>
          <el-select v-model="filters.visibility" clearable size="small" style="width: 100%">
            <el-option label="Not Visible Individually" value="Not Visible Individually" />
            <el-option label="Catalog" value="Catalog" />
            <el-option label="Search" value="Search" />
            <el-option label="Catalog, Search" value="Catalog, Search" />
          </el-select>
        </el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top: 12px">
        <el-col :span="6">
          <div class="filter-label">Status</div>
          <el-select v-model="filters.status" clearable size="small" style="width: 100%">
            <el-option label="Enabled" value="Enabled" />
            <el-option label="Disabled" value="Disabled" />
          </el-select>
        </el-col>
      </el-row>
      <div class="filter-actions">
        <el-button @click="resetFilters">Cancel</el-button>
        <el-button type="primary" @click="applyFilters">Apply Filters</el-button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table">
      <div class="table-header">
        <div class="bulk-actions">
          <el-select v-model="bulkAction" placeholder="Actions" style="width: 200px" size="small">
            <el-option label="Delete" value="delete" />
            <el-option label="Update Status" value="update_status" />
            <el-option label="Update Price" value="update_price" />
            <el-option label="Update Quantity" value="update_quantity" />
          </el-select>

          <el-select v-if="bulkAction === 'update_status'" v-model="targetStatus" placeholder="Select Status" style="width: 150px; margin-left: 8px" size="small">
            <el-option label="Enabled" value="Enabled" />
            <el-option label="Disabled" value="Disabled" />
          </el-select>

          <el-input-number v-if="bulkAction === 'update_price'" v-model="targetPrice" placeholder="Enter Price" :min="0" style="width: 150px; margin-left: 8px" size="small" />

          <el-input-number v-if="bulkAction === 'update_quantity'" v-model="targetQuantity" placeholder="Enter Quantity" :min="0" style="width: 150px; margin-left: 8px" size="small" />

          <el-button @click="handleBulkSubmit" size="small" style="margin-left: 8px">Submit</el-button>
        </div>

        <div style="flex: 1; text-align: right; margin-right: 16px">
          <span style="font-size: 13px; color: #666">{{ pagination.total }} records found</span>
        </div>

        <div class="pagination-controls">
          <el-select v-model="pagination.pageSize" style="width: 80px" size="small" @change="handlePageSizeChange">
            <el-option :value="20" label="20" />
            <el-option :value="50" label="50" />
            <el-option :value="100" label="100" />
            <el-option :value="200" label="200" />
          </el-select>
          <span style="margin-left: 8px; font-size: 13px">per page</span>
          <el-pagination
            v-model:current-page="pagination.current"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            layout="prev, pager, next"
            small
            @current-change="handlePageChange"
            style="display: inline-block; margin-left: 16px"
          />
        </div>
      </div>

      <el-table
        ref="tableRef"
        :data="data"
        v-loading="loading"
        row-key="entity_id"
        @selection-change="onSelectChange"
        @row-click="onRowClick"
        border
        stripe
        style="cursor: pointer"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column v-if="visibleColumnKeys.includes('entity_id')" prop="entity_id" label="ID" width="80" sortable />
        <el-table-column v-if="visibleColumnKeys.includes('thumbnail')" label="Thumbnail" width="100">
          <template #default="{ row }">
            <img v-if="row.thumbnail && row.thumbnail !== 'no_selection'" :src="'/media/catalog/product' + row.thumbnail" style="max-width: 50px; max-height: 50px" />
            <div v-else class="no-image"></div>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumnKeys.includes('name')" prop="name" label="Name" sortable min-width="200" />
        <el-table-column v-if="visibleColumnKeys.includes('type_id')" prop="type_id" label="Type" sortable width="140" />
        <el-table-column v-if="visibleColumnKeys.includes('attribute_set_name')" prop="attribute_set_name" label="Attribute Set" sortable width="130" />
        <el-table-column v-if="visibleColumnKeys.includes('sku')" prop="sku" label="SKU" sortable width="100" />
        <el-table-column v-if="visibleColumnKeys.includes('price')" prop="price" label="Price" sortable width="100">
          <template #default="{ row }">{{ formatCurrency(row.price) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumnKeys.includes('quantity')" prop="quantity" label="Quantity" sortable width="100">
          <template #default="{ row }">{{ formatNumber(row.quantity) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumnKeys.includes('visibility')" prop="visibility" label="Visibility" sortable width="180">
          <template #default="{ row }">{{ getVisibilityLabel(row.visibility) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumnKeys.includes('status')" prop="status" label="Status" sortable width="100">
          <template #default="{ row }">{{ getStatusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumnKeys.includes('websites')" label="Websites" width="100" />
        <el-table-column v-if="visibleColumnKeys.includes('updated_at')" prop="updated_at" label="Last Updated At" sortable width="180">
          <template #default="{ row }">{{ formatDate(row.updated_at) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumnKeys.includes('action')" label="Action" width="80" fixed="right">
          <template #default="{ row }">
            <a href="#" @click.prevent.stop="editProduct(row)">Edit</a>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Filter, View, Setting, ArrowDown, Upload,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const emit = defineEmits(['navigate'])

const props = defineProps({
  initialFilters: { type: Object, default: () => ({}) },
})

const tableRef = ref(null)
const showFilters = ref(true)
const loading = ref(false)
const data = ref([])
const selectedRowKeys = ref([])
const bulkAction = ref(undefined)
const targetStatus = ref(undefined)
const targetPrice = ref(undefined)
const targetQuantity = ref(undefined)

const filters = reactive({
  id_from: '', id_to: '',
  price_from: '', price_to: '',
  qty_from: '', qty_to: '',
  name: '', sku: '',
  status: undefined, visibility: undefined, type_id: undefined,
  updated_at_from: null, updated_at_to: null,
})

const pagination = reactive({ current: 1, pageSize: 20, total: 0 })

const allColumns = [
  { title: 'ID', key: 'entity_id' },
  { title: 'Thumbnail', key: 'thumbnail' },
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type_id' },
  { title: 'Attribute Set', key: 'attribute_set_name' },
  { title: 'SKU', key: 'sku' },
  { title: 'Price', key: 'price' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Visibility', key: 'visibility' },
  { title: 'Status', key: 'status' },
  { title: 'Websites', key: 'websites' },
  { title: 'Last Updated At', key: 'updated_at' },
  { title: 'Action', key: 'action' },
]

const visibleColumnKeys = ref(allColumns.map((c) => c.key))

// Event handlers
const onSelectChange = (rows) => {
  selectedRowKeys.value = rows.map(r => r.entity_id)
}

const onRowClick = (row) => {
  editProduct(row)
}

const handleAddProduct = () => emit('navigate', 'catalog_product_add')

const toggleFilters = () => { showFilters.value = !showFilters.value }

const resetFilters = () => {
  Object.keys(filters).forEach(k => { filters[k] = k.endsWith('_from') || k.endsWith('_to') || k === 'name' || k === 'sku' ? '' : k === 'updated_at_from' || k === 'updated_at_to' ? null : undefined })
  filters.id_from = ''; filters.id_to = ''
  filters.price_from = ''; filters.price_to = ''
  filters.qty_from = ''; filters.qty_to = ''
  filters.name = ''; filters.sku = ''
  filters.status = undefined; filters.visibility = undefined; filters.type_id = undefined
  fetchData()
}

const applyFilters = () => { pagination.current = 1; fetchData() }
const handlePageChange = (page) => { pagination.current = page; fetchData() }
const handlePageSizeChange = (size) => { pagination.pageSize = size; pagination.current = 1; fetchData() }

const editProduct = (record) => {
  emit('navigate', 'catalog_product_edit', {
    id: record.entity_id,
    savedState: { ...filters, page: pagination.current, pageSize: pagination.pageSize },
  })
}

// Formatters
const formatCurrency = (v) => v == null ? '' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
const formatNumber = (v) => v == null ? '' : parseFloat(v).toFixed(4)
const formatDate = (d) => d ? dayjs(d).format('MMM D, YYYY h:mm:ss A') : ''

const getVisibilityLabel = (v) => {
  const m = { 1: 'Not Visible Individually', 2: 'Catalog', 3: 'Search', 4: 'Catalog, Search', 'Not Visible Individually': 'Not Visible Individually', 'Catalog': 'Catalog', 'Search': 'Search', 'Catalog, Search': 'Catalog, Search' }
  return m[v] || v
}
const getStatusLabel = (v) => ({ 1: 'Enabled', 2: 'Disabled' }[v] || v)

// Bulk actions
const handleBulkSubmit = () => {
  if (!bulkAction.value) return ElMessage.warning('Please select an action')
  if (selectedRowKeys.value.length === 0) return ElMessage.warning('Please select items')

  if (bulkAction.value === 'delete') {
    data.value = data.value.filter(item => !selectedRowKeys.value.includes(item.entity_id))
    selectedRowKeys.value = []
    ElMessage.success('Records deleted (mock).')
  } else if (bulkAction.value === 'update_status') {
    if (!targetStatus.value) return ElMessage.warning('Please select a status')
    const statusMap = { Enabled: 1, Disabled: 2 }
    data.value = data.value.map(item => selectedRowKeys.value.includes(item.entity_id) ? { ...item, status: statusMap[targetStatus.value] || targetStatus.value } : item)
    selectedRowKeys.value = []; targetStatus.value = undefined; bulkAction.value = undefined
    ElMessage.success('Status updated (mock).')
  } else if (bulkAction.value === 'update_price') {
    if (targetPrice.value == null) return ElMessage.warning('Please enter a price')
    data.value = data.value.map(item => selectedRowKeys.value.includes(item.entity_id) ? { ...item, price: targetPrice.value } : item)
    selectedRowKeys.value = []; targetPrice.value = undefined; bulkAction.value = undefined
    ElMessage.success('Price updated (mock).')
  } else if (bulkAction.value === 'update_quantity') {
    if (targetQuantity.value == null) return ElMessage.warning('Please enter a quantity')
    data.value = data.value.map(item => selectedRowKeys.value.includes(item.entity_id) ? { ...item, quantity: targetQuantity.value } : item)
    selectedRowKeys.value = []; targetQuantity.value = undefined; bulkAction.value = undefined
    ElMessage.success('Quantity updated (mock).')
  }
}

// Export
const getRowValue = (record, col) => {
  let val = record[col.dataIndex || col.key]
  if (col.key === 'price') val = formatCurrency(val)
  else if (col.key === 'quantity') val = formatNumber(val)
  else if (col.key === 'visibility') val = getVisibilityLabel(val)
  else if (col.key === 'status') val = getStatusLabel(val)
  else if (col.key === 'updated_at') val = formatDate(val)
  return val
}

const downloadCSV = (exportData) => {
  const cols = allColumns.filter(c => c.key !== 'action' && c.key !== 'thumbnail' && visibleColumnKeys.value.includes(c.key))
  const header = cols.map(c => c.title).join(',')
  const rows = exportData.map(r => cols.map(c => '"' + String(getRowValue(r, c) ?? '').replace(/"/g, '""') + '"').join(','))
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'products.csv'; a.click()
  URL.revokeObjectURL(url)
}

const handleExport = async (format) => {
  loading.value = true
  try {
    const params = { page: 1, pageSize: Math.max(pagination.total, 100000), ...filters }
    if (filters.updated_at_from) params.updated_at_from = dayjs(filters.updated_at_from).format('YYYY-MM-DD HH:mm:ss')
    if (filters.updated_at_to) params.updated_at_to = dayjs(filters.updated_at_to).format('YYYY-MM-DD HH:mm:ss')
    const r = await fetch(`/api/catalog/products?` + new URLSearchParams(Object.entries(params).filter(([_,v]) => v != null && v !== '' && v !== undefined)))
    const json = await r.json()
    if (format === 'csv') downloadCSV(json.items)
  } catch (e) { console.error('Export error:', e) }
  finally { loading.value = false }
}

// Fetch
const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.current, pageSize: pagination.pageSize, ...filters }
    if (filters.status) params.status = { Enabled: 1, Disabled: 2 }[filters.status] || filters.status
    if (filters.visibility) params.visibility = { 'Not Visible Individually': 1, 'Catalog': 2, 'Search': 3, 'Catalog, Search': 4 }[filters.visibility] || filters.visibility
    if (filters.updated_at_from) params.updated_at_from = dayjs(filters.updated_at_from).format('YYYY-MM-DD HH:mm:ss')
    if (filters.updated_at_to) params.updated_at_to = dayjs(filters.updated_at_to).format('YYYY-MM-DD HH:mm:ss')

    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '' && v !== undefined) qs.append(k, v) })
    const r = await fetch(`/api/catalog/products?${qs}`)
    const json = await r.json()
    data.value = json.items || []
    pagination.total = json.total || 0

    // Apply temp updates
    const updates = []
    if (props.initialFilters.tempUpdates) updates.push(...props.initialFilters.tempUpdates)
    else if (props.initialFilters.tempUpdate) updates.push(props.initialFilters.tempUpdate)
    for (const temp of updates) {
      const idx = data.value.findIndex(p => p.entity_id == temp.entity_id)
      if (idx !== -1) data.value[idx] = { ...data.value[idx], ...temp }
      else data.value.unshift(temp)
    }
  } catch (e) { console.error('Fetch products error:', e) }
  finally { loading.value = false }
}

onMounted(() => {
  if (props.initialFilters) {
    const { page, pageSize, tempUpdate, tempUpdates, deletedIds, savedState, newPage, ...rest } = props.initialFilters
    Object.assign(filters, rest)
    if (page) pagination.current = page
    if (pageSize) pagination.pageSize = pageSize
  }
  fetchData()
})
</script>

<style scoped>
.catalog-products { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 28px; font-weight: 300; color: #262626; margin: 0; }
.add-button { background-color: #eb5202; border-color: #eb5202; }
.add-button:hover { background-color: #d44902; border-color: #d44902; }
.actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.toolbar { display: flex; gap: 10px; margin-left: auto; }
.filters-section { background: #fff; padding: 24px; margin-bottom: 20px; border: 1px solid #d9d9d9; border-radius: 4px; }
.filter-label { font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #333; }
.filter-actions { display: flex; justify-content: flex-end; margin-top: 16px; gap: 8px; }
.data-table { background: #fff; padding: 16px; border: 1px solid #d9d9d9; border-radius: 4px; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.bulk-actions { display: flex; gap: 8px; align-items: center; }
.range-input { display: flex; flex-direction: column; }
.no-image { width: 50px; height: 50px; background: #eee; }
</style>
