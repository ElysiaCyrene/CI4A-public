<template>
  <div class="product-edit" v-loading="loading">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon> Back
        </el-button>
        <h1 class="page-title">{{ product.name || 'Edit Product' }}</h1>
      </div>
      <div class="header-right">
        <el-button>Add Attribute</el-button>
        <el-button type="primary" class="save-button" @click="saveProduct">
          Save <el-icon><ArrowDown /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- Scope -->
    <div class="scope-switcher">
      <span>Scope: </span>
      <el-select model-value="all_store_views" style="width: 200px" size="small">
        <el-option label="All Store Views" value="all_store_views" />
      </el-select>
    </div>

    <div class="page-content-wrapper">
      <!-- Main Form -->
      <div class="main-content">
        <div id="basic-settings" class="form-section">
          <div class="enable-product-switch">
            <div class="field-label">Enable Product</div>
            <el-switch v-model="productStatus" />
          </div>

          <div class="field">
            <div class="field-label">Attribute Set</div>
            <el-select :model-value="product.attribute_set_id" disabled style="width: 100%">
              <el-option label="Default" :value="product.attribute_set_id" />
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
          </div>

          <div class="field">
            <div class="field-label">Tax Class</div>
            <el-select v-model="product.tax_class_id" style="width: 100%">
              <el-option label="None" :value="0" />
              <el-option label="Taxable Goods" :value="2" />
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
                <el-option label="lbs" value="lbs" />
                <el-option label="kgs" value="kgs" />
              </el-select>
              <el-select model-value="has_weight" style="width: 180px">
                <el-option label="This item has weight" value="has_weight" />
                <el-option label="This item has no weight" value="no_weight" />
              </el-select>
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
            <el-date-picker
              v-model="product.news_from_date"
              type="daterange"
              range-separator="To"
              style="width: 100%"
            />
          </div>

          <div class="field">
            <div class="field-label">Country of Manufacture</div>
            <el-select v-model="product.country_of_manufacture" filterable style="width: 100%">
              <el-option label="United States" value="US" />
              <el-option label="China" value="CN" />
            </el-select>
          </div>

          <el-divider />

          <!-- Multi-select attributes -->
          <div class="field">
            <div class="field-label">Style Bottom</div>
            <el-select v-model="product.style_bottom" multiple style="width: 100%">
              <el-option v-for="o in styleOptions" :key="o.v" :label="o.l" :value="o.v" />
            </el-select>
          </div>
          <div class="field">
            <div class="field-label">Activity</div>
            <el-select v-model="product.activity" multiple style="width: 100%">
              <el-option v-for="o in activityOptions" :key="o.v" :label="o.l" :value="o.v" />
            </el-select>
          </div>
          <div class="field">
            <div class="field-label">Material</div>
            <el-select v-model="product.material" multiple style="width: 100%">
              <el-option v-for="o in materialOptions" :key="o.v" :label="o.l" :value="o.v" />
            </el-select>
          </div>
          <div class="field">
            <div class="field-label">Pattern</div>
            <el-select v-model="product.pattern" multiple style="width: 100%">
              <el-option v-for="o in patternOptions" :key="o.v" :label="o.l" :value="o.v" />
            </el-select>
          </div>
          <div class="field">
            <div class="field-label">Climate</div>
            <el-select v-model="product.climate" multiple style="width: 100%">
              <el-option v-for="o in climateOptions" :key="o.v" :label="o.l" :value="o.v" />
            </el-select>
          </div>
        </div>

        <!-- Collapsible Sections -->
        <el-collapse v-model="activeSections" class="form-section">
          <!-- Content -->
          <el-collapse-item title="Content" name="content" id="section-content">
            <div class="field">
              <div class="field-label">Description</div>
              <el-input v-model="product.description" type="textarea" :rows="4" />
            </div>
            <div class="field">
              <div class="field-label">Short Description</div>
              <el-input v-model="product.short_description" type="textarea" :rows="2" />
            </div>
          </el-collapse-item>

          <!-- Configurations -->
          <el-collapse-item title="Configurations" name="configurations" id="section-configurations">
            <p style="color: #666; font-size: 13px">
              Configurable products allow customers to choose options (Ex: shirt color).
              You need to create a simple product for each configuration.
            </p>
            <div style="margin-bottom: 16px; text-align: right">
              <el-button @click="showConfigModal = true">Edit Configurations</el-button>
            </div>
            <div v-if="configurations.length > 0">
              <div style="font-weight: bold; margin-bottom: 10px">Current Variations</div>
              <el-table :data="configurations" row-key="sku" border size="small">
                <el-table-column label="Image" width="80">
                  <template #default><div class="no-image"><el-icon><Camera /></el-icon></div></template>
                </el-table-column>
                <el-table-column prop="name" label="Name" />
                <el-table-column prop="sku" label="SKU" />
                <el-table-column prop="price" label="Price" />
                <el-table-column prop="quantity" label="Quantity" />
                <el-table-column prop="weight" label="Weight" />
                <el-table-column prop="status" label="Status" />
                <el-table-column prop="attributes" label="Attributes" />
                <el-table-column label="Actions" width="80">
                  <template #default><a href="#">Select</a></template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>

          <!-- Reviews -->
          <el-collapse-item title="Product Reviews" name="reviews" id="section-reviews">
            <div v-if="reviewsLoading" style="text-align: center; padding: 20px">Loading...</div>
            <div v-else-if="reviews.length === 0">
              <p style="color: #999">No reviews found for this product.</p>
            </div>
            <el-table v-else :data="reviews" row-key="review_id" border size="small">
              <el-table-column prop="review_id" label="ID" width="80" />
              <el-table-column label="Created" width="160">
                <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
              </el-table-column>
              <el-table-column prop="status_name" label="Status" width="100" />
              <el-table-column prop="nickname" label="Nickname" width="120" />
              <el-table-column prop="detail" label="Review" />
            </el-table>
          </el-collapse-item>

          <!-- Images -->
          <el-collapse-item title="Images And Videos" name="images" id="section-images">
            <div class="upload-placeholder">
              <el-icon :size="32"><Camera /></el-icon>
              <span>Browse to find or drag image here</span>
            </div>
          </el-collapse-item>

          <!-- SEO -->
          <el-collapse-item title="Search Engine Optimization" name="seo" id="section-seo">
            <div class="field">
              <div class="field-label">URL Key</div>
              <el-input v-model="product.url_key" />
            </div>
            <div class="field">
              <div class="field-label">Meta Title</div>
              <el-input v-model="product.meta_title" />
            </div>
            <div class="field">
              <div class="field-label">Meta Keywords</div>
              <el-input v-model="product.meta_keyword" type="textarea" :rows="2" />
            </div>
            <div class="field">
              <div class="field-label">Meta Description</div>
              <el-input v-model="product.meta_description" type="textarea" :rows="3" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- Anchor Sidebar -->
      <div class="edit-anchor-sidebar">
        <el-anchor :offset="150">
          <el-anchor-link href="#basic-settings" title="Basic Settings" />
          <el-anchor-link href="#section-content" title="Content" />
          <el-anchor-link href="#section-configurations" title="Configurations" />
          <el-anchor-link href="#section-reviews" title="Product Reviews" />
          <el-anchor-link href="#section-images" title="Images &amp; Videos" />
          <el-anchor-link href="#section-seo" title="Search Engine Optimization" />
        </el-anchor>
      </div>
    </div>

    <ProductConfigurationsModal
      v-model:visible="showConfigModal"
      :product-name="product.name"
      :product-sku="product.sku"
      :product-price="product.price"
      @generate="handleGenerateConfigurations"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ArrowLeft, ArrowDown, Camera } from '@element-plus/icons-vue'
