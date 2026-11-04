<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Product Reviews Report</h1></div>
    <div class="fcard">
      <el-row :gutter="16">
        <el-col :span="4"><div class="fl">ID</div><el-input v-model="f.id" placeholder="ID"/></el-col>
        <el-col :span="4"><div class="fl">Product</div><el-input v-model="f.product" placeholder="Product Name"/></el-col>
        <el-col :span="4"><div class="fl">Reviews</div><el-input v-model="f.reviews_count" placeholder="Count"/></el-col>
        <el-col :span="4"><div class="fl">Average</div><el-input v-model="f.avg_rating" placeholder="Average"/></el-col>
        <el-col :span="4"><div class="fl">Avg (Approved)</div><el-input v-model="f.avg_rating_approved" placeholder="Avg (Approved)"/></el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top:12px">
        <el-col :span="4"><div class="fl">Last Review From</div><el-date-picker v-model="f.last_review_from" type="date" value-format="YYYY-MM-DD" style="width:100%"/></el-col>
        <el-col :span="4"><div class="fl">Last Review To</div><el-date-picker v-model="f.last_review_to" type="date" value-format="YYYY-MM-DD" style="width:100%"/></el-col>
        <el-col :span="8" style="display:flex;align-items:flex-end"><div><el-button type="primary" @click="handleSearch">Search</el-button><el-button @click="handleReset">Reset Filter</el-button></div></el-col>
      </el-row>
    </div>
    <div class="eb"><span>Export to:</span><el-select v-model="ef" style="width:100px"><el-option label="CSV" value="csv"/><el-option label="Excel" value="excel"/></el-select><el-button @click="handleExport">Export</el-button></div>
    <div class="tcard">
      <el-table :data="rd" v-loading="l" border @row-click="onRow" style="cursor:pointer">
        <el-table-column prop="product_id" label="ID" width="80"/>
        <el-table-column prop="product_name" label="Product"/>
        <el-table-column prop="review_count" label="Reviews" width="100" align="right"/>
        <el-table-column label="Average" width="120" align="right"><template #default="{row}">{{fn(row.avg_rating)}}</template></el-table-column>
        <el-table-column label="Average (Approved)" width="150" align="right"><template #default="{row}">{{fn(row.avg_rating_approved)}}</template></el-table-column>
        <el-table-column label="Last Review" width="180"><template #default="{row}">{{fd(row.last_review)}}</template></el-table-column>
        <el-table-column label="Action" width="120"><template #default="{row}"><a href="#" @click.prevent.stop="showReviews(row)">Show Reviews</a></template></el-table-column>
      </el-table>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:16px"><el-pagination v-model:current-page="pg.current" v-model:page-size="pg.pageSize" :total="pg.total" layout="total,prev,pager,next" @current-change="onP"/></div>
  </div>
</template>
<script setup>
import {ref,reactive,onMounted} from 'vue';import dayjs from 'dayjs';import {ElMessage} from 'element-plus'
const emit=defineEmits(['navigate'])
const l=ref(false),rd=ref([]),ef=ref(undefined),f=reactive({id:null,product:null,reviews_count:null,avg_rating:null,avg_rating_approved:null,last_review_from:null,last_review_to:null}),pg=reactive({current:1,pageSize:20,total:0})
const fn=v=>v==null?'N/A':parseFloat(v).toFixed(4);const fd=v=>v?dayjs(v).format('MMM D, YYYY, h:mm:ss A'):''
const handleExport=()=>ElMessage.success('Export successfully')
const handleSearch=()=>{pg.current=1;fetchData()}
const handleReset=()=>{Object.keys(f).forEach(k=>f[k]=null);handleSearch()}
const onP=(p)=>{pg.current=p;fetchData()}
const onRow=(r)=>{showReviews(r)}
const showReviews=(r)=>{emit('navigate','marketing_all_reviews',{product:r.product_name})}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/reports/product-reviews?${p}`);const j=await r.json();rd.value=j.items||[];pg.total=j.total||0}catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>fetchData())
</script>
<style scoped>.p{padding:0}.ph{margin-bottom:24px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.fcard{background:#fff;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fl{font-weight:600;font-size:13px;margin-bottom:6px;color:#333}.eb{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-bottom:16px}.tcard{background:#fff;padding:0;border:1px solid #e3e3e3;border-radius:4px}</style>
