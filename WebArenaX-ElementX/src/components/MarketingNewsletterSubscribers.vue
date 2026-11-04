<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Newsletter Subscribers</h1></div>
    <div class="bar"><div class="tools"><el-button @click="sf=!sf"><el-icon><Filter /></el-icon> Filters</el-button></div></div>
    <div v-if="sf" class="fsec">
      <el-row :gutter="16">
        <el-col :span="6"><div class="fl">ID</div><div style="display:flex;gap:8px"><el-input v-model="f.subscriber_id_from" placeholder="from" size="small"/><el-input v-model="f.subscriber_id_to" placeholder="to" size="small"/></div></el-col>
        <el-col :span="6"><div class="fl">Email</div><el-input v-model="f.subscriber_email" size="small"/></el-col>
        <el-col :span="6"><div class="fl">Status</div><el-select v-model="f.subscriber_status" clearable size="small" style="width:100%"><el-option label="Subscribed" value="Subscribed"/><el-option label="Not Activated" value="Not Activated"/><el-option label="Unsubscribed" value="Unsubscribed"/><el-option label="Unconfirmed" value="Unconfirmed"/></el-select></el-col>
      </el-row>
      <div class="fa"><el-button @click="reset">Cancel</el-button><el-button type="primary" @click="apply">Apply Filters</el-button></div>
    </div>
    <div class="tc"><span class="rc">{{ t }} records found</span><div class="right"><el-select v-model="pg.pageSize" style="width:80px" size="small" @change="onPs"><el-option v-for="s in [20,50,100,200]" :key="s" :label="s" :value="s"/></el-select><span class="rc" style="margin-left:8px">per page</span><el-pagination v-model:current-page="pg.current" :total="t" :page-size="pg.pageSize" layout="prev,pager,next" small @current-change="onP"/></div></div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border stripe>
        <el-table-column prop="subscriber_id" label="ID" width="80"/>
        <el-table-column prop="subscriber_email" label="Email" width="220"/>
        <el-table-column prop="customer_name" label="Customer" width="150"/>
        <el-table-column prop="subscriber_status" label="Status" width="120"/>
        <el-table-column prop="store_id" label="Store" width="80"/>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'; import { Filter } from '@element-plus/icons-vue'
const l=ref(false),d=ref([]),sf=ref(true),t=ref(0)
const f=reactive({subscriber_id_from:'',subscriber_id_to:'',subscriber_email:'',subscriber_status:undefined})
const pg=reactive({current:1,pageSize:20})
const apply=()=>{pg.current=1;fetchData()};const reset=()=>{f.subscriber_id_from='';f.subscriber_id_to='';f.subscriber_email='';f.subscriber_status=undefined;sf.value=false;fetchData()}
const onP=(p)=>{pg.current=p;fetchData()};const onPs=()=>{pg.current=1;fetchData()}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/marketing/newsletter-subscribers?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0}catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>fetchData())
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.bar{display:flex;align-items:center;margin-bottom:16px;background:#f5f5f5;padding:12px;border:1px solid #e3e3e3;border-radius:4px;justify-content:flex-end}.tools{display:flex;gap:8px}.fsec{background:#f5f5f5;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fl{font-weight:600;font-size:12px;margin-bottom:6px;color:#333}.fa{display:flex;justify-content:flex-end;margin-top:12px;gap:8px}.tc{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.rc{color:#666;font-size:13px}.right{display:flex;align-items:center;gap:0}.tcard{background:#fff;padding:16px;border:1px solid #e3e3e3;border-radius:4px}</style>
