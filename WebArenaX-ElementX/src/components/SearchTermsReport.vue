<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Search Terms Report</h1></div>
    <div class="bar">
      <div class="search-box">
        <el-button type="primary" style="background:#eb5202;border-color:#eb5202" @click="handleSearch">Search</el-button>
        <el-button text @click="resetFilters">Reset Filter</el-button>
        <span class="rc" v-if="t!==undefined">{{ t }} records found</span>
      </div>
      <div class="tr">
        <el-select v-model="pg.pageSize" style="width:70px" @change="onPs"><el-option :value="20" label="20"/><el-option :value="50" label="50"/><el-option :value="100" label="100"/></el-select>
        <span class="rc" style="margin:0 8px">per page</span>
        <el-pagination v-model:current-page="pg.current" :total="t" :page-size="pg.pageSize" layout="prev,next" small @current-change="onP"/>
        <span style="margin:0 16px">Export to:</span><el-select style="width:80px;margin-right:8px"><el-option label="CSV" value="CSV"/><el-option label="Excel" value="Excel"/></el-select><el-button @click="handleExport">Export</el-button>
      </div>
    </div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border @sort-change="onSort">
        <el-table-column prop="query_id" label="ID" width="80" sortable="custom"/>
        <el-table-column label="Search Query" sortable="custom">
          <template #header><div>Search Query<div style="margin-top:4px;font-weight:normal"><el-input v-model="f.query_text" placeholder="" size="small" @keyup.enter="handleSearch"/></div></div></template>
          <template #default="{row}">{{row.query_text}}</template>
        </el-table-column>
        <el-table-column label="Store" sortable="custom">
          <template #header><div>Store<div style="margin-top:4px;font-weight:normal"><el-select v-model="f.store_id" size="small" style="width:100%" clearable @change="handleSearch"><el-option label="All Store Views" :value="null"/></el-select></div></div></template>
          <template #default="{row}">{{getStore(row.store_id)}}</template>
        </el-table-column>
        <el-table-column label="Results" width="150" sortable="custom">
          <template #header><div>Results<div style="margin-top:4px;font-weight:normal"><div style="display:flex;flex-direction:column;gap:4px"><el-input v-model="f.num_results_from" placeholder="From" size="small" @keyup.enter="handleSearch"/><el-input v-model="f.num_results_to" placeholder="To" size="small" @keyup.enter="handleSearch"/></div></div></div></template>
          <template #default="{row}">{{row.num_results}}</template>
        </el-table-column>
        <el-table-column label="Hits" width="150" sortable="custom">
          <template #header><div>Hits<div style="margin-top:4px;font-weight:normal"><div style="display:flex;flex-direction:column;gap:4px"><el-input v-model="f.popularity_from" placeholder="From" size="small" @keyup.enter="handleSearch"/><el-input v-model="f.popularity_to" placeholder="To" size="small" @keyup.enter="handleSearch"/></div></div></div></template>
          <template #default="{row}">{{row.popularity}}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import {ref,reactive,onMounted} from 'vue';import {ElMessage} from 'element-plus'
const l=ref(false),d=ref([]),t=ref(0)
const pg=reactive({current:1,pageSize:20})
const f=reactive({query_text:'',store_id:null,num_results_from:'',num_results_to:'',popularity_from:'',popularity_to:''})
const sort=reactive({field:'',order:''})
const getStore=(id)=>id==1?'Main Website\nMain Website Store\nDefault Store View':`Store ID: ${id}`
const handleExport=()=>ElMessage.success('Export successfully')
const handleSearch=()=>{pg.current=1;fetchData()}
const resetFilters=()=>{f.query_text='';f.store_id=null;f.num_results_from='';f.num_results_to='';f.popularity_from='';f.popularity_to='';sort.field='';sort.order='';handleSearch()}
const onP=(p)=>{pg.current=p;fetchData()};const onPs=()=>{pg.current=1;fetchData()}
const onSort=({prop,order})=>{sort.field=order?prop:'';sort.order=order||'';fetchData()}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});if(sort.field)p.append('sortField',sort.field);if(sort.order)p.append('sortOrder',sort.order);const r=await fetch(`/api/search-terms?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0}catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>fetchData())
</script>
<style scoped>.p{padding:0}.ph{margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;background:#fff;padding:10px;border:1px solid #e3e3e3;border-radius:4px}.search-box{display:flex;align-items:center;gap:10px}.rc{color:#666;font-size:13px}.tr{display:flex;align-items:center}.tcard{background:#fff;border:1px solid #e3e3e3;border-radius:4px}:deep(.el-table th){background:#514943;color:#fff;font-weight:600}:deep(.el-table th .el-input__inner){border-radius:0}</style>
