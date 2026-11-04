<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Orders Report</h1><el-button type="primary" style="background:#eb5202;border-color:#eb5202" @click="fetchR">Show Report</el-button></div>
    <div class="fs"><h3>Filter</h3>
      <div class="fr"><span class="fl">Period</span><el-select v-model="f.period" style="width:150px"><el-option label="Day" value="day"/><el-option label="Month" value="month"/><el-option label="Year" value="year"/></el-select></div>
      <div class="fr"><span class="fl">From</span><el-date-picker v-model="f.from" type="date" value-format="YYYY-MM-DD" style="width:150px"/></div>
      <div class="fr"><span class="fl">To</span><el-date-picker v-model="f.to" type="date" value-format="YYYY-MM-DD" style="width:150px"/></div>
      <div class="fr"><span class="fl">Status</span><el-select v-model="f.status" style="width:200px" clearable><el-option v-for="s in statuses" :key="s" :label="s" :value="s"/></el-select><span style="font-size:12px;color:#666;margin-left:12px">Applies to Any except canceled</span></div>
      <div class="fr"><span class="fl">Empty Rows</span><el-select v-model="f.emptyRows" style="width:150px"><el-option label="No" value="No"/><el-option label="Yes" value="Yes"/></el-select></div>
      <div class="fr"><span class="fl">Show Actual Values</span><el-select v-model="f.showActualValues" style="width:150px"><el-option label="No" value="No"/><el-option label="Yes" value="Yes"/></el-select></div>
    </div>
    <div class="eb"><span>Export to:</span><el-select style="width:80px;margin:0 8px"><el-option label="CSV" value="CSV"/><el-option label="Excel XML" value="Excel"/></el-select><el-button @click="handleExport">Export</el-button><el-popover trigger="click" placement="bottom-end" :width="220"><template #reference><el-button style="margin-left:8px"><el-icon><Setting /></el-icon> Columns</el-button></template><el-checkbox-group v-model="vis" style="display:flex;flex-direction:column"><el-checkbox v-for="c in allCols" :key="c.k" :value="c.k" style="margin-bottom:8px">{{c.t}}</el-checkbox></el-checkbox-group></el-popover></div>
    <div class="dt" v-if="hs"><div v-if="d.length===0" class="nr">0 records found</div>
      <el-table v-else :data="d" v-loading="l" border>
        <el-table-column v-if="vis.includes('period')" prop="period" label="Interval"/>
        <el-table-column v-if="vis.includes('orders_count')" prop="orders_count" label="Orders" align="right"/>
        <el-table-column v-if="vis.includes('sales_items')" prop="sales_items" label="Sales Items" align="right"/>
        <el-table-column v-if="vis.includes('sales_total')" prop="sales_total" label="Sales Total" align="right"><template #default="{row}">{{fc(row.sales_total)}}</template></el-table-column>
        <el-table-column v-if="vis.includes('invoiced')" prop="invoiced" label="Invoiced" align="right"><template #default="{row}">{{fc(row.invoiced)}}</template></el-table-column>
        <el-table-column v-if="vis.includes('refunded')" prop="refunded" label="Refunded" align="right"><template #default="{row}">{{fc(row.refunded)}}</template></el-table-column>
        <el-table-column v-if="vis.includes('sales_tax')" prop="sales_tax" label="Sales Tax" align="right"><template #default="{row}">{{fc(row.sales_tax)}}</template></el-table-column>
        <el-table-column v-if="vis.includes('sales_shipping')" prop="sales_shipping" label="Shipping" align="right"><template #default="{row}">{{fc(row.sales_shipping)}}</template></el-table-column>
        <el-table-column v-if="vis.includes('sales_discount')" prop="sales_discount" label="Discount" align="right"><template #default="{row}">{{fc(row.sales_discount)}}</template></el-table-column>
        <el-table-column v-if="vis.includes('canceled')" prop="canceled" label="Canceled" align="right"><template #default="{row}">{{fc(row.canceled)}}</template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>import {ref,reactive} from 'vue';import {Setting} from '@element-plus/icons-vue';import {ElMessage} from 'element-plus'
const l=ref(false),d=ref([]),hs=ref(false),f=reactive({period:null,from:null,to:null,status:null,emptyRows:null,showActualValues:null})
const statuses=['complete','processing','pending','holded','fraud','payment_review','pending_payment','pending_paypal']
const allCols=[{t:'Interval',k:'period'},{t:'Orders',k:'orders_count'},{t:'Sales Items',k:'sales_items'},{t:'Sales Total',k:'sales_total'},{t:'Invoiced',k:'invoiced'},{t:'Refunded',k:'refunded'},{t:'Tax',k:'sales_tax'},{t:'Shipping',k:'sales_shipping'},{t:'Discount',k:'sales_discount'},{t:'Canceled',k:'canceled'}]
const vis=ref(allCols.map(c=>c.k))
const fc=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v||0)
const handleExport=()=>ElMessage.success('Export successfully')
const fetchR=async()=>{l.value=true;hs.value=true;try{const p=new URLSearchParams();Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/reports/sales/orders?${p}`);d.value=await r.json()}catch(e){console.error(e)}finally{l.value=false}}
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.fs{background:#fff;padding:24px;margin-bottom:16px;border:1px solid #d9d9d9;border-radius:4px}.fs h3{font-size:16px;font-weight:600;margin:0 0 20px 0;border-bottom:1px solid #e3e3e3;padding-bottom:10px}.fr{display:flex;align-items:center;gap:12px;margin-bottom:16px}.fl{font-weight:600;font-size:13px;min-width:100px}.eb{display:flex;justify-content:flex-end;align-items:center;margin-bottom:10px;font-size:13px}.dt{background:#fff;padding:0;border:1px solid #d9d9d9;border-radius:4px}.nr{padding:20px;color:#333;font-size:13px}</style>
