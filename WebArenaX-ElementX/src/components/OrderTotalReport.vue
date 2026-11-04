<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Order Total Report</h1></div>
    <div class="fs"><h3>Filter</h3>
      <div class="fr"><span class="fl">From</span><el-date-picker v-model="f.from" type="date" value-format="YYYY-MM-DD" style="width:150px"/></div>
      <div class="fr"><span class="fl">To</span><el-date-picker v-model="f.to" type="date" value-format="YYYY-MM-DD" style="width:150px"/></div>
      <div class="fr"><span class="fl">Period</span><el-select v-model="f.period" style="width:120px"><el-option label="Day" value="day"/><el-option label="Month" value="month"/><el-option label="Year" value="year"/></el-select></div>
      <el-button type="primary" @click="fetchR" :loading="l">Refresh</el-button>
    </div>
    <div class="eb"><span>Export to:</span><el-select style="width:80px;margin:0 8px"><el-option label="CSV" value="CSV"/></el-select><el-button @click="handleExport">Export</el-button><el-popover trigger="click" placement="bottom-end" :width="220"><template #reference><el-button style="margin-left:8px"><el-icon><Setting /></el-icon> Columns</el-button></template><el-checkbox-group v-model="vis" style="display:flex;flex-direction:column"><el-checkbox v-for="c in allCols" :key="c.k" :value="c.k" style="margin-bottom:8px">{{c.t}}</el-checkbox></el-checkbox-group></el-popover></div>
    <div class="dt" v-if="hs"><div v-if="rd.length===0" class="nr">0 records found</div>
      <el-table v-else :data="rd" v-loading="l" border>
        <el-table-column v-if="vis.includes('period')" label="Period"><template #default="{row,$index}"><span v-if="shouldShow($index)">{{row.period}}</span></template></el-table-column>
        <el-table-column v-if="vis.includes('customer_name')" prop="customer_name" label="Customer"/>
        <el-table-column v-if="vis.includes('orders_count')" prop="orders_count" label="Orders" align="right"/>
        <el-table-column v-if="vis.includes('average_order_value')" prop="average_order_value" label="Avg Order" align="right"/>
        <el-table-column v-if="vis.includes('total_order_value')" prop="total_order_value" label="Total" align="right"><template #default="{row}">{{fc(row.total_order_value)}}</template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>import {ref,reactive} from 'vue';import {Setting} from '@element-plus/icons-vue';import {ElMessage} from 'element-plus'
const l=ref(false),rd=ref([]),hs=ref(false),f=reactive({from:null,to:null,period:undefined})
const allCols=[{t:'Period',k:'period'},{t:'Customer',k:'customer_name'},{t:'Orders',k:'orders_count'},{t:'Avg Order',k:'average_order_value'},{t:'Total',k:'total_order_value'}]
const vis=ref(allCols.map(c=>c.k));const fc=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v||0)
const handleExport=()=>ElMessage.success('Export successfully')
let lastPeriod=null
const shouldShow=(idx)=>{if(idx===0){lastPeriod=rd.value[0]?.period;return true}const cur=rd.value[idx]?.period;if(cur!==lastPeriod){lastPeriod=cur;return true}return false}
const fetchR=async()=>{l.value=true;hs.value=true;try{const p=new URLSearchParams();Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/reports/order-total?${p}`);const j=await r.json();rd.value=(j.items||j).map((x,i)=>({...x,key:i}))}catch(e){console.error(e)}finally{l.value=false}}
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.fs{background:#fff;padding:24px;margin-bottom:16px;border:1px solid #d9d9d9;border-radius:4px}.fs h3{font-size:16px;font-weight:600;margin:0 0 20px 0;border-bottom:1px solid #e3e3e3;padding-bottom:10px}.fr{display:flex;align-items:center;gap:12px;margin-bottom:16px}.fl{font-weight:600;font-size:13px;min-width:100px}.eb{display:flex;justify-content:flex-end;align-items:center;margin-bottom:10px;font-size:13px}.dt{background:#fff;padding:0;border:1px solid #d9d9d9;border-radius:4px}.nr{padding:20px;color:#333;font-size:13px}</style>
