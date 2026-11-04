<template>
  <div class="product-add">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="goBack"><el-icon><ArrowLeft /></el-icon> Back</el-button>
        <h1 class="page-title">New Product</h1>
      </div>
      <div class="header-right">
        <el-button @click="handleAddAttributeClick">Add Attribute</el-button>
        <el-button type="primary" class="save-button" @click="saveProduct">Save <el-icon><ArrowDown /></el-icon></el-button>
      </div>
    </div>

    <!-- Add Attribute Modal -->
    <el-dialog v-model="showAddAttributeModal" title="Add New Attribute" width="500px" @close="newAttributeName=''">
      <div class="field">
        <div class="field-label"><span class="required">*</span> Attribute Name</div>
        <el-input v-model="newAttributeName" />
      </div>
      <template #footer>
        <el-button @click="showAddAttributeModal = false">Cancel</el-button>
        <el-button type="primary" @click="confirmAddAttribute">OK</el-button>
      </template>
    </el-dialog>

    <div class="scope-switcher">
      <span>Scope: </span>
      <el-select model-value="all_store_views" style="width: 200px" size="small">
        <el-option label="All Store Views" value="all_store_views" />
      </el-select>
    </div>

    <div class="form-section">
      <!-- Custom Attributes Table -->
      <div v-if="customAttributes.length > 0" style="margin-bottom: 24px">
        <h3>Additional Attributes</h3>
        <el-table :data="customAttributes" row-key="name" border size="small">
          <el-table-column prop="name" label="Attribute" />
          <el-table-column label="Value">
            <template #default="{ row }"><el-input v-model="row.value" /></template>
          </el-table-column>
          <el-table-column label="Action" width="100">
            <template #default="{ $index }">
              <el-button text type="danger" @click="removeAttribute($index)"><el-icon><Delete /></el-icon></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Switch -->
      <div class="enable-product-switch">
        <div class="field-label">Enable Product</div>
        <el-switch v-model="productStatus" />
      </div>

      <div class="field">
        <div class="field-label">Attribute Set</div>
        <el-select v-model="product.attribute_set_id" style="width: 100%">
          <el-option :value="4" label="Default" />
        </el-select>
      </div>

      <div class="field">
        <div class="field-label"><span class="required">*</span> Product Name</div>
        <el-input v-model="product.name" />
      </div>

      <div class="field">
        <div class="field-label"><span class="required">*</span> SKU</div>
        <el-input v-model="product.sku" />
      </div>

      <div class="field">
        <div class="field-label"><span class="required">*</span> Price</div>
        <el-input-number v-model="product.price" :precision="2" style="width: 200px" />
        <div class="link-text">Advanced Pricing</div>
      </div>

      <div class="field">
        <div class="field-label">Tax Class</div>
        <el-select v-model="product.tax_class_id" style="width: 100%">
          <el-option :value="0" label="None" />
          <el-option :value="2" label="Taxable Goods" />
        </el-select>
      </div>

      <div class="field">
        <div class="field-label">Quantity</div>
        <el-input-number v-model="product.quantity" style="width: 200px" />
        <div class="link-text">Advanced Inventory</div>
      </div>

      <div class="field">
        <div class="field-label">Stock Status</div>
        <el-select v-model="product.stock_status" style="width: 200px">
          <el-option label="In Stock" value="In Stock" />
          <el-option label="Out of Stock" value="Out of Stock" />
        </el-select>
      </div>

      <div class="field">
        <div class="field-label">Weight</div>
        <div style="display: flex; gap: 8px">
          <el-input-number v-model="product.weight" style="width: 120px" />
          <el-select model-value="lbs" style="width: 80px">
            <el-option label="lbs" value="lbs" /><el-option label="kgs" value="kgs" />
          </el-select>
          <el-select model-value="has_weight" style="width: 180px">
            <el-option label="This item has weight" value="has_weight" />
            <el-option label="This item has no weight" value="no_weight" />
          </el-select>
        </div>
      </div>

      <div class="field">
        <div class="field-label">Categories</div>
        <div style="display: flex; gap: 8px">
          <el-select v-model="product.categories" multiple placeholder="Select..." style="flex: 1">
            <el-option value="2" label="Default Category" />
            <el-option value="3" label="Gear" />
            <el-option value="4" label="Bags" />
          </el-select>
          <el-button class="new-cat-btn">New Category</el-button>
        </div>
      </div>

      <div class="field">
        <div class="field-label">Visibility</div>
        <el-select v-model="product.visibility" style="width: 100%">
          <el-option label="Not Visible Individually" value="Not Visible Individually" />
          <el-option label="Catalog" value="Catalog" />
          <el-option label="Search" value="Search" />
          <el-option label="Catalog, Search" value="Catalog, Search" />
        </el-select>
      </div>

      <div class="field">
        <div class="field-label">Set Product as New From</div>
        <el-date-picker v-model="product.news_from_date" type="daterange" range-separator="To" style="width: 100%" />
      </div>

      <div class="field">
        <div class="field-label">Country of Manufacture</div>
        <el-select v-model="product.country_of_manufacture" filterable style="width: 100%">
          <el-option label="United States" value="US" />
          <el-option label="China" value="CN" />
        </el-select>
      </div>
    </div>

    <!-- Collapsible Sections -->
    <el-collapse v-model="activeSections" class="form-section">
      <el-collapse-item title="Content" name="content">
        <div class="field"><div class="field-label">Description</div><el-input v-model="product.description" type="textarea" :rows="4" /></div>
        <div class="field"><div class="field-label">Short Description</div><el-input v-model="product.short_description" type="textarea" :rows="2" /></div>
      </el-collapse-item>
      <el-collapse-item title="Configurations" name="configurations">
        <div class="config-section">
          <p>Configurable products allow customers to choose options (Ex: shirt color). You need to create a simple product for each configuration.</p>
          <el-button size="small" class="new-cat-btn">Create Configurations</el-button>
        </div>
      </el-collapse-item>
      <el-collapse-item title="Images And Videos" name="images">
        <div class="upload-placeholder"><el-icon :size="32"><Camera /></el-icon><span>Browse to find or drag image here</span></div>
      </el-collapse-item>
      <el-collapse-item title="Search Engine Optimization" name="seo">
        <div class="field"><div class="field-label">URL Key</div><el-input v-model="product.url_key" /></div>
        <div class="field"><div class="field-label">Meta Title</div><el-input v-model="product.meta_title" /></div>
        <div class="field"><div class="field-label">Meta Keywords</div><el-input v-model="product.meta_keyword" type="textarea" :rows="2" /></div>
        <div class="field"><div class="field-label">Meta Description</div><el-input v-model="product.meta_description" type="textarea" :rows="3" /></div>
      </el-collapse-item>
      <el-collapse-item title="Related Products, Up-Sells, and Cross-Sells" name="related" />
      <el-collapse-item title="Customizable Options" name="customizable" />
      <el-collapse-item title="Product in Websites" name="websites" />
      <el-collapse-item title="Design" name="design" />
      <el-collapse-item title="Schedule Design Update" name="schedule_design" />
      <el-collapse-item title="Gift Options" name="gift_options" />
      <el-collapse-item title="Downloadable Information" name="downloadable" />
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ArrowLeft, ArrowDown, Delete, Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['navigate'])

