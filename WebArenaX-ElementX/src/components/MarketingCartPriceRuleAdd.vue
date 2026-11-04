<template>
  <div class="p">
    <div class="ph"><h1 class="pt">New Cart Price Rule</h1>
      <div class="ha"><el-button @click="goBack"><el-icon><ArrowLeft /></el-icon> Back</el-button><el-button @click="handleReset">Reset</el-button><el-button>Save and Continue Edit</el-button><el-button type="primary" style="background:#eb5202;border-color:#eb5202" @click="handleSave">Save</el-button></div>
    </div>
    <div class="fc">
      <h3 class="st">Rule Information</h3>
      <div class="fr"><span class="fl">Rule Name</span><el-input v-model="fs.name" style="width:400px"/></div>
      <div class="fr"><span class="fl">Description</span><el-input v-model="fs.description" type="textarea" :rows="4" style="width:400px"/></div>
      <div class="fr"><span class="fl">Active</span><el-switch v-model="fs.is_active"/></div>
      <div class="fr"><span class="fl">Websites</span><el-select v-model="fs.website_ids" multiple placeholder="Select Websites" style="width:400px"><el-option label="Main Website" value="1"/></el-select></div>
      <div class="fr"><span class="fl">Customer Groups</span><el-select v-model="fs.customer_group_ids" multiple placeholder="Select Customer Groups" style="width:400px"><el-option v-for="g in groups" :key="g" :label="g" :value="g"/></el-select></div>
      <div class="fr"><span class="fl">Coupon</span><el-select v-model="fs.coupon_type" style="width:200px"><el-option label="No Coupon" value="No Coupon"/><el-option label="Specific Coupon" value="Specific Coupon"/></el-select></div>
      <div class="fr"><span class="fl">Coupon Code</span><el-input v-model="fs.coupon_code" style="width:400px" placeholder="Leave blank for auto-generation"/></div>
      <div class="fr"><span class="fl">Uses per Customer</span><el-input v-model="fs.uses_per_customer" style="width:200px"/><div style="font-size:12px;color:#999;margin-left:12px">Usage limit enforced for logged in customers only.</div></div>
      <div class="fr"><span class="fl">From</span><el-date-picker v-model="fs.from_date" type="date" value-format="YYYY-MM-DD"/></div>
      <div class="fr"><span class="fl">To</span><el-date-picker v-model="fs.to_date" type="date" value-format="YYYY-MM-DD"/></div>
      <div class="fr"><span class="fl">Priority</span><el-input-number v-model="fs.sort_order" style="width:200px"/></div>
      <div class="fr"><span class="fl">Public In RSS Feed</span><el-switch v-model="fs.is_rss"/></div>
      <el-divider/>
      <h3 class="st">Actions</h3>
      <div class="fr"><span class="fl">Apply</span><el-select v-model="fs.simple_action" style="width:300px"><el-option label="Apply as percentage of original" value="by_percent"/><el-option label="Apply as fixed amount" value="by_fixed"/><el-option label="Fixed amount discount for whole cart" value="cart_fixed"/><el-option label="Buy X get Y free" value="buy_x_get_y"/></el-select></div>
      <div class="fr"><span class="fl">Discount Amount</span><el-input-number v-model="fs.discount_amount" style="width:200px"/></div>
      <div class="fr"><span class="fl">Stop Further Rules</span><el-switch v-model="fs.stop_rules_processing"/></div>
    </div>
  </div>
</template>
<script setup>
import {reactive} from 'vue';import {ArrowLeft} from '@element-plus/icons-vue';import {ElMessage} from 'element-plus'
const emit=defineEmits(['navigate']);const groups=['NOT LOGGED IN','General','Wholesale','Retailer']
const fs=reactive({name:'',description:'',is_active:true,website_ids:[],customer_group_ids:[],coupon_type:'No Coupon',coupon_code:'',uses_per_customer:'',from_date:null,to_date:null,sort_order:0,is_rss:false,simple_action:'by_percent',discount_amount:0,stop_rules_processing:false,rule_id:Date.now()})
const goBack=()=>emit('navigate','marketing_cart_price_rules')
const handleReset=()=>{Object.keys(fs).forEach(k=>{if(k==='rule_id')return;if(typeof fs[k]==='boolean')fs[k]=false;else if(Array.isArray(fs[k]))fs[k]=[];else if(typeof fs[k]==='number')fs[k]=0;else fs[k]=''});fs.is_active=true}
const handleSave=()=>{if(!window.__edits__)window.__edits__={};window.__edits__[`cartrule_${fs.rule_id}`]={...fs};ElMessage.success('Rule saved.');emit('navigate','marketing_cart_price_rules')}
</script>
<style scoped>.p{padding:24px;min-height:100vh}.ph{display:flex;justify-content:space-between;align-items:center;background:#fff;padding:16px 24px;margin:-24px -24px 24px;border-bottom:1px solid #e3e3e3}.pt{font-size:24px;font-weight:300;margin:0;color:#333}.ha{display:flex;gap:8px}.fc{background:#fff;padding:24px;border:1px solid #e3e3e3;border-radius:4px;max-width:800px}.st{font-size:18px;font-weight:500;margin:0 0 24px 0;padding-bottom:12px;border-bottom:1px solid #e3e3e3}.fr{display:flex;align-items:center;gap:12px;margin-bottom:16px}.fl{font-weight:600;font-size:13px;min-width:150px}</style>