import ProductConfigurationsModal from './ProductConfigurationsModal.vue'
import dayjs from 'dayjs'

const props = defineProps({ productId: { type: [String, Number], required: true } })
const emit = defineEmits(['navigate'])

const loading = ref(false)
const product = ref({})
// Separate boolean ref for el-switch — synced bidirectionally with product.status
const productStatus = ref(false)
watch(productStatus, (v) => { product.value.status = v ? 1 : 2 })
const activeSections = ref(['content', 'configurations', 'images', 'seo', 'reviews'])
const showConfigModal = ref(false)
const configurations = ref([])
const handleGenerateConfigurations = (newProducts) => {
  configurations.value = [...configurations.value, ...newProducts]
}
const reviews = ref([])
const reviewsLoading = ref(false)

const styleOptions = [
  { v: '104', l: 'Base Layer' }, { v: '105', l: 'Basic' }, { v: '106', l: 'Capri' },
  { v: '107', l: 'Compression' }, { v: '108', l: 'Leggings' }, { v: '109', l: 'Parachute' },
  { v: '110', l: 'Skort' }, { v: '111', l: 'Snug' }, { v: '112', l: 'Sweatpants' },
  { v: '113', l: 'Tights' }, { v: '114', l: 'Track Pants' }, { v: '115', l: 'Workout Pants' },
]