const product = reactive({
  status: 1, attribute_set_id: 4, name: '', sku: '', price: null,
  tax_class_id: 2, quantity: null, stock_status: 'In Stock', weight: null,
  visibility: 'Catalog, Search', categories: [], news_from_date: [],
  country_of_manufacture: undefined, description: '', short_description: '',
  url_key: '', meta_title: '', meta_keyword: '', meta_description: '',
})

// Separate boolean for switch (same pattern as ProductEdit)
const productStatus = ref(product.status === 1)
watch(productStatus, (v) => { product.status = v ? 1 : 2 })

const customAttributes = ref([])
const showAddAttributeModal = ref(false)
const newAttributeName = ref('')
const activeSections = ref(['content','configurations','images','seo','related','customizable','websites','design','schedule_design','gift_options','downloadable'])

const handleAddAttributeClick = () => { showAddAttributeModal.value = true; newAttributeName.value = '' }

const confirmAddAttribute = () => {
  const name = newAttributeName.value.trim()
  if (!name) return ElMessage.error('Please enter attribute name')
  if (Object.keys(product).includes(name)) return ElMessage.error(`The attribute "${name}" already exists in the standard form.`)
  if (customAttributes.value.some(a => a.name === name)) return ElMessage.error(`The attribute "${name}" has already been added.`)
  customAttributes.value.push({ name, value: '' })
  showAddAttributeModal.value = false
}

const removeAttribute = (index) => { customAttributes.value.splice(index, 1) }

const goBack = () => emit('navigate', 'catalog_products')

const saveProduct = () => {
  const stockMap = { 'In Stock': 1, 'Out of Stock': 0 }
  const visMap = { 'Not Visible Individually': 1, 'Catalog': 2, 'Search': 3, 'Catalog, Search': 4 }
  const payload = {
    entity_id: Date.now(), ...product,
    status: product.status, type_id: 'simple', attribute_set_id: 4,
    visibility: 4, qty: 0, custom_attributes: customAttributes.value, thumbnail: null,
  }
  if (stockMap[product.stock_status] !== undefined) payload.stock_status = stockMap[product.stock_status]
  if (visMap[product.visibility] !== undefined) payload.visibility = visMap[product.visibility]

  ElMessage({ message: 'Saving...', type: 'loading', duration: 800 })
  setTimeout(() => {
    ElMessage.success('You saved the product.')
    emit('navigate', 'catalog_products', { tempUpdate: payload })
  }, 1000)
}
</script>

<style scoped>
.product-add { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-bottom: 1px solid #e3e3e3; position: sticky; top: 0; z-index: 100; }
.header-left { display: flex; align-items: center; gap: 16px; }
.page-title { font-size: 24px; font-weight: 600; margin: 0; color: #333; }
.header-right { display: flex; gap: 12px; }
.save-button { background-color: #eb5202; border-color: #eb5202; }
.scope-switcher { padding: 10px 24px; background: #f4f5f7; display: flex; align-items: center; font-size: 13px; color: #666; gap: 8px; }
.form-section { background: #fff; padding: 24px; margin: 20px auto; border: 1px solid #d9d9d9; border-radius: 4px; max-width: 1000px; }
.enable-product-switch { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.field { margin-bottom: 16px; }
.field-label { font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #333; }
.required { color: #e02b27; margin-right: 2px; }
.link-text { font-size: 12px; color: #007bdb; cursor: pointer; margin-top: 4px; }
.new-cat-btn { background: #514943; color: #fff; border: none; }
.new-cat-btn:hover { background: #3d3630; color: #fff; }
.config-section { background: #fcfcfc; padding: 20px; border: 1px solid #e3e3e3; border-radius: 4px; }
.config-section p { color: #666; font-size: 13px; }
.upload-placeholder { border: 1px dashed #d9d9d9; padding: 40px; text-align: center; background: #fafafa; display: flex; flex-direction: column; align-items: center; gap: 10px; color: #999; }
</style>
