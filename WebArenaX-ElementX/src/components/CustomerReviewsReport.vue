<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Customer Reviews Report</h1></div>
    <div class="fcard">
      <el-row :gutter="16">
        <el-col :span="8"><div class="fl">Customer</div><el-input v-model="f.customer_name" placeholder="Customer Name"/></el-col>
        <el-col :span="8"><div class="fl">Reviews</div><el-input v-model="f.review_count" placeholder="Count"/></el-col>
        <el-col :span="8" style="display:flex;align-items:flex-end"><div><el-button type="primary" @click="handleSearch">Search</el-button><el-button @click="handleReset">Reset Filter</el-button></div></el-col>
      </el-row>
    </div>
    <div class="eb"><span>Export to:</span><el-select v-model="ef" style="width:100px"><el-option label="CSV" value="csv"/><el-option label="Excel" value="excel"/></el-select><el-button @click="handleExport">Export</el-button></div>
    <div class="tcard">
      <el-table :data="rd" v-loading="l" border>
        <el-table-column prop="customer_name" label="Customer"/>
        <el-table-column prop="review_count" label="Reviews" width="100" align="right"/>
        <el-table-column label="Action" width="120"><template #default="{row}"><a href="#" @click.prevent="showReviews(row)">Show Reviews</a></template></el-table-column>
      </el-table>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:16px"><el-pagination v-model:current-page="pg.current" v-model:page-size="pg.pageSize" :total="pg.total" layout="total,prev,pager,next" @current-change="onP"/></div>
  </div>
</template>
<script setup>
import {ref,reactive,onMounted} from 'vue';import {ElMessage} from 'element-plus'
const emit=defineEmits(['navigate'])
const l=ref(false),rd=ref([]),ef=ref(undefined),f=reactive({customer_name:null,review_count:null}),pg=reactive({current:1,pageSize:20,total:0})
const handleExport=()=>ElMessage.success('Export successfully')
const handleSearch=()=>{pg.current=1;fetchData()}
const handleReset=()=>{f.customer_name=null;f.review_count=null;handleSearch()}
const onP=(p)=>{pg.current=p;fetchData()}
const showReviews=(r)=>{emit('navigate','marketing_all_reviews',{customer_id:r.customer_id})}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});if(f.customer_name)p.append('customer_name',f.customer_name);if(f.review_count)p.append('review_count',f.review_count);const r=await fetch(`/api/reports/customer-reviews?${p}`);const j=await r.json();rd.value=j.items||[];pg.total=j.total||0}catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>fetchData())
</script>
<style scoped>.p{padding:0}.ph{margin-bottom:24px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.fcard{background:#fff;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fl{font-weight:600;font-size:13px;margin-bottom:6px;color:#333}.eb{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-bottom:16px}.tcard{background:#fff;padding:0;border:1px solid #e3e3e3;border-radius:4px}</style>