const activityOptions = [
  { v: '4', l: 'Hike' }, { v: '5', l: 'Outdoor' }, { v: '6', l: 'Running' },
  { v: '7', l: 'Warmup' }, { v: '8', l: 'Yoga' }, { v: '9', l: 'Recreation' },
  { v: '10', l: 'Lounge' }, { v: '11', l: 'Gym' }, { v: '12', l: 'Climbing' },
  { v: '13', l: 'Crosstraining' }, { v: '14', l: 'Post-workout' }, { v: '15', l: 'Cycling' },
  { v: '16', l: 'Athletic' }, { v: '17', l: 'Sports' }, { v: '18', l: 'Hiking' },
  { v: '19', l: 'Overnight' }, { v: '20', l: 'School' }, { v: '21', l: 'Trail' },
  { v: '22', l: 'Travel' }, { v: '23', l: 'Urban' },
]

const materialOptions = [
  { v: '31', l: 'Burlap' }, { v: '32', l: 'Canvas' }, { v: '33', l: 'Cotton' },
  { v: '34', l: 'Faux Leather' }, { v: '35', l: 'Leather' }, { v: '36', l: 'Mesh' },
  { v: '37', l: 'Nylon' }, { v: '38', l: 'Polyester' }, { v: '39', l: 'Rayon' },
  { v: '40', l: 'Ripstop' }, { v: '41', l: 'Suede' }, { v: '42', l: 'Foam' },
  { v: '43', l: 'Metal' }, { v: '44', l: 'Plastic' }, { v: '45', l: 'Rubber' },
  { v: '46', l: 'Synthetic' }, { v: '47', l: 'Stainless Steel' }, { v: '48', l: 'Silicone' },
  { v: '142', l: 'Cocona® performance fabric' }, { v: '143', l: 'Wool' }, { v: '144', l: 'Fleece' },
  { v: '145', l: 'Hemp' }, { v: '146', l: 'Jersey' }, { v: '147', l: 'LumaTech™' },
  { v: '148', l: 'Lycra®' }, { v: '149', l: 'Microfiber' }, { v: '150', l: 'Spandex' },
  { v: '151', l: 'HeatTec®' }, { v: '152', l: 'EverCool™' }, { v: '153', l: 'Organic Cotton' },
  { v: '154', l: 'TENCEL' }, { v: '155', l: 'CoolTech™' }, { v: '156', l: 'Khaki' },
  { v: '157', l: 'Linen' }, { v: '158', l: 'Wool' }, { v: '159', l: 'Terry' },
]

const patternOptions = [
  { v: '192', l: 'Color-Blocked' }, { v: '193', l: 'Checked' }, { v: '194', l: 'Color-Blocked' },
  { v: '195', l: 'Graphic Print' }, { v: '196', l: 'Solid' }, { v: '197', l: 'Solid-Highlight' },
  { v: '198', l: 'Striped' }, { v: '199', l: 'Camo' }, { v: '200', l: 'Geometric' },
]

const climateOptions = [
  { v: '201', l: 'All-Weather' }, { v: '202', l: 'Cold' }, { v: '203', l: 'Cool' },
  { v: '204', l: 'Indoor' }, { v: '205', l: 'Mild' }, { v: '206', l: 'Rainy' },
  { v: '207', l: 'Spring' }, { v: '208', l: 'Warm' }, { v: '209', l: 'Windy' },
  { v: '210', l: 'Wintry' }, { v: '211', l: 'Hot' },
]

const formatDate = (d) => d ? dayjs(d).format('MMM D, YYYY, h:mm:ss A') : ''

