<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Shipping Report</h1><el-button type="primary" style="background:#eb5202;border-color:#eb5202" @click="fetchR">Show Report</el-button></div>
    <div class="fs"><h3>Filter</h3>
      <div class="fr"><span class="fl">Period</span><el-select v-model="f.period" style="width:150px"><el-option label="Day" value="day"/><el-option label="Month" value="month"/><el-option label="Year" value="year"/></el-select></div>
      <div class="fr"><span class="fl">From</span><el-date-picker v-model="f.from" type="date" value-format="YYYY-MM-DD" style="width:150px"/></div>
      <div class="fr"><span class="fl">To</span><el-date-picker v-model="f.to" type="date" value-format="YYYY-MM-DD" style="width:150px"/></div>
      <div class="fr"><span class="fl">Empty Rows</span><el-select v-model="f.emptyRows" style="width:150px"><el-option label="No" value="No"/><el-option label="Yes" value="Yes"/></el-select></div>
    </div>
    <div class="eb"><span>Export to:</span><el-select style="width:80px;margin:0 8px"><el-option label="CSV" value="CSV"/></el-select><el-button @click="handleExport">Export</el-button></div>
    <div class="dt" v-if="hs"><div v-if="d.length===0" class="nr">0 records found</div>
      <el-table v-else :data="d" v-loading="l" border>
        <el-table-column prop="period" label="Period"/><el-table-column prop="shipping_method" label="Method"/><el-table-column prop="orders_count" label="Orders" align="right"/><el-table-column prop="shipping_amount" label="Amount" align="right"/>
      </el-table>
    </div>
  </div>
</template>
<script setup>import {ref,reactive} from 'vue';import {ElMessage} from 'element-plus'
const l=ref(false),d=ref([]),hs=ref(false),f=reactive({period:undefined,from:undefined,to:undefined,emptyRows:undefined})
const handleExport=()=>ElMessage.success('Export successfully')
const fetchR=async()=>{l.value=true;hs.value=true;try{const p=new URLSearchParams();Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/reports/shipping?${p}`);d.value=await r.json()}catch(e){console.error(e)}finally{l.value=false}}
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.fs{background:#fff;padding:24px;margin-bottom:16px;border:1px solid #d9d9d9;border-radius:4px}.fs h3{font-size:16px;font-weight:600;margin:0 0 20px 0;border-bottom:1px solid #e3e3e3;padding-bottom:10px}.fr{display:flex;align-items:center;gap:12px;margin-bottom:16px}.fl{font-weight:600;font-size:13px;min-width:100px}.eb{display:flex;justify-content:flex-end;align-items:center;margin-bottom:10px;font-size:13px}.dt{background:#fff;padding:0;border:1px solid #d9d9d9;border-radius:4px}.nr{padding:20px;color:#333;font-size:13px}</style>