const goBack = () => emit('navigate', 'catalog_products')

const saveProduct = () => {
  const stockMap = { 'In Stock': 1, 'Out of Stock': 0 }
  const visMap = { 'Not Visible Individually': 1, 'Catalog': 2, 'Search': 3, 'Catalog, Search': 4 }
  const payload = { ...product.value, entity_id: props.productId }
  if (stockMap[payload.stock_status] !== undefined) payload.stock_status = stockMap[payload.stock_status]
  if (visMap[payload.visibility] !== undefined) payload.visibility = visMap[payload.visibility]
  emit('navigate', 'catalog_products', { updatedData: payload })
}

const fetchReviews = async (name) => {
  if (!name) return
  reviewsLoading.value = true
  try {
    const r = await fetch(`/api/reviews?product=${encodeURIComponent(name)}`)
    const d = await r.json()
    reviews.value = d.items || []
  } catch (e) { console.error('Reviews error:', e) }
  finally { reviewsLoading.value = false }
}

const fetchProduct = async () => {
  loading.value = true
  try {
    const r = await fetch(`/api/catalog/product/${props.productId}`)
    product.value = await r.json()
    productStatus.value = product.value.status === 1
    if (product.value.name) fetchReviews(product.value.name)

    // Parse comma-separated multi-select values
    for (const k of ['style_bottom', 'activity', 'material', 'pattern', 'climate']) {
      if (typeof product.value[k] === 'string') product.value[k] = product.value[k].split(',')
    }
    // Normalize enums
    const stockMap = { 1: 'In Stock', 0: 'Out of Stock' }
    if (stockMap[product.value.stock_status] !== undefined) product.value.stock_status = stockMap[product.value.stock_status]
    const visMap = { 1: 'Not Visible Individually', 2: 'Catalog', 3: 'Search', 4: 'Catalog, Search' }
    if (visMap[product.value.visibility] !== undefined) product.value.visibility = visMap[product.value.visibility]

    // Mock configs
    configurations.value = [
      { name: `${product.value.name}-XS-Black`, sku: `${product.value.sku}-XS-Black`, price: product.value.price, quantity: 100, weight: 1, status: 'Enabled', attributes: 'Size: XS, Color: Black' },
      { name: `${product.value.name}-S-Black`, sku: `${product.value.sku}-S-Black`, price: product.value.price, quantity: 85, weight: 1, status: 'Enabled', attributes: 'Size: S, Color: Black' },
    ]
  } catch (e) { console.error('Fetch product error:', e) }
  finally { loading.value = false }
}

onMounted(() => { if (props.productId) fetchProduct() })
</script>

<style scoped>
.product-edit { padding: 0; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; background: #fff; padding: 16px 24px; border-bottom: 1px solid #e3e3e3; position: sticky; top: 0; z-index: 100; }
.header-left { display: flex; align-items: center; gap: 16px; }
.page-title { font-size: 24px; font-weight: 600; margin: 0; color: #333; }
.header-right { display: flex; gap: 12px; }
.save-button { background-color: #eb5202; border-color: #eb5202; }
.scope-switcher { padding: 10px 24px; background: #f4f5f7; display: flex; align-items: center; font-size: 13px; color: #666; gap: 8px; }
.form-section { background: #fff; padding: 24px; margin-bottom: 20px; border: 1px solid #d9d9d9; border-radius: 4px; max-width: 1000px; margin-left: auto; margin-right: auto; }
.enable-product-switch { margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
.field { margin-bottom: 16px; }
.field-label { font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #333; }
.required { color: #e02b27; margin-right: 2px; }
.link-text { font-size: 12px; color: #007bdb; cursor: pointer; margin-top: 4px; }
.page-content-wrapper { display: flex; align-items: flex-start; gap: 24px; max-width: 1200px; margin: 20px auto 0; padding: 0 20px; }
.main-content { flex: 1; min-width: 0; }
.edit-anchor-sidebar { width: 200px; flex-shrink: 0; padding-top: 24px; position: sticky; top: 80px; }
.no-image { width: 50px; height: 50px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
.upload-placeholder { border: 1px dashed #d9d9d9; padding: 40px; text-align: center; background: #fafafa; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; color: #999; }
</style>
